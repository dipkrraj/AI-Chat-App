from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from app.schemas.message import Message

class ConversationBase(BaseModel):
    title: str
    model: Optional[str] = "llama-3.1-8b-instant"

class ConversationCreate(ConversationBase):
    user_id: Optional[int] = None

class Conversation(ConversationBase):
    id: int
    user_id: int
    created_at: datetime
    messages: List[Message] = []

    model_config = ConfigDict(from_attributes=True)