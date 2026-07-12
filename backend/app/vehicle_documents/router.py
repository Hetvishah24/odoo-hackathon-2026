from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.crud import CRUDBase
from app.core.deps import require_permissions
from app.core.responses import SuccessResponse, ok
from app.db.session import get_db
from app.vehicle_documents.models import VehicleDocument
from app.vehicle_documents.schemas import VehicleDocumentCreate, VehicleDocumentRead

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]

document_crud = CRUDBase(VehicleDocument)


@router.get(
    "",
    response_model=SuccessResponse[list[VehicleDocumentRead]],
    dependencies=[Depends(require_permissions("vehicles:read"))],
)
def list_vehicle_documents(db: DbSession, vehicle_id: Annotated[int | None, Query()] = None):
    stmt = select(VehicleDocument)
    if vehicle_id is not None:
        stmt = stmt.where(VehicleDocument.vehicle_id == vehicle_id)
    stmt = stmt.order_by(VehicleDocument.id)
    documents = list(db.scalars(stmt).all())
    return ok(documents, "Vehicle documents retrieved successfully.")


@router.post(
    "",
    response_model=SuccessResponse[VehicleDocumentRead],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permissions("vehicles:write"))],
)
def create_vehicle_document(payload: VehicleDocumentCreate, db: DbSession):
    document = document_crud.create(db, payload.model_dump())
    return ok(document, "Vehicle document created successfully.")


@router.delete(
    "/{document_id}",
    response_model=SuccessResponse[None],
    dependencies=[Depends(require_permissions("vehicles:write"))],
)
def delete_vehicle_document(document_id: int, db: DbSession):
    document = document_crud.get_or_404(db, document_id)
    document_crud.delete(db, document)
    return ok(None, "Vehicle document deleted successfully.")
