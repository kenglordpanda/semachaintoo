# Use Node.js LTS as base image
FROM node:22-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and the missing packages
RUN npm install
RUN npm install axios react-router-dom

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:22-slim AS runner

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
