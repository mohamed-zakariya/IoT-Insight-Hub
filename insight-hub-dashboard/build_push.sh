#!/bin/bash
set -x

# Load environment variables
source version.env

# Recompute TAG after sourcing
TAG="s4-$VERSION"

echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME:$TAG .

echo "🚀 Pushing Docker image..."
docker push $IMAGE_NAME:$TAG
