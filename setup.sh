#!/bin/bash
# setup.sh - Automated setup script for DevOps Platform

set -e  # Exit on error

echo "=========================================="
echo "DevOps Platform - Automated Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root${NC}"
   exit 1
fi

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION is installed"
else
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION is installed"
else
    print_error "npm is not installed"
    exit 1
fi

# Check MongoDB
if command -v mongod &> /dev/null; then
    print_success "MongoDB is installed"
    # Start MongoDB if not running
    if ! pgrep -x mongod > /dev/null; then
        print_info "Starting MongoDB..."
        if command -v systemctl &> /dev/null; then
            sudo systemctl start mongod
            print_success "MongoDB started"
        else
            print_info "Please start MongoDB manually"
        fi
    else
        print_success "MongoDB is already running"
    fi
else
    print_error "MongoDB is not installed. Please install MongoDB first."
    exit 1
fi

echo ""
echo "=========================================="
echo "Setting up Backend"
echo "=========================================="
echo ""

cd backend

# Install backend dependencies
print_info "Installing backend dependencies..."
npm install
print_success "Backend dependencies installed"

# Setup environment file
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    cp .env.example .env
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32)
    
    # Update .env file
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|g" .env
    
    print_success ".env file created"
    print_info "Please review and update backend/.env with your settings"
else
    print_info ".env file already exists"
fi

# Create necessary directories
mkdir -p uploads logs
print_success "Created uploads and logs directories"

cd ..

echo ""
echo "=========================================="
echo "Setting up Frontend"
echo "=========================================="
echo ""

cd frontend

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Setup environment file
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
    print_success ".env file created"
else
    print_info ".env file already exists"
fi

cd ..

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "1. Start Backend (in terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start Frontend (in terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "3. Access the application:"
echo "   http://localhost:3000"
echo ""
echo "=========================================="
echo "Optional: Check DevOps Tools"
echo "=========================================="
echo ""

# Check for DevOps tools
TOOLS=("docker" "kubectl" "helm" "terraform" "ansible" "argocd")

for tool in "${TOOLS[@]}"; do
    if command -v $tool &> /dev/null; then
        VERSION=$($tool version 2>/dev/null | head -n 1 || echo "installed")
        print_success "$tool: $VERSION"
    else
        print_info "$tool: Not installed"
    fi
done

echo ""
print_info "Install missing tools to use all platform features"
echo ""
echo "=========================================="
echo "For production deployment, see:"
echo "docs/DEPLOYMENT.md"
echo "=========================================="