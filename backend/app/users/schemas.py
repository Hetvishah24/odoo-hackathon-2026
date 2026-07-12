from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.drivers.schemas import DriverRead
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
    is_approved: bool = False
    is_profile_complete: bool = False


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8, max_length=72)
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    contact_number: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=100)
    role_id: int | None = None
    is_active: bool | None = None
    is_approved: bool | None = None
    is_profile_complete: bool | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    contact_number: str | None
    region: str | None
    is_active: bool
    is_approved: bool
    is_profile_complete: bool
    role: RoleRead | None
    created_at: datetime


class ProfileCompletionRequest(BaseModel):
    """Step-2 registration payload. Which fields are required is driven by the
    caller's role (see ROLE_PROFILE_REQUIRED_FIELDS in app/users/router.py) —
    one dynamic endpoint for every role instead of a router per role.
    """

    contact_number: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=100)
    license_number: str | None = Field(default=None, min_length=1, max_length=50)
    license_category: str | None = Field(default=None, min_length=1, max_length=50)
    license_expiry_date: date | None = None


class MyProfileResponse(BaseModel):
    user: UserRead
    driver: DriverRead | None = None
