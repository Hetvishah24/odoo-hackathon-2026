import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.expenses.models import ExpenseType

# Fields are named `date`; annotate via the `datetime` module rather than a bare `date`
# import, otherwise Pydantic's type-hint resolution shadows the type with the field itself.


class ExpenseCreate(BaseModel):
    vehicle_id: int | None = None
    trip_id: int | None = None
    type: ExpenseType
    amount: float = Field(gt=0)
    date: datetime.date
    description: str | None = Field(default=None, max_length=500)


class ExpenseUpdate(BaseModel):
    vehicle_id: int | None = None
    trip_id: int | None = None
    type: ExpenseType | None = None
    amount: float | None = Field(default=None, gt=0)
    date: datetime.date | None = None
    description: str | None = Field(default=None, max_length=500)


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int | None
    trip_id: int | None
    type: ExpenseType
    amount: float
    date: datetime.date
    description: str | None
    created_by: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
