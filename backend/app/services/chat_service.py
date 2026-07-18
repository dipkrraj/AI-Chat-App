from sqlalchemy.orm import Session
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas import user as user_schemas
from app.schemas import conversation as conv_schemas
from app.schemas import message as msg_schemas

# --- User Services ---

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: user_schemas.UserCreate):
    db_user = User(username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Conversation Services ---

def get_conversation(db: Session, conversation_id: int):
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()

def get_conversations_by_user(db: Session, user_id: int):
    return db.query(Conversation).filter(Conversation.user_id == user_id).order_by(Conversation.created_at.desc()).all()

def create_conversation(db: Session, conv: conv_schemas.ConversationCreate):
    db_conv = Conversation(title=conv.title, user_id=conv.user_id)
    db.add(db_conv)
    db.commit()
    db.refresh(db_conv)
    return db_conv

# --- Message Services ---

def get_messages_by_conversation(db: Session, conversation_id: int):
    return db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()

def create_message(db: Session, msg: msg_schemas.MessageCreate, conversation_id: int):
    db_msg = Message(
        sender=msg.sender,
        content=msg.content,
        conversation_id=conversation_id
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return db_msg

def update_conversation_model(db: Session, conversation_id: int, model: str):
    db_conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if db_conv:
        db_conv.model = model
        db.commit()
        db.refresh(db_conv)
    return db_conv

def delete_messages_by_conversation(db: Session, conversation_id: int):
    db.query(Message).filter(Message.conversation_id == conversation_id).delete()
    db.commit()
