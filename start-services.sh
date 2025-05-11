#!/bin/bash
set -e

echo "Starting services..."

# Start backend service
if [ -f /app/start.sh ]; then
    echo "Starting backend..."
    bash /app/start.sh &
fi

# Start other necessary services
# ...

# Keep container running
exec tail -f /dev/null
