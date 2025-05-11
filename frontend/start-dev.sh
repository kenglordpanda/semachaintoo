#!/bin/bash
set -e

# Clean any previous builds
echo "Cleaning previous builds..."
rm -rf .next

# Remove conflicting directories
if [ -d "./app" ]; then
  echo "Removing app directory..."
  rm -rf ./app
fi

if [ -d "./src/app" ]; then
  echo "Removing src/app directory..."
  rm -rf ./src/app
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the application
echo "Building application..."
npm run build

# Start the server
echo "Starting server..."
npm start
