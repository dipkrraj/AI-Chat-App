from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class GoogleLoginRequest(BaseModel):
    credential: str

class User(UserBase):
    id: int
    picture: Optional[str] = None
    created_at: datetime

    # Config to support SQLAlchemy model conversion
    model_config = ConfigDict(from_attributes=True)