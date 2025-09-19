FROM node:20-alpine

# Install git, build dependencies, and netcat for health checks
RUN apk add --no-cache git python3 make g++ netcat-openbsd

# Set working directory
WORKDIR /app

# Copy NodeBB source code
COPY . .

# Install dependencies
RUN npm install

# Create necessary directories
RUN mkdir -p public/uploads logs

# Expose port
EXPOSE 4567

# Simple startup script
CMD ["sh", "-c", "echo 'Waiting for services...' && while ! nc -z postgres 5432; do sleep 1; done && while ! nc -z redis 6379; do sleep 1; done && echo 'Services ready!' && if [ ! -f config.json ] || [ ! -s config.json ]; then echo 'Setting up NodeBB...' && export NODEBB_URL=${NODEBB_URL:-http://localhost:4567} && export NODEBB_DB=${NODEBB_DB:-postgres} && export NODEBB_DB_HOST=${NODEBB_DB_HOST:-postgres} && export NODEBB_DB_PORT=${NODEBB_DB_PORT:-5432} && export NODEBB_DB_USER=${NODEBB_DB_USER:-nodebb} && export NODEBB_DB_PASSWORD=${NODEBB_DB_PASSWORD:-nodebb123} && export NODEBB_DB_NAME=${NODEBB_DB_NAME:-nodebb} && export NODEBB_REDIS_HOST=${NODEBB_REDIS_HOST:-redis} && export NODEBB_REDIS_PORT=${NODEBB_REDIS_PORT:-6379} && export NODEBB_REDIS_PASSWORD=${NODEBB_REDIS_PASSWORD:-redis123} && export NODEBB_ADMIN_USERNAME=${NODEBB_ADMIN_USERNAME:-admin} && export NODEBB_ADMIN_PASSWORD=${NODEBB_ADMIN_PASSWORD:-admin123} && export NODEBB_ADMIN_EMAIL=${NODEBB_ADMIN_EMAIL:-admin@speek.local} && node ./nodebb setup; fi && echo 'Starting NodeBB...' && exec node app.js"]