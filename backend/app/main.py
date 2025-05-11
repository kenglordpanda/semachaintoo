import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.db.session import engine
from app.db.base import Base
import httpx
from typing import Dict
from app.api.v1.endpoints import documents, users
from app.api.api_v1.endpoints import knowledge_bases
from app.core.logging import logger
import time
from fastapi.responses import JSONResponse
import traceback
import logging
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SemaChain API")

# Get the CORS origins from settings
origins = settings.get_cors_origins()

# Configure CORS - Secure, allow credentials and trusted origins only
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use specific origins from settings
    allow_credentials=True,  # Allow cookies/auth headers
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "X-Requested-With"],
    max_age=600,
)

# Custom middleware with improved error handling for stream issues
class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        start_time = time.time()
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            logger.info(f"{request.method} {request.url.path} {response.status_code} ({process_time:.4f}s)")
            return response
        except Exception as e:
            process_time = time.time() - start_time
            error_detail = f"Error processing request: {str(e)}"
            error_traceback = traceback.format_exc()
            logger.error(f"{request.method} {request.url.path} ERROR ({process_time:.4f}s): {error_detail}\n{error_traceback}")
            return JSONResponse(
                status_code=500,
                content={"detail": "An internal server error occurred. Please try again."}
            )

# Add the custom middleware
app.add_middleware(ErrorHandlingMiddleware)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Include routers
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(knowledge_bases.router, prefix="/api/v1/knowledge-bases", tags=["knowledge-bases"])

# Add comprehensive error handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_detail = f"An unexpected error occurred: {str(exc)}"
    error_traceback = traceback.format_exc()
    
    # Log the full traceback
    logging.error(f"Unhandled exception: {error_detail}\n{error_traceback}")
    
    # Return a clean error response to the client
    return JSONResponse(
        status_code=500,
        content={"detail": error_detail}
    )

@app.get("/")
async def root():
    return {"message": "Welcome to SemaChain API"}

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Add a debug endpoint to check CORS settings
@app.get("/debug/cors")
async def debug_cors():
    return {
        "allowed_origins": origins,
        "cors_settings": {
            "allow_credentials": True,
            "allow_methods": ["*"],
            "allow_headers": ["*"]
        }
    }