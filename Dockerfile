FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    python3 \
    python3-pip \
    nodejs \
    npm \
    curl \
    supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set up directories
WORKDIR /app

# Copy application files
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/
COPY start.sh /app/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install Python dependencies
RUN pip3 install fastapi uvicorn

# Install Node.js dependencies
WORKDIR /app/frontend
RUN npm install

# Build Next.js frontend
RUN npm run build

# Don't try to start Nginx if it's not installed
RUN sed -i 's/nginx: unrecognized service/Nginx not installed in this container. Skipping./g' /app/start-services.sh || true

# Set execute permissions for start script
WORKDIR /app
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 80

# Start services using supervisord
CMD ["/app/start.sh"]