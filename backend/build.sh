#!/usr/bin/env bash
# Render build script — runs on every deploy
# Set in Render dashboard: Build Command = cd backend && chmod +x build.sh && ./build.sh

set -o errexit  # Exit on error

echo "📦 Installing dependencies..."
pip install -r requirements-cloud.txt

echo "🗄️ Running database migrations..."
cd "$(dirname "$0")"
python -c "
from config import settings
print(f'Database URL scheme: {settings.DATABASE_URL.split(\"://\")[0]}')
"
alembic upgrade head

echo "✅ Build complete!"
