
📦 Low-Cost Deployment Blueprint
Layer	Free-tier option (for MVP)	What it gives you	Typical hard limit*
Frontend	Vercel Hobby	Global CDN, automatic Git deploys, HTTPS	100 GB-mo bandwidth / 1 GB builds
Backend API	Render “Web Service – Free” or Railway “Starter”	750 CPU-hrs-mo, 512 MB RAM, Docker-based deploy, cron jobs	0.1 vCPU, 512 MB, sleeps after 15 min idle
Database	Supabase Free (PostgreSQL ≤ 500 MB)	Persistent DB, SQL editor, row-level security	500 MB, 2 GB egress
Object/file storage	Supabase Storage Free bucket	1 GB	2 GB egress
LLM	OpenAI credit, or self-host Ollama on Render	First $5 free, or local Mistral-7B	n/a

*as of Jul 2025 – always confirm current quotas.

The choices match your stack recommendations (Next.js ➜ Vercel; FastAPI ➜ Render/Railway; SQLite→PostgreSQL via Supabase)
.

1 ️⃣ Prepare the repo
Keep frontend/ (Vite/React) and backend/ (FastAPI + Dockerfile) in one GitHub monorepo—both Vercel and Render can pick sub-dirs automatically.

Move secrets (OpenAI key, DB URL, CORS origins, etc.) to environment variables exactly as shown in .env and Dockerfile examples
.

2 ️⃣ Deploy the backend (Render example)
Dockerfile already provided; Render will auto-detect it.

In Render → “New ► Web Service” choose your repo, set Root Dir to backend/.

Environment variables: paste DATABASE_URL, OPENAI_API_KEY, OLLAMA_BASE_URL (optional), ENVIRONMENT=production.

Plan: Docker build → uvicorn app.main:app --host 0.0.0.0 --port 8000.

Enable free Postgres add-on only for local dev; for prod we point to Supabase (next step).

Verify health at /api/v1/health (curl returns {"status":"healthy"})
.

Cost: $0 (free tier) until you exceed 750 hours of active CPU per month; the service “sleeps” after 15 minutes idle—acceptable for MVP.

3 ️⃣ Provision the database (Supabase Free)
Create new Supabase project → choose Free tier.

Note the DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT.

Update Render env DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME.

Run migrations once (Render shell or locally with alembic upgrade head) followed by the seed script for default agents
.

Supabase Storage bucket can keep avatar images or exported chat logs.

4 ️⃣ Deploy the frontend (Vercel)
In Vercel → “Import Git Repository” → pick repo, set Root Dir frontend/.

Build command: npm run build; output dir: dist/. Vercel auto-detects Vite.

Add env VITE_API_BASE=https://<render-service>.onrender.com so the proxy in vite.config.ts is only for local dev
.

First deploy finishes in < 2 min; the global CDN caches static assets.

5 ️⃣ Zero-cost LLM strategy
During private alpha use the free $5 OpenAI credit or model-switching: GPT-3.5 for long chats, GPT-4o only when the user explicitly asks for deeper analysis.

For a totally free path, spin up an Ollama instance on Render (same free tier) and load mistral-openorca – call it via internal network to avoid egress charges.

⚠️ Risks & Mitigations
Risk	Why it happens	Mitigation
Cold-starts / 30-s lag	Free dynos sleep	Turn on “Background worker ping” (free cron) or move to paid $7/mo tier
Exceeding free PG limits	500 MB reached with message history	Trim old chats; archive to S3-compatible storage; enable Supabase $25 Pro when nearing 80 %
Ephemeral disk on Render	If you stay on SQLite inside container it wipes on redeploy	We avoided this by using Supabase Postgres
OpenAI billing surprise	Unbounded token usage	Add per-user rate-limit middleware + prometheus counters (Phase 5)
Single region latency	Free tiers are one-region	Choose same region on Vercel, Render, Supabase (e.g., asia-northeast1)

📈 Scaling plan when users grow
Stage	Trigger	Action
Tier +1 (“Hobby → Starter”)	>100 daily active users OR cold-start complaints	Upgrade Render to paid $7/mo instance (0.5 vCPU, 1 GB RAM, no sleep)
Database upgrade	>80 % of 500 MB or >20 req/s	Switch Supabase to Pro; enable read replicas & pgBouncer connection pool
Horizontal API scaling	p95 latency >500 ms, CPU > 70 %	Enable auto-scaling on Render (1–3 instances), add Redis cache for agent config
Message queue & workers	Long-running LLM calls blocking HTTP	Offload LLM calls to background worker service; HTTP returns 202 + WS stream
Edge deployments	Global audience >50 % outside primary region	Move frontend to Vercel Pro (edge functions), backend to Fly.io multi-region or Vercel Serverless Functions

Because your architecture already separates chat UI (stateless) from API + DB, scaling each layer independently is straightforward
.

📝 Next steps checklist
 Add .github/workflows/* for CI lint/test and auto-deploy to Vercel & Render.

 Enable Supabase nightly backup (1 click, free).

 Write a simple /metrics endpoint and deploy Grafana Cloud free tier dashboard.

 Document upgrade playbook in docs/SCALING.md.

Follow this guide and you can launch the Multi-Persona AI Chat MVP without spending a cent, yet have a clear runway to scale smoothly once real users arrive.
