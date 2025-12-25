
#!/bin/bash

# docker-manage.sh



SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"



case "$1" in

    start)

        echo "Starting containers..."

        docker compose up -d

        ;;

    stop)

        echo "Stopping containers..."

        docker compose down

        ;;

    restart)

        echo "Restarting containers..."

        docker compose restart

        ;;

    rebuild)

        echo "Rebuilding and restarting..."

        docker compose down

        docker compose build --no-cache

        docker compose up -d

        ;;

    logs)

        docker compose logs -f

        ;;

    status)

        docker compose ps

        ;;

    clean)

        echo "Cleaning up containers and volumes..."

        docker compose down -v

        docker system prune -f

        ;;

    *)

        echo "Usage: $0 {start|stop|restart|rebuild|logs|status|clean}"

        echo ""

        echo "Commands:"

        echo "  start   - Start all containers"

        echo "  stop    - Stop all containers"

        echo "  restart - Restart all containers"

        echo "  rebuild - Rebuild images and restart"

        echo "  logs    - Show logs (Ctrl+C to exit)"

        echo "  status  - Show container status"

        echo "  clean   - Stop and remove all containers and volumes"

        exit 1

        ;;

esac

