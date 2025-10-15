
#!/bin/bash
# Blue-Green Deployment Script
# Sprint 44

set -e

ENVIRONMENT=${1:-production}
VERSION=${2:-$(git rev-parse --short HEAD)}

echo "🚀 Starting Blue-Green deployment for $ENVIRONMENT..."

# 1. Build new version
echo "📦 Building version $VERSION..."
yarn build

# 2. Deploy to GREEN environment
echo "🟢 Deploying to GREEN environment..."
# Replace with your actual deployment command
# Example: kubectl apply -f k8s/green-deployment.yml
# Example: vercel deploy --env green

GREEN_URL="https://green-$ENVIRONMENT.example.com"

# 3. Health check GREEN
echo "🏥 Health check on GREEN..."
sleep 30

for i in {1..10}; do
  if curl -f "$GREEN_URL/api/health"; then
    echo "✅ GREEN is healthy"
    break
  fi
  
  if [ $i -eq 10 ]; then
    echo "❌ GREEN health check failed"
    exit 1
  fi
  
  sleep 5
done

# 4. Run smoke tests
echo "🧪 Running smoke tests on GREEN..."
BASE_URL=$GREEN_URL yarn playwright test tests/e2e/smoke.spec.ts

if [ $? -ne 0 ]; then
  echo "❌ Smoke tests failed on GREEN"
  exit 1
fi

# 5. Switch traffic (Blue -> Green)
echo "🔄 Switching traffic to GREEN..."
# Replace with your actual traffic switching command
# Example: kubectl patch service app-service -p '{"spec":{"selector":{"version":"green"}}}'
# Example: Update load balancer target

# 6. Verify production
echo "✅ Verifying production..."
PROD_URL="https://$ENVIRONMENT.example.com"
curl -f "$PROD_URL/api/health"

echo "🎉 Deployment successful!"
echo "GREEN is now serving production traffic"
echo "BLUE is on standby for rollback"

# 7. Optional: Scale down BLUE after 10 minutes
# sleep 600
# kubectl scale deployment app-blue --replicas=0
