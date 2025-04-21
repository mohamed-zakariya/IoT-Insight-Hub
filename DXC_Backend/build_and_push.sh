#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Variables
DOCKER_USERNAME="radwan2dev"
IMAGE_NAME="dxc-backend"
TAG="latest"

# Function to build the Docker image
build_image() {
    echo "Building the Docker image..."
    docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$TAG .
}

# Function to push the Docker image to Docker Hub
push_image() {
    echo "Logging in to Docker Hub..."
    docker login
    echo "Pushing the Docker image to Docker Hub..."
    docker push $DOCKER_USERNAME/$IMAGE_NAME:$TAG
}

# Main script
echo "Starting the Docker build and push process..."
build_image
push_image
echo "Docker image $DOCKER_USERNAME/$IMAGE_NAME:$TAG has been successfully built and pushed to Docker Hub."
