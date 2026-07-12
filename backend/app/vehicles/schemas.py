from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.vehicles.models import VehicleStatus, VehicleType


class VehicleCreate(BaseModel):
    registration_number: str = Field(min_length=1, max_length=50)
    name_model: str = Field(min_length=1, max_length=255)
    type: VehicleType
    max_load_capacity: float = Field(gt=0)
    odometer: float = Field(default=0.0, ge=0)
    acquisition_cost: float = Field(ge=0)
    revenue_per_km: float = Field(default=0.0, ge=0)
    status: VehicleStatus = VehicleStatus.available
    region: str | None = Field(default=None, max_length=100)


class VehicleUpdate(BaseModel):
    registration_number: str | None = Field(default=None, min_length=1, max_length=50)
    name_model: str | None = Field(default=None, min_length=1, max_length=255)
    type: VehicleType | None = None
    max_load_capacity: float | None = Field(default=None, gt=0)
    odometer: float | None = Field(default=None, ge=0)
    acquisition_cost: float | None = Field(default=None, ge=0)
    revenue_per_km: float | None = Field(default=None, ge=0)
    status: VehicleStatus | None = None
    region: str | None = Field(default=None, max_length=100)


class VehicleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    registration_number: str
    name_model: str
    type: VehicleType
    max_load_capacity: float
    odometer: float
    acquisition_cost: float
    revenue_per_km: float
    status: VehicleStatus
    region: str | None
    created_at: datetime
    updated_at: datetime
