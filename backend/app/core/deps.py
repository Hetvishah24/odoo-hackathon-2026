"""Shared FastAPI dependencies: current user and permission checks."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import ACCESS_TOKEN, decode_token
from app.db.session import get_db
from app.users.models import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> User:
    if credentials is None:
        raise UnauthorizedException("Not authenticated")

    payload = decode_token(credentials.credentials, expected_type=ACCESS_TOKEN)
    user = db.get(User, int(payload["sub"]))
    if user is None or not user.is_active:
        raise UnauthorizedException("User not found or inactive")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def has_permission(user: User, *required: str) -> bool:
    """Plain boolean permission check: "*" grants everything, otherwise every
    string in `required` must be present on the user's role. No approval-gate
    logic here - that's layered on top by require_permissions() below for
    route dependencies, and handled separately by callers (e.g. the dashboard
    endpoint) that want to degrade gracefully instead of raising.
    """
    granted = set(user.role.permissions) if user.role else set()
    if "*" in granted:
        return True
    return all(permission in granted for permission in required)


def require_permissions(*required: str):
    """Dependency factory enforcing RBAC permissions.

    Permissions are plain strings on the user's role (e.g. "users:read").
    A role holding "*" is granted everything, including bypassing the approval
    gate below. Every other account must be approved by an admin (or by
    whoever holds the relevant "<role>:approve" permission, see
    app/users/router.py) before any permissioned endpoint will accept it —
    this does not block login or the /users/me/profile step-2 endpoints.

        @router.get("", dependencies=[Depends(require_permissions("users:read"))])
    """

    def checker(user: CurrentUser) -> User:
        granted = set(user.role.permissions) if user.role else set()
        if "*" in granted:
            return user
        if not user.is_approved:
            raise ForbiddenException("Your account is pending admin approval")
        if not has_permission(user, *required):
            raise ForbiddenException(f"Missing permissions: {', '.join(required)}")
        return user

    return checker
