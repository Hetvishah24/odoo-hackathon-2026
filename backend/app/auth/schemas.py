from enum import Enum

from pydantic import BaseModel, EmailStr, Field

from app.db.seed import (
    DRIVER_ROLE,
    FINANCIAL_ANALYST_ROLE,
    FLEET_MANAGER_ROLE,
    SAFETY_OFFICER_ROLE,
)


class RegisterableRole(str, Enum):
    """Roles a user may self-assign at signup. Admin is provisioned separately."""

    fleet_manager = FLEET_MANAGER_ROLE
    driver = DRIVER_ROLE
    safety_officer = SAFETY_OFFICER_ROLE
    financial_analyst = FINANCIAL_ANALYST_ROLE


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=1, max_length=255)
    role: RegisterableRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class MeUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=72)
    contact_number: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=100)
