# 🚀 Multimind Deployment Guide

This guide walks you through deploying Multimind to production using free-tier services: Render (backend), Vercel (frontend), and Supabase (database).

## 📋 Prerequisites

- GitHub account with your Multimind repository
- Supabase account (free tier)
- Render account (free tier)
- Vercel account (free tier)
- OpenAI API key (with $5 free credit)

## 🗄️ Step 1: Set Up Database (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and enter:
   - **Name**: `multimind-db`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"

### 1.2 Get Database Connection Details
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your actual database password
4. Save this as your `DATABASE_URL`

### 1.3 Run Database Migrations
```bash
# Clone your repository locally
git clone https://github.com/your-username/multimind.git
cd multimind/backend

# Set up environment
cp .env.supabase.example .env
# Edit .env with your Supabase credentials

# Install dependencies and run migrations
source .venv/bin/activate  # or create new venv
uv pip install -r requirements/base.txt
alembic upgrade head

# Seed initial agents
python scripts/seed_agents.py
```

## 🖥️ Step 2: Deploy Backend (Render)

### 2.1 Create Render Web Service
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `multimind-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: `Free`

### 2.2 Set Environment Variables
In Render dashboard, go to **Environment** and add:

```bash
DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
OPENAI_API_KEY=sk-your-openai-api-key-here
ENVIRONMENT=production
DEBUG=false
FRONTEND_URL=https://your-app.vercel.app
LOG_LEVEL=INFO
LOG_ENABLE_CONSOLE=true
```

> **🔥 New CORS Configuration**: The backend now automatically handles all Vercel preview URLs! When `ENVIRONMENT=production`, it allows:
> - All Vercel preview URLs (e.g., `https://your-app-abc123-username.vercel.app`)
> - Git branch URLs (e.g., `https://your-app-git-main.vercel.app`)
> - Your main production URL
> - No manual CORS configuration needed for each preview!

### 2.3 Deploy
1. Click "Create Web Service"
2. Render will automatically build using the `Dockerfile`
3. Wait for deployment to complete (~5-10 minutes)
4. Test your backend at: `https://your-service.onrender.com/api/v1/health`

## 🌐 Step 3: Deploy Frontend (Vercel)

### 3.1 Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`

### 3.2 Set Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables**:

```bash
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
NODE_ENV=production
```

### 3.3 Deploy
1. Click "Deploy"
2. Vercel will build and deploy automatically
3. Your app will be available at: `https://your-app.vercel.app`

### 3.4 Update Backend Frontend URL (Optional)
If you want to specify your main production URL, update your Render backend:
```bash
FRONTEND_URL=https://your-actual-app-name.vercel.app
```

> **✅ No CORS Updates Needed**: The backend automatically allows all Vercel URLs including:
> - Preview deployments: `https://your-app-abc123-username.vercel.app`
> - Branch deployments: `https://your-app-git-feature.vercel.app`
> - Production URL: `https://your-app.vercel.app`

## 🔧 Step 4: Configure CI/CD (Optional)

The repository includes GitHub Actions workflows that will:
- Run tests on every push
- Automatically trigger deployments on main branch

### 4.1 Set GitHub Secrets
In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**:

```bash
VITE_API_BASE_URL=https://your-backend-service.onrender.com/api
```

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend
```bash
curl https://your-backend-service.onrender.com/api/v1/health
# Should return: {"status":"healthy"}

curl https://your-backend-service.onrender.com/api/v1/agents
# Should return list of agents
```

### 5.2 Test Frontend
1. Visit your Vercel URL
2. Try sending a message with `@Assistant hello`
3. Verify you get a response

### 5.3 Test Full Flow
1. Open your deployed app
2. Send: `@Coder write a hello world function`
3. Send: `@Writer create a short story`
4. Verify different agents respond appropriately

## 🚨 Troubleshooting

### Backend Issues
- **Cold starts**: Free Render services sleep after 15 minutes. First request may take 30+ seconds
- **Database connection**: Check Supabase connection string format
- **CORS errors**: 
  - Ensure `ENVIRONMENT=production` is set in Render
  - Check backend logs for "CORS origins" to see what's allowed
  - Verify your Vercel URL matches the expected pattern
  - For custom domains, add them to `CORS_ORIGINS` manually

### Frontend Issues
- **API calls failing**: Verify `VITE_API_BASE_URL` points to your Render service
- **Build failures**: Check Node.js version compatibility

### Database Issues
- **Migration errors**: Run migrations locally first, then deploy
- **Connection timeouts**: Verify Supabase project is active

## 📊 Monitoring & Scaling

### Free Tier Limits
- **Render**: 750 CPU hours/month, sleeps after 15 min idle
- **Vercel**: 100 GB bandwidth/month
- **Supabase**: 500 MB database, 2 GB egress

### Upgrade Path
When you exceed free limits:
1. **Render**: Upgrade to Starter ($7/month) for no sleep
2. **Supabase**: Upgrade to Pro ($25/month) for 8 GB database
3. **Vercel**: Upgrade to Pro ($20/month) for more bandwidth

## 🔐 Security Checklist

- [ ] Database password is strong and secure
- [ ] OpenAI API key is kept secret
- [ ] CORS origins are properly configured
- [ ] Environment variables are not committed to git
- [ ] Supabase RLS (Row Level Security) is configured if needed

## 🎉 Success!

Your Multimind application is now deployed and ready for users!

**Next Steps:**
- Share your app URL with beta testers
- Monitor usage in Render, Vercel, and Supabase dashboards
- Set up alerts for service limits
- Plan scaling strategy based on user growth

---

**Estimated Total Cost**: $0/month (free tier)
**Deployment Time**: ~30 minutes
**Scaling Ready**: Yes, clear upgrade path available
