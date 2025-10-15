
#!/bin/bash
# Rollback Script - Switch back to BLUE
# Sprint 44

set -e

echo "⚠️  Initiating rollback to BLUE..."

# 1. Switch traffic back to BLUE
echo "🔄 Switching traffic to BLUE..."
# Replace with your actual rollback command
# Example: kubectl patch service app-service -p '{"spec":{"selector":{"version":"blue"}}}'

# 2. Health check BLUE
BLUE_URL="https://blue-production.example.com"
curl -f "$BLUE_URL/api/health"

if [ $? -eq 0 ]; then
  echo "✅ Rollback successful - BLUE is serving traffic"
else
  echo "❌ BLUE health check failed! Manual intervention required"
  exit 1
fi

# 3. Scale down GREEN
echo "🔴 Scaling down GREEN..."
# kubectl scale deployment app-green --replicas=0

echo "🎉 Rollback complete"
