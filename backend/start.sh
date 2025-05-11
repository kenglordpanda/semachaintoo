#!/bin/bash
set -e

# Create logs directory with proper permissions
mkdir -p /app/logs
chmod 777 /app/logs

# Start the application with error logging
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
