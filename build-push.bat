#!/usr/bin/env bash
set -euo pipefail

# --- CONFIGURATION ---
DOCKER_ORG="iotinsighthub"
BACKEND_DIR="DXC_Backend"
FRONTEND_DIR="insight-hub-dashboard"
BACKEND_IMAGE="$DOCKER_ORG/iot_backend:latest"
FRONTEND_IMAGE="$DOCKER_ORG/iot_frontend:latest"

# --- BUILD & PUSH BACKEND ---
echo "🔨 Building backend..."
docker build -t "$BACKEND_IMAGE" "$BACKEND_DIR"
echo "📤 Pushing backend..."
docker push "$BACKEND_IMAGE"

# --- BUILD & PUSH FRONTEND ---
echo "🔨 Building frontend..."
docker build -t "$FRONTEND_IMAGE" "$FRONTEND_DIR"
echo "📤 Pushing frontend..."
docker push "$FRONTEND_IMAGE"

# --- START SERVICES ---
echo "⏯️  Bringing up the Docker Compose stack..."
docker-compose up -d

echo "✅ Deployment complete!"
