
#!/bin/bash

# docker-start.sh



echo "=========================================="

echo "DevOps Dashboard - Docker Startup"

echo "=========================================="



# Use current directory instead of hardcoded path

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"



echo ""

echo "Working directory: $(pwd)"

echo ""



echo "Checking Docker..."

if ! command -v docker &> /dev/null; then

    echo "❌ Docker is not installed!"

    echo "Please install Docker: https://docs.docker.com/get-docker/"

    exit 1

fi



if ! command -v docker compose &> /dev/null && ! docker compose version &> /dev/null; then

    echo "❌ Docker Compose is not installed!"

    exit 1

fi



echo "✅ Docker is installed"

echo ""



# Stop any running containers

echo "Stopping any existing containers..."

docker compose down 2>/dev/null



# Remove old containers that might be unhealthy

echo "Cleaning up old containers..."

docker compose rm -f 2>/dev/null



# Build images

echo ""

echo "Building Docker images (this may take a few minutes)..."

docker compose build



# Start containers

echo ""

echo "Starting containers..."

docker compose up -d



echo ""

echo "Waiting for services to start..."

echo "This may take up to 60 seconds for MongoDB to initialize..."



# Wait for MongoDB to be healthy

for i in {1..30}; do

    if docker compose ps mongodb | grep -q "healthy"; then

        echo "✅ MongoDB is healthy"

        break

    fi

    echo "Waiting for MongoDB... ($i/30)"

    sleep 2

done



# Wait a bit more for backend

sleep 5



# Check container status

echo ""

echo "Container Status:"

docker compose ps



# Check if services are running

MONGODB_RUNNING=$(docker compose ps mongodb | grep -c "Up")

BACKEND_RUNNING=$(docker compose ps backend | grep -c "Up")

FRONTEND_RUNNING=$(docker compose ps frontend | grep -c "Up")



echo ""

if [ "$MONGODB_RUNNING" -eq "0" ] || [ "$BACKEND_RUNNING" -eq "0" ] || [ "$FRONTEND_RUNNING" -eq "0" ]; then

    echo "⚠️  Some services failed to start. Checking logs..."

    echo ""

    echo "=== MongoDB Logs ==="

    docker compose logs --tail=20 mongodb

    echo ""

    echo "=== Backend Logs ==="

    docker compose logs --tail=20 backend

    echo ""

    echo "Run 'docker compose logs -f' to see all logs"

    exit 1

fi



echo "=========================================="

echo "✅ DevOps Dashboard is running!"

echo "=========================================="

echo ""

echo "Access the application at:"

echo "  Frontend: http://localhost:8082"

echo "  Backend API: http://localhost:5000"

echo "  Health Check: http://localhost:5000/health"

echo ""

echo "View logs:"

echo "  docker compose logs -f"

echo ""

echo "Stop containers:"

echo "  docker compose down"

echo ""

