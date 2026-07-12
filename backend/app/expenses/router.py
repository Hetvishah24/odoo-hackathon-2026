from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import asc, desc, func, select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import CurrentUser, require_permissions
from app.core.pagination import Page, PageParams
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.expenses.models import Expense, ExpenseType
from app.expenses.schemas import ExpenseCreate, ExpenseRead, ExpenseUpdate

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

expense_crud = CRUDBase(Expense)


@router.get(
    "",
    response_model=SuccessResponse[Page[ExpenseRead]],
    dependencies=[Depends(require_permissions("expenses:read"))],
)
def list_expenses(
    db: DbSession,
    params: Annotated[PageParams, Depends()],
    vehicle_id: Annotated[int | None, Query()] = None,
    trip_id: Annotated[int | None, Query()] = None,
    type_: Annotated[ExpenseType | None, Query(alias="type")] = None,
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    stmt = select(Expense)
    if vehicle_id is not None:
        stmt = stmt.where(Expense.vehicle_id == vehicle_id)
    if trip_id is not None:
        stmt = stmt.where(Expense.trip_id == trip_id)
    if type_ is not None:
        stmt = stmt.where(Expense.type == type_)
    if date_from is not None:
        stmt = stmt.where(Expense.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(Expense.date <= date_to)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    sort_column = getattr(Expense, params.sort_by, None) if params.sort_by else None
    if sort_column is not None:
        stmt = stmt.order_by(desc(sort_column) if params.sort_order == "desc" else asc(sort_column))
    else:
        stmt = stmt.order_by(Expense.id)

    stmt = stmt.offset((params.page - 1) * params.page_size).limit(params.page_size)
    items = list(db.scalars(stmt).all())
    return ok(Page[ExpenseRead].create(items, total, params), "Expenses retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[ExpenseRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("expenses:write"))],
)
def create_expense(payload: ExpenseCreate, db: DbSession, current_user: CurrentUser):
    expense = expense_crud.create(db, {**payload.model_dump(), "created_by": current_user.id})
    return ok(expense, "Expense created successfully.")


@router.patch(
    "/{expense_id}",
    response_model=SuccessResponse[ExpenseRead],
    dependencies=[Depends(require_permissions("expenses:write"))],
)
def update_expense(expense_id: int, payload: ExpenseUpdate, db: DbSession):
    expense = expense_crud.get_or_404(db, expense_id)
    updated = expense_crud.update(db, expense, payload.model_dump(exclude_unset=True))
    return ok(updated, "Expense updated successfully.")


@router.delete(
    "/{expense_id}",
    response_model=SuccessResponse[None],
    dependencies=[Depends(require_permissions("expenses:write"))],
)
def delete_expense(expense_id: int, db: DbSession):
    expense = expense_crud.get_or_404(db, expense_id)
    expense_crud.delete(db, expense)
    return ok(None, "Expense deleted successfully.")
