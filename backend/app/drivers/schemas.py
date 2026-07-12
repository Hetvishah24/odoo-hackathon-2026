from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.drivers.models import DriverStatus


class DriverCreate(BaseModel):
    user_id: int | None = None
    name: str = Field(min_length=1, max_length=255)
    license_number: str = Field(min_length=1, max_length=50)
    license_category: str = Field(min_length=1, max_length=50)
    license_expiry_date: date
    contact_number: str = Field(min_length=1, max_length=20)
    safety_score: float = Field(default=100.0, ge=0, le=100)
    status: DriverStatus = DriverStatus.available
    region: str | None = Field(default=None, max_length=100)


class DriverProfileCreate(BaseModel):
    """Role-specific details collected from a driver right after registration."""

    name: str = Field(min_length=1, max_length=255)
    license_number: str = Field(min_length=1, max_length=50)
    license_category: str = Field(min_length=1, max_length=50)
    license_expiry_date: date
    contact_number: str = Field(min_length=1, max_length=20)
    region: str | None = Field(default=None, max_length=100)


class DriverUpdate(BaseModel):
    user_id: int | None = None
    name: str | None = Field(default=None, min_length=1, max_length=255)
    license_number: str | None = Field(default=None, min_length=1, max_length=50)
    license_category: str | None = Field(default=None, min_length=1, max_length=50)
    license_expiry_date: date | None = None
    contact_number: str | None = Field(default=None, min_length=1, max_length=20)
    safety_score: float | None = Field(default=None, ge=0, le=100)
    status: DriverStatus | None = None
    region: str | None = Field(default=None, max_length=100)


class DriverRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: float
    status: DriverStatus
    region: str | None
    created_at: datetime
    updated_at: datetime
