FROM python:3.11-slim

# Install system dependencies for PostgreSQL (Supabase)
RUN apt-get update && apt-get install -y \
    curl \
    libpq-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

# Install Python dependencies
COPY requirements/ requirements/
RUN pip install uv && \
    uv pip install --system --no-cache -r requirements/base.txt

# Copy application code
COPY . .

# Use PORT environment variable from Render, fallback to 8000
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
