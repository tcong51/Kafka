#!/bin/bash

# Stop all running containers
echo "Stopping all running containers..."
docker stop $(docker ps -aq)

# Remove all containers
echo "Removing all containers..."
docker rm $(docker ps -aq)

# Remove all images
echo "Removing all images..."
docker rmi $(docker images -q)

# Remove all volumes
echo "Removing all volumes..."
docker volume rm $(docker volume ls -q)

# Remove all networks (except bridge, host, and none)
echo "Removing all networks..."
docker network rm $(docker network ls | grep -v "bridge\|host\|none" | awk '/ / { print $1 }')

# System prune to clean up everything
echo "Running docker system prune..."
docker system prune -a --volumes -f

echo "Docker cleanup completed."
