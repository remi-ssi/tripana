"""
Global error handler middleware
Catches and formats all exceptions
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError


def setup_error_handlers(app: FastAPI):
    """Setup all error handlers for the application"""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        """Handle validation errors"""
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Validation error",
                "errors": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        """Handle general exceptions"""
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "message": str(exc),
            },
        )
