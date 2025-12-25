
# Docker Setup Guide - DevOps Dashboard



## 🎯 Complete Docker Installation



### Step 1: Install Docker



#### Ubuntu/Debian

```bash

# Update package index

sudo apt-get update



# Install prerequisites

sudo apt-get install -y \

    ca-certificates \

    curl \

    gnupg \

    lsb-release



# Add Docker's official GPG key

sudo mkdir -p /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg



# Set up repository

echo \

  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \

  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null



# Install Docker Engine

sudo apt-get update

sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin



# Start Docker

sudo systemctl start docker

sudo systemctl enable docker



# Add your user to docker group (to run without sudo)

sudo usermod -aG docker $USER



# Log out and back in for group changes to take effect

```



#### macOS

```bash

# Download Docker Desktop from:

# https://www.docker.com/products/docker-desktop



# Or use Homebrew

brew install --cask docker

```



#### Windows

```powershell

# Download Docker Desktop from:

# https://www.docker.com/products/docker-desktop

```



### Step 2: Verify Docker Installation

```bash

# Check Docker version

docker --version



# Check Docker Compose

docker-compose --version

# OR (newer versions)

docker compose version



# Test Docker

docker run hello-world

```



### Step 3: Create All Files



Run all the commands from my previous message to create:

- Backend Dockerfile

- Frontend Dockerfile

- docker-compose.yml

- nginx.conf

- All scripts



### Step 4: Start the Application

```bash

cd ~/devops-dashboard

./docker-start.sh

```



## 🚀 Quick Start Commands



### First Time Setup

```bash

# 1. Navigate to project

cd ~/devops-dashboard



# 2. Make scripts executable

chmod +x *.sh



# 3. Start everything

./docker-start.sh

```



### Daily Use

```bash

# Start

./docker-start.sh



# Stop

./docker-stop.sh



# View logs

./docker-logs.sh



# Check status

docker-compose ps

```



## 📊 What Happens When You Start



1. **MongoDB container** starts first

   - Creates database volume

   - Waits for health check

   

2. **Backend container** starts

   - Connects to MongoDB

   - Starts API on port 5000

   - Waits for health check

   

3. **Frontend container** starts

   - Serves React app via Nginx

   - Available on port 8082

   - Proxies API calls to backend



## 🔍 Monitoring & Debugging



### View All Logs

```bash

docker-compose logs -f

```



### View Specific Service Logs

```bash

docker-compose logs -f backend

docker-compose logs -f frontend

docker-compose logs -f mongodb

```



### Check Container Status

```bash

docker-compose ps

```



### Enter a Container

```bash

# Backend

docker-compose exec backend sh



# Frontend

docker-compose exec frontend sh



# MongoDB

docker-compose exec mongodb mongosh

```



### Check Resource Usage

```bash

docker stats

```



## 🐛 Common Issues & Solutions



### Issue: Port already in use

```bash

# Find what's using port 8082

lsof -i :8082



# Kill the process

kill -9 <PID>



# Or change port in docker-compose.yml

ports:

  - "8083:80"  # Use 8083 instead

```



### Issue: Cannot connect to Docker daemon

```bash

# Start Docker service

sudo systemctl start docker



# Or check if Docker Desktop is running (Mac/Windows)

```



### Issue: Permission denied

```bash

# Add user to docker group

sudo usermod -aG docker $USER



# Log out and back in

```



### Issue: Containers keep restarting

```bash

# Check logs

docker-compose logs backend



# Check health

docker inspect devops-backend | grep Health -A 10

```



### Issue: Database connection failed

```bash

# Check MongoDB is running

docker-compose ps mongodb



# Check MongoDB logs

docker-compose logs mongodb



# Restart MongoDB

docker-compose restart mongodb

```



## 🔄 Update & Rebuild



### After Code Changes

```bash

# Rebuild specific service

docker-compose build backend

docker-compose up -d backend



# Or rebuild everything

./docker-manage.sh rebuild

```



### Update Dependencies

```bash

# Update package.json

# Then rebuild

docker-compose build --no-cache

docker-compose up -d

```



## 💾 Data Management



### Backup Database

```bash

# Create backup

docker-compose exec mongodb mongodump --out=/data/backup



# Copy to host

docker cp devops-mongodb:/data/backup ./backup-$(date +%Y%m%d)

```



### Restore Database

```bash

# Copy backup to container

docker cp ./backup devops-mongodb:/data/backup



# Restore

docker-compose exec mongodb mongorestore /data/backup

```



### Reset Everything

```bash

# WARNING: This deletes all data!

docker-compose down -v

docker-compose up -d

```



## 🔐 Production Considerations



### Before Going to Production



1. **Change JWT Secret**

```bash

   # Generate strong secret

   openssl rand -base64 32

   

   # Update in docker-compose.yml

   JWT_SECRET=<your-strong-secret>

```



2. **Enable MongoDB Authentication**

```yaml

   mongodb:

     environment:

       MONGO_INITDB_ROOT_USERNAME: admin

       MONGO_INITDB_ROOT_PASSWORD: <strong-password>

```



3. **Use Environment File**

```bash

   # Create .env file

   cat > .env << 'ENVEOF'

   JWT_SECRET=your-secret

   MONGO_PASSWORD=your-password

   ENVEOF

   

   # Reference in docker-compose.yml

   JWT_SECRET=${JWT_SECRET}

```



4. **Enable SSL/TLS**

   - Add nginx SSL configuration

   - Use Let's Encrypt certificates



5. **Run as Non-Root User**

```dockerfile

   # In Dockerfile

   USER node

```



## 📈 Scaling



### Scale Services

```bash

# Run multiple backend instances

docker-compose up -d --scale backend=3

```



### Add Load Balancer

Add nginx container for load balancing



## 🎯 Complete Example Workflow

```bash

# 1. Install Docker (if not already)

curl -fsSL https://get.docker.com -o get-docker.sh

sudo sh get-docker.sh



# 2. Navigate to project

cd ~/devops-dashboard



# 3. Start application

./docker-start.sh



# 4. Wait for startup

sleep 30



# 5. Check status

docker-compose ps



# 6. View logs

./docker-logs.sh



# 7. Access application

# Open browser: http://localhost:8082



# 8. When done

./docker-stop.sh

```



## ✅ Verification Checklist



After running `./docker-start.sh`:



- [ ] 3 containers running (mongodb, backend, frontend)

- [ ] Backend health check passing

- [ ] MongoDB health check passing

- [ ] Can access http://localhost:8082

- [ ] Can access http://localhost:5000/health

- [ ] Can register a new user

- [ ] Can login

- [ ] Dashboard loads with metrics



## 🆘 Getting Help



### Check Docker Installation

```bash

docker --version

docker-compose --version

docker ps

```



### Check Application Status

```bash

cd ~/devops-dashboard

docker-compose ps

docker-compose logs

```



### Full Reset

```bash

# Stop and remove everything

docker-compose down -v



# Remove images

docker-compose down --rmi all



# Start fresh

./docker-start.sh

```



---



**Ready to start with Docker?**

```bash

cd ~/devops-dashboard

./docker-start.sh

```



Then open: http://localhost:8082

