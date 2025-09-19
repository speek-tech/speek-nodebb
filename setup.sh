#!/bin/bash
export NODEBB_URL=http://localhost:4567
export NODEBB_DB=postgres
export NODEBB_DB_HOST=localhost
export NODEBB_DB_PORT=5432
export NODEBB_DB_USER=nodebb
export NODEBB_DB_PASSWORD=nodebb123
export NODEBB_DB_NAME=nodebb
export NODEBB_REDIS_HOST=localhost
export NODEBB_REDIS_PORT=6379
export NODEBB_REDIS_PASSWORD=redis123
export NODEBB_ADMIN_USERNAME=admin
export NODEBB_ADMIN_PASSWORD=admin123
export NODEBB_ADMIN_EMAIL=admin@speek.local

./nodebb setup
