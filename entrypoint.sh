#!/bin/bash

# Ensure CORS_ORIGINS is properly set
if [ -z "$CORS_ORIGINS" ]; then
  export CORS_ORIGINS='["http://localhost:3000","http://localhost:8000","http://localhost"]'
fi

# Execute the original command
exec "$@"
