"""Aggregates all feature routers under one API router."""

from fastapi import APIRouter

from app.auth.router import router as auth_router
from app.drivers.router import router as drivers_router
from app.expenses.router import router as expenses_router
from app.fuel.router import router as fuel_router
from app.profiles.router import (
    financial_analyst_router,
    fleet_manager_router,
    safety_officer_router,
)
from app.reports.router import router as reports_router
from app.roles.router import router as roles_router
from app.trips.router import router as trips_router
from app.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(roles_router, prefix="/roles", tags=["roles"])
api_router.include_router(drivers_router, prefix="/drivers", tags=["drivers"])
api_router.include_router(trips_router, prefix="/trips", tags=["trips"])
api_router.include_router(fuel_router, prefix="/fuel-logs", tags=["fuel-logs"])
api_router.include_router(expenses_router, prefix="/expenses", tags=["expenses"])
api_router.include_router(reports_router, prefix="/reports", tags=["reports"])
api_router.include_router(
    fleet_manager_router, prefix="/fleet-managers", tags=["fleet-managers"]
)
api_router.include_router(
    safety_officer_router, prefix="/safety-officers", tags=["safety-officers"]
)
api_router.include_router(
    financial_analyst_router, prefix="/financial-analysts", tags=["financial-analysts"]
)
