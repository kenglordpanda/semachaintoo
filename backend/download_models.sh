#!/bin/bash
set -e

echo "Creating models directory..."
mkdir -p /app/models

echo "No external models to download - using scikit-learn's TF-IDF instead."
echo "The TF-IDF vectorizer will be automatically created and saved on first use."

echo "Setup complete!"