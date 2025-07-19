# Supabase PostgreSQL Migration Guide

This guide will help you migrate the Multimind backend from Azure SQL to Supabase PostgreSQL.

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)

## Step 1: Get Supabase Database URL

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Copy the connection string under "Connection string" → "URI"
4. It should look like: `postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

## Step 2: Configure Environment

1. Copy the Supabase environment template:
   ```bash
   cd backend
   cp .env.supabase.example .env
   ```

2. Edit `.env` and update these values:
   ```bash
   # Method 1: Using Supabase Client (Recommended)
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_KEY=your-anon-public-key-here
   
   # Method 2: Direct PostgreSQL URL (Alternative)
   # DATABASE_URL=postgresql://postgres.your-ref:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   
   # Replace with your OpenAI API key
   OPENAI_API_KEY=sk-your-openai-api-key-here
   
   # Application settings
   ENVIRONMENT=development
   DEBUG=true
   CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
   ```

### Getting Your Supabase Credentials

**For Method 1 (Recommended):**
- **SUPABASE_URL**: Found in Project Settings → API → Project URL
- **SUPABASE_KEY**: Found in Project Settings → API → Project API keys → `anon` `public` key

**For Method 2 (Direct PostgreSQL):**
- **DATABASE_URL**: Found in Project Settings → Database → Connection string → URI

## Step 3: Install Dependencies

The backend now supports both PostgreSQL and Azure SQL. Install the updated dependencies:

```bash
cd backend
uv pip install -r requirements/base.txt
```

New dependencies added:
- `psycopg2-binary`: PostgreSQL adapter for Python
- `asyncpg`: Async PostgreSQL driver

## Step 4: Test Configuration

Run the test script to verify your setup:

```bash
cd backend
python tmp_rovodev_test_migration.py
```

This will test:
- Configuration loading
- Database connection
- Model imports

## Step 5: Run Database Migrations

Create and apply the database schema:

```bash
cd backend

# Generate a new migration for PostgreSQL
alembic revision --autogenerate -m "migrate_to_postgresql"

# Apply all migrations
alembic upgrade head
```

## Step 6: Seed Initial Data

Populate the database with initial agents:

```bash
cd backend
python scripts/seed_agents.py
```

## Step 7: Start the Application

```bash
cd backend
make dev
```

The backend will start on http://localhost:8000

## Step 8: Test the API

Test the health endpoint:
```bash
curl http://localhost:8000/api/v1/health
```

Test the agents endpoint:
```bash
curl http://localhost:8000/api/v1/agents
```

## Step 9: Run Tests

```bash
cd backend
make test
```

## Configuration Changes Made

### 1. Updated `app/config.py`
- Added support for `DATABASE_URL` environment variable
- Maintains backward compatibility with Azure SQL configuration
- Added support for both Azure OpenAI and standard OpenAI
- Added CORS configuration

### 2. Updated `app/utils/db.py`
- Dynamic connection arguments based on database type
- Support for both PostgreSQL and SQL Server drivers

### 3. Updated `app/external/openai_client.py`
- Support for both Azure OpenAI and standard OpenAI
- Automatic client selection based on configuration

### 4. Updated Dependencies
- Added PostgreSQL drivers (`psycopg2-binary`, `asyncpg`)
- Maintained SQL Server drivers for backward compatibility

## Environment Variables Reference

### Required for Supabase + OpenAI
```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

### Optional
```bash
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### Legacy Azure Configuration (still supported)
```bash
AZURE_SQL_SERVER=...
AZURE_SQL_DATABASE=...
AZURE_SQL_USERNAME=...
AZURE_SQL_PASSWORD=...
AZURE_OPENAI_ENDPOINT=...
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_DEPLOYMENT=...
```

## Troubleshooting

### Database Connection Issues
1. Verify your Supabase URL is correct
2. Check that your Supabase project is active
3. Ensure the password in the URL is correct

### OpenAI API Issues
1. Verify your API key is valid
2. Check you have sufficient credits
3. Ensure the key has the correct permissions

### Migration Issues
1. Drop all tables in Supabase dashboard if needed
2. Re-run `alembic upgrade head`
3. Check the migration files in `migrations/versions/`

## Production Deployment

For production (e.g., Render), use the production environment template:
```bash
cp .env.production.example .env
```

Update with your production Supabase URL and OpenAI key.