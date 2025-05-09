# Stage 1: Python Backend
FROM python:3.10-slim-buster as backend

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# Copy backend application code
COPY backend/ .

# Create data directory for Weaviate
RUN mkdir -p /app/data/weaviate

# Stage 2: Web App
FROM node:22-alpine as webapp

WORKDIR /app/webapp

# Assuming the web app code is in a directory called 'webapp' at the same level as the backend
# Copy web app files and install dependencies
COPY webapp/package*.json ./
RUN npm install

COPY webapp/ .
RUN npm run build

# Stage 3: Final Image
FROM python:3.10-slim-buster

WORKDIR /app

# Install Nginx to serve the web app
RUN apt-get update && apt-get install -y \
    nginx \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend from the backend stage
COPY --from=backend /app/backend /app/backend
# Copy web app build from the webapp stage
COPY --from=webapp /app/webapp/build /app/webapp # Ensure nginx.conf serves from /app/webapp

# Setup Nginx to serve the webapp and proxy API requests to the backend
COPY backend/nginx.conf /etc/nginx/sites-available/default

# Environment variables for CORS
ENV CORS_ORIGINS="*"
ENV CORS_ALLOW_CREDENTIALS=true
ENV CORS_ALLOW_METHODS="GET,POST,PUT,DELETE,OPTIONS"
ENV CORS_ALLOW_HEADERS="*"

# Improved health check with longer start period
HEALTHCHECK --interval=30s --timeout=30s --start-period=120s --retries=5 \
    CMD curl -f http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Start script to run both services
COPY backend/start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]

# New Dockerfile for the backend
FROM python:3.10-slim-buster

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]