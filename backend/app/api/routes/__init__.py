"""
Routes package - organizes all API routes
"""

from fastapi import APIRouter
from app.controllers import router as controller_router

# Create main router
api_router = APIRouter(prefix="/api/v1")

# Include all routes
api_router.include_router(controller_router)

__all__ = ['api_router']
