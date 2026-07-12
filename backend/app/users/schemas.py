from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.roles.schemas import RoleRead

# bcrypt only uses the first 72 bytes of a password
PasswordField = Field(min_length=8, max_length=72)


class UserCreate(BaseModel):
    email: EmailStr
    password: str = PasswordField
    full_name: str = Field(min_length=1, max_length=255)
    contact_number: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=100)
    role_id: int | None = None
    is_active: bool = True


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=72)
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    contact_number: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=100)
    role_id: int | None = None
    is_active: bool | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    contact_number: str | None
    region: str | None
    is_active: bool
    role: RoleRead | None
    created_at: datetime
