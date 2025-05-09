import json
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ...existing code...
    
    CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:8000", "http://localhost"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        if isinstance(v, str) and v == "":
            # Return default value if empty string
            return ["http://localhost:3000", "http://localhost:8000", "http://localhost"]
        if isinstance(v, (list, str)):
            try:
                if isinstance(v, str):
                    v = json.loads(v)
                return v
            except json.JSONDecodeError:
                # Return default value if JSON decode fails
                return ["http://localhost:3000", "http://localhost:8000", "http://localhost"]
        raise ValueError(v)
    
    # ...existing code...

# Instantiate the settings object
settings = Settings()