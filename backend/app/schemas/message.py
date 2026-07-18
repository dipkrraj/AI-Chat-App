from datetime import datetime
from pydantic import BaseModel, ConfigDict

class MessageBase(BaseModel):
    sender: str  # "user" or "assistant"
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    conversation_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)