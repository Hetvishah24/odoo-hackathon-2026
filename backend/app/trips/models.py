import enum

from sqlalchemy import Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class TripStatus(str, enum.Enum):
    draft = "draft"
    dispatched = "dispatched"
    completed = "completed"
    cancelled = "cancelled"


class Trip(Base, TimestampMixin):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    # Plain FK columns (no relationship()) to vehicles.id: the Vehicle ORM class lives in
    # Dev A's module and isn't imported here, so mapper configuration never needs to resolve
    # it. Vehicle rows are read/written via raw SQL in trips/service.py instead.
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), nullable=False)
    cargo_weight: Mapped[float] = mapped_column(Float, nullable=False)
    planned_distance: Mapped[float] = mapped_column(Float, nullable=False)
    actual_distance: Mapped[float | None] = mapped_column(Float, nullable=True)
    start_odometer: Mapped[float | None] = mapped_column(Float, nullable=True)
    end_odometer: Mapped[float | None] = mapped_column(Float, nullable=True)
    fuel_consumed: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[TripStatus] = mapped_column(
        Enum(TripStatus, name="trip_status", values_callable=lambda obj: [e.value for e in obj]),
        default=TripStatus.draft,
        nullable=False,
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
