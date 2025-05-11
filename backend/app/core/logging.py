import logging
import sys
import os
from pathlib import Path

def setup_logging():
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_level = logging.INFO
    
    # Create logs directory if it doesn't exist
    logs_dir = Path("/app/logs" if os.path.exists("/.dockerenv") else "logs")
    logs_dir.mkdir(exist_ok=True)
    log_file = logs_dir / "app.log"
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file, encoding="utf-8", mode="a")
        ]
    )
    
    # Set SQLAlchemy logging level
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    
    # Set uvicorn access log level
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    # Create app logger
    logger = logging.getLogger("app")
    logger.setLevel(log_level)
    
    return logger

# Create and export logger
logger = setup_logging()
