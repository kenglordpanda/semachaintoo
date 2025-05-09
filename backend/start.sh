#!/bin/bash
set -e

echo "Starting services..."

# Start Nginx in the background
echo "Starting Nginx..."
service nginx start

# Change to backend directory
cd /app/backend

# Make sure all dependencies are installed
echo "Checking Python dependencies..."
pip install --no-cache-dir uvicorn gunicorn

# Start the backend service
echo "Starting backend service..."
# If app.py is your entry point, adjust if needed
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Change to frontend directory
cd /app/frontend

# Start the Next.js standalone server
echo "Starting frontend service..."
node server.js &

# Keep the container running
echo "All services started, waiting for logs..."
tail -f /var/log/nginx/access.log
