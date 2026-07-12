import datetime

from pydantic import BaseModel, ConfigDict, Field

# Fields are named `date`; annotate via the `datetime` module rather than a bare `date`
# import, otherwise Pydantic's type-hint resolution shadows the type with the field itself.


class FuelLogCreate(BaseModel):
    vehicle_id: int
    trip_id: int | None = None
    liters: float = Field(gt=0)
    cost: float = Field(ge=0)
    date: datetime.date


class FuelLogUpdate(BaseModel):
    vehicle_id: int | None = None
    trip_id: int | None = None
    liters: float | None = Field(default=None, gt=0)
    cost: float | None = Field(default=None, ge=0)
    date: datetime.date | None = None


class FuelLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    trip_id: int | None
    liters: float
    cost: float
    date: datetime.date
    created_by: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
