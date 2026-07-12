import enum

from sqlalchemy import Enum, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class VehicleType(str, enum.Enum):
    truck = "truck"
    van = "van"
    bike = "bike"
    trailer = "trailer"
    other = "other"


class VehicleStatus(str, enum.Enum):
    available = "available"
    on_trip = "on_trip"
    in_shop = "in_shop"
    retired = "retired"


class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    registration_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name_model: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[VehicleType] = mapped_column(
        Enum(VehicleType, name="vehicle_type", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    max_load_capacity: Mapped[float] = mapped_column(Float, nullable=False)
    odometer: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    acquisition_cost: Mapped[float] = mapped_column(Float, nullable=False)
    # Dev B's Reports module (vehicle-roi) needs this: revenue = actual_distance * revenue_per_km.
    revenue_per_km: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[VehicleStatus] = mapped_column(
        Enum(VehicleStatus, name="vehicle_status", values_callable=lambda obj: [e.value for e in obj]),
        default=VehicleStatus.available,
        nullable=False,
    )
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
