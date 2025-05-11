#!/bin/bash

# Script to remove the app directory and fix the conflicting router issue
echo "Removing app directories to resolve Next.js router conflict..."

# Check for app directories in various locations and remove them
if [ -d "./src/app" ]; then
    echo "src/app directory found, removing..."
    rm -rf ./src/app
    echo "src/app directory removed successfully!"
fi

if [ -d "./app" ]; then
    echo "app directory found at root level, removing..."
    rm -rf ./app
    echo "app directory removed successfully!"
fi

echo "Next.js will now use the pages directory for routing."
echo "Run 'npm run build' to verify the fix."
