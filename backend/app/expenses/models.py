import datetime
import enum

from sqlalchemy import Date, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class ExpenseType(str, enum.Enum):
    toll = "toll"
    maintenance = "maintenance"
    other = "other"


class Expense(Base, TimestampMixin):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int | None] = mapped_column(ForeignKey("vehicles.id"), nullable=True)
    trip_id: Mapped[int | None] = mapped_column(ForeignKey("trips.id"), nullable=True)
    type: Mapped[ExpenseType] = mapped_column(
        Enum(ExpenseType, name="expense_type", values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    # Field is named `date`; annotate via the `datetime` module rather than a bare `date`
    # import, otherwise Mapped[]'s type-hint resolution shadows the type with this column.
    date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
