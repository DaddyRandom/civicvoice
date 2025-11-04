#!/bin/bash

# SSL Certificate initialization script using Let's Encrypt
# Run this once before starting production deployment

set -e

# Configuration
DOMAIN="api.civicvoice.org"
EMAIL="admin@civicvoice.org"  # Change this to your email
STAGING=0  # Set to 1 for testing

echo "Initializing SSL certificate for ${DOMAIN}"

# Check if running in staging mode
if [ $STAGING != "0" ]; then
    STAGING_ARG="--staging"
    echo "Running in STAGING mode"
else
    STAGING_ARG=""
    echo "Running in PRODUCTION mode"
fi

# Create required directories
mkdir -p certbot/conf
mkdir -p certbot/www

# Request certificate
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    ${STAGING_ARG} \
    -d ${DOMAIN}

echo "SSL certificate obtained successfully!"
echo "You can now start the production environment with:"
echo "docker-compose -f docker-compose.prod.yml up -d"
