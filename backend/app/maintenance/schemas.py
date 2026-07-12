import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.maintenance.models import MaintenanceStatus


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    description: str = Field(min_length=1)
    cost: float = Field(ge=0)
    opened_at: datetime.datetime


class MaintenanceUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1)
    cost: float | None = Field(default=None, ge=0)
    opened_at: datetime.datetime | None = None


class MaintenanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    description: str
    cost: float
    opened_at: datetime.datetime
    closed_at: datetime.datetime | None
    status: MaintenanceStatus
    created_by: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
