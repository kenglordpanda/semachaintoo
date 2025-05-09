#!/bin/bash
set -e

echo "Starting services..."

# Start Nginx
echo "Starting Nginx..."
service nginx start

# Check Python dependencies
echo "Checking Python dependencies..."
pip install uvicorn gunicorn

# Ensure backend directory exists
mkdir -p /app/backend

# Create a basic main.py if it doesn't exist
if [ ! -f /app/backend/main.py ]; then
    echo "Creating placeholder main.py for backend..."
    cat > /app/backend/main.py << 'EOF'
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to SemaChain API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
EOF
fi

# Start backend service
echo "Starting backend service..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start frontend service
echo "Starting frontend service..."
cd /app/frontend
if [ -f .next/standalone/server.js ]; then
    node .next/standalone/server.js &
elif [ -f node_modules/.bin/next ]; then
    ./node_modules/.bin/next start &
else
    echo "Error: Cannot find Next.js server executable"
    exit 1
fi

echo "All services started, waiting for logs..."

# Keep container running
tail -f /var/log/nginx/access.log
