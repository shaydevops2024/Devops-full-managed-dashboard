
#!/bin/bash



# Usage: ./run-container.sh <image-name> <container-name> [container-port]

# Example: ./run-container.sh myapp test1 4444

# Example: ./run-container.sh myapp test2 (no port mapping)



IMAGE_NAME=$1

CONTAINER_NAME=$2

CONTAINER_PORT=$3



if [ -z "$IMAGE_NAME" ] || [ -z "$CONTAINER_NAME" ]; then

    echo "❌ Usage: $0 <image-name> <container-name> [container-port]"

    echo ""

    echo "Examples:"

    echo "  $0 myapp test1           # No port mapping"

    echo "  $0 myapp test1 4444      # Auto-assign host port"

    exit 1

fi



# Check if container already exists

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then

    echo "❌ Container '$CONTAINER_NAME' already exists!"

    echo "   Remove it first: docker rm -f $CONTAINER_NAME"

    exit 1

fi



# If no port specified, run without port mapping

if [ -z "$CONTAINER_PORT" ]; then

    echo "🚀 Running container without port mapping..."

    docker run -d --name "$CONTAINER_NAME" "$IMAGE_NAME"

    if [ $? -eq 0 ]; then

        echo "✅ Container '$CONTAINER_NAME' started successfully (no external port)"

    else

        echo "❌ Failed to start container"

        exit 1

    fi

else

    # Find an available port starting from 3010

    START_PORT=3010

    MAX_PORT=65535

    

    find_available_port() {

        for port in $(seq $START_PORT $MAX_PORT); do

            if ! docker ps --format '{{.Ports}}' | grep -q ":${port}->"; then

                echo $port

                return 0

            fi

        done

        return 1

    }

    

    HOST_PORT=$(find_available_port)

    

    if [ -z "$HOST_PORT" ]; then

        echo "❌ No available ports found!"

        exit 1

    fi

    

    echo "🚀 Running container with port mapping ${HOST_PORT}:${CONTAINER_PORT}..."

    docker run -d -p "${HOST_PORT}:${CONTAINER_PORT}" --name "$CONTAINER_NAME" "$IMAGE_NAME"

    

    if [ $? -eq 0 ]; then

        echo "✅ Container '$CONTAINER_NAME' started successfully"

        echo "📍 Access it at: http://localhost:${HOST_PORT}"

    else

        echo "❌ Failed to start container"

        exit 1

    fi

fi



# Show the container

echo ""

echo "📊 Container Status:"

docker ps --filter "name=^${CONTAINER_NAME}$" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"



