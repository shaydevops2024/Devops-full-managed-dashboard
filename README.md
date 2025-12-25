
# DevOps Platform Dashboard



A full-stack DevOps automation platform running in Docker containers.



## 🐳 Quick Start with Docker



### Prerequisites

- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))

- Docker Compose installed (usually comes with Docker Desktop)



### Start the Application

```bash

cd ~/devops-dashboard

./docker-start.sh

```



Then open: **http://localhost:8082**



## 📦 What Gets Started



The docker-compose setup starts 3 containers:

1. **MongoDB** - Database (port 27017)

2. **Backend** - Node.js API (port 5000)

3. **Frontend** - React app with Nginx (port 8082)



## 🚀 Docker Commands



### Quick Commands

```bash

# Start everything

./docker-start.sh



# Stop everything

./docker-stop.sh



# View logs

./docker-logs.sh



# View logs for specific service

./docker-logs.sh backend

./docker-logs.sh frontend

./docker-logs.sh mongodb

```



### Management Commands

```bash

# Using the management script

./docker-manage.sh start      # Start containers

./docker-manage.sh stop       # Stop containers

./docker-manage.sh restart    # Restart containers

./docker-manage.sh rebuild    # Rebuild and restart

./docker-manage.sh logs       # View all logs

./docker-manage.sh status     # Check container status

./docker-manage.sh clean      # Remove everything including volumes

```



### Manual Docker Commands

```bash

# Start containers

docker-compose up -d



# Stop containers

docker-compose down



# View logs

docker-compose logs -f



# Rebuild images

docker-compose build



# View container status

docker-compose ps



# Execute command in container

docker-compose exec backend sh

docker-compose exec frontend sh



# Remove everything including volumes

docker-compose down -v

```



## 📋 Access Points



- **Frontend**: http://localhost:8082

- **Backend API**: http://localhost:5000

- **Backend Health**: http://localhost:5000/health

- **MongoDB**: localhost:27017



## 🔑 First Time Setup



1. Start the containers: `./docker-start.sh`

2. Open http://localhost:8082 in your browser

3. Click "Register" to create a new account

4. Fill in your details:

   - Username (min 3 characters)

   - Email

   - Password (min 6 characters)

5. Click "Register" and you'll be automatically logged in



## 📁 Docker Structure

```

~/devops-dashboard/

├── docker-compose.yml       # Main orchestration file

├── docker-start.sh         # Quick start script

├── docker-stop.sh          # Quick stop script

├── docker-manage.sh        # Management script

├── docker-logs.sh          # Logs viewer

├── backend/

│   ├── Dockerfile          # Backend container image

│   ├── .dockerignore

│   └── ...

├── frontend/

│   ├── Dockerfile          # Frontend container image

│   ├── nginx.conf          # Nginx configuration

│   ├── .dockerignore

│   └── ...

└── README.md

```



## 🛠️ Features



- ✅ User authentication (JWT)

- ✅ System monitoring (CPU, Memory, Disk)

- ✅ DevOps tool detection

- ✅ Manifest generation (Docker, K8s, Ansible, Terraform)

- ✅ File management

- ✅ Real-time metrics via WebSocket

- ✅ Docker container monitoring

- ✅ RESTful API



## ⚙️ Docker Configuration



### Ports

- **8082** - Frontend (Nginx)

- **5000** - Backend API

- **27017** - MongoDB



### Volumes

- `mongodb_data` - Persistent MongoDB data

- `./backend/uploads` - Uploaded files

- `./backend/logs` - Application logs

- `/var/run/docker.sock` - Docker socket (for container monitoring)



### Networks

- `devops-network` - Bridge network connecting all services



## 🔧 Troubleshooting



### Containers won't start

```bash

# Check Docker is running

docker ps



# View container logs

./docker-logs.sh



# Check specific service

docker-compose logs backend

docker-compose logs frontend

docker-compose logs mongodb

```



### Port already in use

```bash

# Find what's using the port

lsof -i :8082

lsof -i :5000



# Stop the containers

./docker-stop.sh



# Kill the process using the port

kill -9 <PID>

```



### Need to rebuild

```bash

# Rebuild everything

./docker-manage.sh rebuild



# Or manually

docker-compose down

docker-compose build --no-cache

docker-compose up -d

```



### Database issues

```bash

# Reset database (WARNING: deletes all data)

docker-compose down -v

docker-compose up -d

```



### View container details

```bash

# Check container status

docker-compose ps



# Inspect a container

docker inspect devops-backend

docker inspect devops-frontend

docker inspect devops-mongodb



# Execute commands inside container

docker-compose exec backend sh

docker-compose exec frontend sh

```



## 📊 Monitoring



### View Logs

```bash

# All services

./docker-logs.sh



# Specific service

./docker-logs.sh backend

./docker-logs.sh frontend

./docker-logs.sh mongodb



# Last 100 lines

docker-compose logs --tail=100



# Follow logs in real-time

docker-compose logs -f

```



### Container Stats

```bash

# Resource usage

docker stats



# Container processes

docker-compose top

```



## 🔄 Development vs Production



### Development Mode

```bash

# For development with hot reload, use the non-Docker setup

./quick-start.sh

```



### Production Mode (Current)

```bash

# Docker setup is production-ready

./docker-start.sh

```



## 🛑 Stopping the Application

```bash

# Stop all containers

./docker-stop.sh



# Or stop and remove volumes (WARNING: deletes data)

docker-compose down -v

```



## 📦 Data Persistence



Data is persisted in Docker volumes:

- MongoDB data: `mongodb_data` volume

- Uploaded files: `./backend/uploads` folder

- Application logs: `./backend/logs` folder



To backup data:

```bash

# Backup MongoDB

docker-compose exec mongodb mongodump --out=/data/backup



# Copy from container

docker cp devops-mongodb:/data/backup ./mongodb-backup

```



## 🔐 Security Notes



- Change the JWT_SECRET in production

- Use environment variables for sensitive data

- MongoDB has no authentication (add it for production)

- The app runs as root in containers (improve for production)



## 📝 Environment Variables



Backend (.env):

```env

NODE_ENV=production

PORT=5000

MONGODB_URI=mongodb://mongodb:27017/devops-platform

JWT_SECRET=your-super-secret-jwt-key

ALLOWED_ORIGINS=http://localhost:8082

```



Frontend (.env):

```env

REACT_APP_API_URL=http://localhost:5000/api

```



## 🚀 Quick Reference

```bash

# Start

./docker-start.sh



# Stop

./docker-stop.sh



# Logs

./docker-logs.sh



# Status

docker-compose ps



# Restart

docker-compose restart



# Rebuild

./docker-manage.sh rebuild

```



## 📄 License



ISC



---



**Ready to start? Run:** `./docker-start.sh`

