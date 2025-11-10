#!/bin/bash

# Smart Parking Management System - Startup Script

echo "🚗 Starting Smart Parking Management System..."
echo ""

# Check if MySQL is running
echo "📊 Checking MySQL status..."
if mysql.server status > /dev/null 2>&1; then
    echo "✅ MySQL is running"
else
    echo "⚠️  MySQL is not running. Starting MySQL..."
    mysql.server start
    sleep 2
fi

echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "🚀 Starting application..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev
