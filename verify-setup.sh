
#!/bin/bash

# /home/claude/devops-dashboard/verify-setup.sh



echo "=========================================="

echo "DevOps Dashboard - Setup Verification"

echo "=========================================="

echo ""



GREEN='\033[0;32m'

RED='\033[0;31m'

YELLOW='\033[1;33m'

NC='\033[0m'



echo -n "Checking Node.js... "

if command -v node &> /dev/null; then

    VERSION=$(node -v)

    echo -e "${GREEN}✓${NC} Found ($VERSION)"

else

    echo -e "${RED}✗${NC} Not found"

    exit 1

fi



echo -n "Checking npm... "

if command -v npm &> /dev/null; then

    VERSION=$(npm -v)

    echo -e "${GREEN}✓${NC} Found (v$VERSION)"

else

    echo -e "${RED}✗${NC} Not found"

    exit 1

fi



echo -n "Checking project structure... "

if [ -d "~/devops-dashboard/backend" ] && [ -d "~/devops-dashboard/frontend" ]; then

    echo -e "${GREEN}✓${NC} OK"

else

    echo -e "${RED}✗${NC} Missing directories"

    exit 1

fi



echo -n "Checking backend files... "

if [ -f "~/devops-dashboard/backend/server.js" ]; then

    echo -e "${GREEN}✓${NC} OK"

else

    echo -e "${RED}✗${NC} Missing files"

    exit 1

fi



echo -n "Checking MongoDB... "

if command -v mongod &> /dev/null; then

    echo -e "${GREEN}✓${NC} Installed"

else

    echo -e "${YELLOW}⚠${NC} Not found (optional)"

fi



echo ""

echo "=========================================="

echo -e "${GREEN}Setup verification complete!${NC}"

echo "=========================================="

echo ""

echo "To start the application, run:"

echo "  ./quick-start.sh"

echo ""

echo "Access at: http://localhost:8082"

echo ""

