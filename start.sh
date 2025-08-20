#!/bin/bash

echo "🚨 Starting Helpline Backend Server..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before starting the server."
    echo ""
fi

# Check if MongoDB is running (basic check)
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running."
    echo "   Please start MongoDB before running the server."
    echo "   On macOS: brew services start mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo ""
fi

echo "🔧 Starting server in development mode..."
echo "📱 Server will be available at: http://localhost:5000"
echo "🔗 Health check: http://localhost:5000/api/health"
echo ""

# Start the server
npm run dev
