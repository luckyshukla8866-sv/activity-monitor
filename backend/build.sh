#!/usr/bin/env bash
# Render build script — runs on every deploy
set -o errexit  # Exit on error

echo "📦 Installing dependencies..."
pip install -r requirements-cloud.txt

echo "🗄️ Running database migrations..."
python -c "
from config import settings
print(f'Database URL scheme: {settings.DATABASE_URL.split(\"://\")[0]}')
"
alembic upgrade head

echo "✅ Build complete!"
