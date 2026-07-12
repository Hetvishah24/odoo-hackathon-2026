from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.trips.models import TripStatus


class TripCreate(BaseModel):
    source: str = Field(min_length=1, max_length=255)
    destination: str = Field(min_length=1, max_length=255)
    vehicle_id: int
    driver_id: int
    cargo_weight: float = Field(gt=0)
    planned_distance: float = Field(gt=0)


class TripUpdate(BaseModel):
    source: str | None = Field(default=None, min_length=1, max_length=255)
    destination: str | None = Field(default=None, min_length=1, max_length=255)
    vehicle_id: int | None = None
    driver_id: int | None = None
    cargo_weight: float | None = Field(default=None, gt=0)
    planned_distance: float | None = Field(default=None, gt=0)


class TripComplete(BaseModel):
    end_odometer: float = Field(ge=0)
    fuel_consumed: float = Field(ge=0)
    actual_distance: float = Field(ge=0)


class TripRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float
    actual_distance: float | None
    start_odometer: float | None
    end_odometer: float | None
    fuel_consumed: float | None
    status: TripStatus
    created_by: int
    created_at: datetime
    updated_at: datetime
