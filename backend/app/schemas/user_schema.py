from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    # Basic user information
    first_name: str
    last_name: str
    email: EmailStr

class UserCreate(UserBase):
    # Additional field needed for registration
    password: str

class UserRead(UserBase):
    # Fields returned when reading user data from database
    user_id: int
    date_created: datetime
    date_deleted: Optional[datetime] = None

    # Allow reading from SQLAlchemy model attributes
    model_config = {"from_attributes": True}

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
    password: str       # send again for final account creation
    first_name: str
    last_name: str
        
class ResendOTPRequest(BaseModel):
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyLoginOTPRequest(BaseModel):
    email: EmailStr
    code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"