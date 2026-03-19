"""
Middleware package for request/response processing
"""

from .error_handler import setup_error_handlers
from .cors_middleware import setup_cors

__all__ = ['setup_error_handlers', 'setup_cors']
