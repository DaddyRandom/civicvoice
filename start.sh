#!/bin/bash

# Quick Start Script - Run Civic Voice Platform Locally
# This script will help you run the platform on your local machine for testing

echo "========================================="
echo "Civic Voice Platform - Quick Start"
echo "========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    exit 1
fi

echo "✓ npm version: $(npm --version)"
echo ""

# Navigate to backend
cd backend || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    PUPPETEER_SKIP_DOWNLOAD=true npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file exists"
fi

echo ""
echo "========================================="
echo "🚀 Starting Civic Voice Platform"
echo "========================================="
echo ""
echo "NOTE: This requires PostgreSQL and Redis to be running."
echo ""
echo "Quick setup with Docker:"
echo "  docker-compose up -d postgres redis"
echo ""
echo "Or install locally:"
echo "  - PostgreSQL: https://www.postgresql.org/download/"
echo "  - Redis: https://redis.io/download"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run database migrations (if database is available)
echo "🗄️  Running database migrations..."
npm run migrate 2>/dev/null || echo "⚠️  Skipping migrations (database not available)"

echo ""
echo "🌟 Starting development server..."
echo "   API will be available at: http://localhost:5000"
echo "   Health check: http://localhost:5000/api/health"
echo ""

# Start the development server
npm run dev
