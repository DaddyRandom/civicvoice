#!/bin/bash

# Production deployment script
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}

echo "========================================="
echo "Civic Voice Platform Deployment"
echo "Environment: ${ENVIRONMENT}"
echo "========================================="

# Pre-deployment checks
echo ""
echo "Running pre-deployment checks..."

# Check if required files exist
if [ ! -f "backend/.env.${ENVIRONMENT}" ]; then
    echo "Error: backend/.env.${ENVIRONMENT} not found!"
    echo "Please copy backend/.env.${ENVIRONMENT}.example and configure it."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running!"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed!"
    exit 1
fi

echo "✓ Pre-deployment checks passed"

# Backup database
echo ""
echo "Creating database backup..."
if docker-compose -f docker-compose.prod.yml ps | grep -q postgres; then
    docker-compose -f docker-compose.prod.yml exec -T backup /backup.sh
    echo "✓ Database backup created"
else
    echo "⚠ Database not running, skipping backup"
fi

# Pull latest changes
echo ""
echo "Pulling latest changes from git..."
git pull origin main
echo "✓ Code updated"

# Build backend
echo ""
echo "Building backend image..."
docker-compose -f docker-compose.prod.yml build backend
echo "✓ Backend built"

# Stop services
echo ""
echo "Stopping services..."
docker-compose -f docker-compose.prod.yml down
echo "✓ Services stopped"

# Start services
echo ""
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d
echo "✓ Services started"

# Wait for services to be ready
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Run database migrations
echo ""
echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run migrate
echo "✓ Migrations completed"

# Health check
echo ""
echo "Running health checks..."
sleep 5

HEALTH_CHECK=$(docker-compose -f docker-compose.prod.yml exec -T backend wget -qO- http://localhost:5000/api/health || echo "failed")

if echo "$HEALTH_CHECK" | grep -q "success"; then
    echo "✓ Health check passed"
else
    echo "✗ Health check failed!"
    echo "Response: $HEALTH_CHECK"
    exit 1
fi

# Show running services
echo ""
echo "Running services:"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo ""
echo "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20 backend

echo ""
echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="
echo ""
echo "API: https://api.civicvoice.org"
echo "Health: https://api.civicvoice.org/api/health"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f backend"
echo "To stop: docker-compose -f docker-compose.prod.yml down"
