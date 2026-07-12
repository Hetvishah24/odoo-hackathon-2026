import datetime

from pydantic import BaseModel, ConfigDict, Field


class VehicleDocumentCreate(BaseModel):
    vehicle_id: int
    doc_type: str = Field(min_length=1, max_length=100)
    file_url: str = Field(min_length=1, max_length=1000)
    expiry_date: datetime.date | None = None


class VehicleDocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vehicle_id: int
    doc_type: str
    file_url: str
    expiry_date: datetime.date | None
    created_at: datetime.datetime
    updated_at: datetime.datetime
