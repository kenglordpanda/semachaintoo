from typing import List, Optional, Union, Any
from pydantic_settings import BaseSettings
import os
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "SemaChain API"
    API_V1_PREFIX: str = "/api/v1"
    
    # CORS - Simple approach with individual environment variables
    # Set these to "true" in your environment to enable the origin
    CORS_ALLOW_LOCALHOST: bool = True  # http://localhost:3000, http://localhost:8000
    CORS_ALLOW_FRONTEND_SERVICE: bool = True  # http://frontend:3000
    CORS_ALLOW_BACKEND_SERVICE: bool = True  # http://backend:8000
    CORS_ALLOW_DOCKER_HOST: bool = True  # http://host.docker.internal:3000/8000
    
    # Custom origins can be added as a comma-separated list
    CORS_CUSTOM_ORIGINS: str = ""
    
    # Database
    DATABASE_URL: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Milvus Configuration
    MILVUS_HOST: str = "milvus"
    MILVUS_PORT: str = "19530"
    MILVUS_COLLECTION_NAME: str = "documents"
    
    # Legacy field to ensure backward compatibility
    CORS_ORIGINS: Optional[List[str]] = None
    
    # Health Check Settings
    HEALTH_CHECK_INTERVAL: int = 30  # seconds
    HEALTH_CHECK_TIMEOUT: int = 5    # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore any extra fields from environment variables

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def validate_cors_origins(cls, v: Any) -> List[str]:
        """Convert string CORS_ORIGINS to a list if necessary"""
        if isinstance(v, str) and v:
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    def get_cors_origins(self) -> List[str]:
        """Build the CORS origins list from individual settings"""
        origins = []
        
        # Add origins based on boolean flags
        if self.CORS_ALLOW_LOCALHOST:
            origins.extend([
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:8000",
                "http://127.0.0.1:8000"
            ])
            
        if self.CORS_ALLOW_FRONTEND_SERVICE:
            origins.append("http://frontend:3000")
            
        if self.CORS_ALLOW_BACKEND_SERVICE:
            origins.append("http://backend:8000")
            
        if self.CORS_ALLOW_DOCKER_HOST:
            origins.extend([
                "http://host.docker.internal:3000",
                "http://host.docker.internal:8000"
            ])
        
        # Add any custom origins if specified
        if self.CORS_CUSTOM_ORIGINS:
            custom = [origin.strip() for origin in self.CORS_CUSTOM_ORIGINS.split(",") if origin.strip()]
            origins.extend(custom)
        
        # For backward compatibility, include CORS_ORIGINS if provided
        if self.CORS_ORIGINS:
            origins.extend(self.CORS_ORIGINS)
            
        return origins

settings = Settings()