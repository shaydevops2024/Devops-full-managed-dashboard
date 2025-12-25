
#!/bin/bash

# docker-stop.sh



echo "=========================================="

echo "Stopping DevOps Dashboard"

echo "=========================================="



SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"



docker compose down



echo ""

echo "✅ All containers stopped"

echo ""

