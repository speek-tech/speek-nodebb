FROM node:20-alpine

# Install git, build dependencies, netcat for health checks, and openssl for secret generation
RUN apk add --no-cache git python3 make g++ netcat-openbsd openssl

# Set working directory
WORKDIR /app

# Copy NodeBB source code
COPY . .

# Install dependencies
RUN npm install

# Preinstall session-sharing plugin so it's present on first boot
RUN npm install nodebb-plugin-session-sharing

# Create necessary directories
RUN mkdir -p public/uploads logs

# Expose port
EXPOSE 4567

# Use entrypoint script for startup orchestration
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "app.js"]