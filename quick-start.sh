
#!/bin/bash

# /home/claude/devops-dashboard/quick-start.sh



echo "=========================================="

echo "DevOps Dashboard - Quick Start"

echo "=========================================="



cd ~/devops-dashboard



# Install backend dependencies

echo ""

echo "[1/4] Installing backend dependencies..."

cd backend

npm install --break-system-packages --silent



# Install frontend dependencies

echo "[2/4] Installing frontend dependencies..."

cd ../frontend

npm install --break-system-packages --silent



# Start backend

echo "[3/4] Starting backend server..."

cd ../backend

nohup node server.js > /tmp/devops-backend.log 2>&1 &

echo "Backend started (PID: $!)"

sleep 3



# Start frontend

echo "[4/4] Starting frontend on port 8082..."

echo ""

echo "=========================================="

echo "Access the application at:"

echo "http://localhost:8082"

echo "=========================================="

echo ""

cd ../frontend

PORT=8082 npm start

