from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database.database import get_db
from app.schemas import conversation as conv_schemas
from app.schemas import message as msg_schemas
from app.services import chat_service, ai_service
from app.services import auth_service
from app.models.user import User

router = APIRouter()

# --- Database-Backed Multi-Conversation Routes ---

@router.get("/api/conversations", response_model=List[conv_schemas.Conversation])
def read_conversations(current_user: User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Retrieve all conversations for the authorized user."""
    return chat_service.get_conversations_by_user(db, current_user.id)

@router.post("/api/conversations", response_model=conv_schemas.Conversation)
def create_conversation(conv_create: conv_schemas.ConversationBase, current_user: User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Create a new chat conversation session for the authorized user."""
    full_conv = conv_schemas.ConversationCreate(title=conv_create.title, user_id=current_user.id, model=conv_create.model)
    return chat_service.create_conversation(db, full_conv)

@router.get("/api/conversations/{conversation_id}/messages", response_model=List[msg_schemas.Message])
def read_messages(conversation_id: int, current_user: User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Get all messages associated with a conversation belonging to the authorized user."""
    conversation = chat_service.get_conversation(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    return chat_service.get_messages_by_conversation(db, conversation_id)

@router.get("/api/models")
def get_models(current_user: User = Depends(auth_service.get_current_user)):
    """Retrieve lists of available AI models and their active status based on env keys."""
    return ai_service.get_available_models()

class UpdateModelRequest(BaseModel):
    model: str

@router.patch("/api/conversations/{conversation_id}/model", response_model=conv_schemas.Conversation)
def patch_conversation_model(conversation_id: int, request: UpdateModelRequest, current_user: User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Update the active AI model for this conversation session."""
    conversation = chat_service.get_conversation(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    
    if request.model not in ai_service.SUPPORTED_MODELS:
        raise HTTPException(status_code=400, detail="Unsupported AI model selection")
        
    return chat_service.update_conversation_model(db, conversation_id, request.model)

@router.post("/api/conversations/{conversation_id}/messages", response_model=msg_schemas.Message)
def send_message(msg_in: msg_schemas.MessageCreate, conversation_id: int, current_user: User = Depends(auth_service.get_current_user), db: Session = Depends(get_db)):
    """Send a user message in a conversation, trigger AI response with full memory context, save both, and return bot response."""
    conversation = chat_service.get_conversation(db, conversation_id)
    if not conversation or conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation session not found")
    
    # 1. Save user message to database
    chat_service.create_message(db, msg_in, conversation_id)
    
    # 2. Retrieve full conversation history (which now includes the user message we just saved)
    history_messages = chat_service.get_messages_by_conversation(db, conversation_id)
    
    # Format message history to standard OpenAI format
    formatted_history = [
        {
            "role": "user" if m.sender == "user" else "assistant",
            "content": m.content
        }
        for m in history_messages
    ]
    
    # 3. Handle context size. If history > 8 messages, summarize older history.
    if len(formatted_history) > 8:
        older_history = formatted_history[:-5]
        immediate_history = formatted_history[-5:]
        summary = ai_service.summarize_messages(older_history, conversation.model)
        payload = [
            {
                "role": "system",
                "content": f"Summary of the earlier conversation: {summary}"
            }
        ] + immediate_history
    else:
        payload = formatted_history
    
    # 4. Ask the AI service for a response using the selected model & context payload
    bot_reply_content = ai_service.generate_bot_response(payload, conversation.model)
    
    # 5. Save bot assistant message to database
    bot_msg_schema = msg_schemas.MessageCreate(sender="assistant", content=bot_reply_content)
    bot_msg = chat_service.create_message(db, bot_msg_schema, conversation_id)
    
    return bot_msg


# --- Backwards Compatibility Endpoint ---
# Allows testing the single-page chat without using the database layer

class FlatMessage(BaseModel):
    role: str
    content: str

class FlatChatRequest(BaseModel):
    messages: List[FlatMessage]

class FlatChatResponse(BaseModel):
    role: str
    content: str

@router.post("/api/chat", response_model=FlatChatResponse)
def flat_chat(request: FlatChatRequest):
    """Simple stateless chat endpoint matching the original design."""
    last_content = request.messages[-1].content if request.messages else "Hello"
    bot_reply = ai_service.generate_bot_response(last_content)
    return FlatChatResponse(role="assistant", content=bot_reply)
