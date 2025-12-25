
#!/bin/bash

# docker-logs.sh



SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"



if [ -z "$1" ]; then

    echo "Showing logs for all services..."

    docker compose logs -f

else

    echo "Showing logs for $1..."

    docker compose logs -f $1

fi

