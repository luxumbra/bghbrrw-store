#!/bin/bash

echo "Getting publishable key from Medusa backend..."

# Wait for backend to be ready
until curl -s http://localhost:9000/health > /dev/null 2>&1; do
    echo "Waiting for backend to be ready..."
    sleep 5
done

echo "Backend is ready! Getting publishable key..."

# Get publishable key
KEY=$(curl -s -X POST \
  http://localhost:9000/admin/publishable-api-keys \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Development Key"
  }' | jq -r '.publishable_api_key.id')

if [ "$KEY" != "null" ] && [ -n "$KEY" ]; then
    echo "Publishable key created: $KEY"
    echo "Add this to your frontend .env.local file:"
    echo "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$KEY"
else
    echo "Failed to create publishable key. Make sure backend is running and you have proper credentials."
fi