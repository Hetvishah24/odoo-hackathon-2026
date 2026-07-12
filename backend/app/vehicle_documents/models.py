import datetime

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class VehicleDocument(Base, TimestampMixin):
    __tablename__ = "vehicle_documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    doc_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Plain string field, not a real file-upload pipeline - not worth the time budget.
    file_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    expiry_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)
