from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# Pydantic models for user data transfer objects (DTOs)
class UserBase(BaseModel):
    # Basic user information
    first_name: str
    last_name: str
    email: EmailStr

# UserCreate extends UserBase and adds a password field for user registration
class UserCreate(UserBase):
    # Additional field needed for registration
    password: str

# UserRead extends UserBase and includes additional fields for reading user data, such as user_id, date_created, and date_deleted
class UserRead(UserBase):
    # Fields returned when reading user data from database
    user_id: int
    date_created: datetime
    date_deleted: Optional[datetime] = None

    # Allow reading from SQLAlchemy model attributes
    model_config = {"from_attributes": True}

#  Separate request model for OTP verification during registration, which includes email, OTP code, password, and user details for final account creation after OTP verification
class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str
    password: str      
    first_name: str
    last_name: str

 # Separate request model for resending OTP, which only requires the user's email address       
class ResendOTPRequest(BaseModel):
    email: EmailStr

# Separate request model for login, which includes email and password fields for user authentication
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Separate request model for verifying login OTP, which includes email and OTP code
class VerifyLoginOTPRequest(BaseModel):
    email: EmailStr
    code: str

# Response model for successful login, containing the access token and token type
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PreferenceUpdateRequest(BaseModel):
    preferred_categories: list[str] = Field(min_length=1)