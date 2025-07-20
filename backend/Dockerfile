FROM python:3.11-slim

# Install system dependencies for PostgreSQL (Supabase) and optional Azure SQL support
RUN apt-get update && apt-get install -y \
    curl \
    apt-transport-https \
    gnupg \
    unixodbc-dev \
    libpq-dev \
    gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Optional: Install Microsoft ODBC Driver for SQL Server (for Azure SQL support)
# Uncomment if you need Azure SQL Database support
# RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
#     && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
#     && apt-get update \
#     && ACCEPT_EULA=Y apt-get install -y msodbcsql18

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

