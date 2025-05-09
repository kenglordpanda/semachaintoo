import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_v1.api import api_router
from app.db.session import engine
from app.db.base import Base
import httpx
from typing import Dict
from app.api.v1.endpoints import documents

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SemaChain API")

# Configure CORS
origins = [
    "http://localhost:3000",  # Next.js development server
    "http://127.0.0.1:3000",  # Next.js development server alternative
    "http://localhost:8000",  # Backend development server
    "http://127.0.0.1:8000",  # Backend development server alternative
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "X-Requested-With"],
    max_age=600,
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Include routers
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])

@app.get("/")
async def root():
    return {"message": "Welcome to SemaChain API"}

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}