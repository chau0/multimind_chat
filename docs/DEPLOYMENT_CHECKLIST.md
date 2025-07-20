# 📋 Deployment Checklist

Use this checklist to ensure a smooth deployment of Multimind to production.

## 🔧 Pre-Deployment Setup

### Repository Preparation
- [ ] Code is committed and pushed to main branch
- [ ] All tests are passing locally
- [ ] Environment examples are up to date
- [ ] Secrets are not committed to repository
- [ ] `.gitignore` files are properly configured

### Database Setup (Supabase)
- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Connection string obtained and tested
- [ ] Migrations run successfully: `alembic upgrade head`
- [ ] Initial agents seeded: `python scripts/seed_agents.py`
- [ ] Database connection tested from local environment

### API Keys & Secrets
- [ ] OpenAI API key obtained (or Azure OpenAI configured)
- [ ] API key tested with a simple request
- [ ] All sensitive data identified for environment variables

## 🖥️ Backend Deployment (Render)

### Service Configuration
- [ ] Render account created and verified
- [ ] GitHub repository connected to Render
- [ ] Web Service created with correct settings:
  - [ ] Name: `multimind-backend`
  - [ ] Root Directory: `backend`
  - [ ] Environment: `Docker`
  - [ ] Plan: `Free` (or higher)

### Environment Variables
- [ ] `DATABASE_URL` - Supabase PostgreSQL connection string
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `ENVIRONMENT=production`
- [ ] `DEBUG=false`
- [ ] `CORS_ORIGINS` - Frontend URL (update after frontend deployment)
- [ ] `LOG_LEVEL=INFO`
- [ ] `LOG_ENABLE_CONSOLE=true`

### Deployment Verification
- [ ] Service builds successfully (check build logs)
- [ ] Service starts without errors (check runtime logs)
- [ ] Health endpoint responds: `GET /api/v1/health`
- [ ] Agents endpoint responds: `GET /api/v1/agents`
- [ ] Database connection working (check logs for connection success)

## 🌐 Frontend Deployment (Vercel)

### Project Configuration
- [ ] Vercel account created and verified
- [ ] GitHub repository connected to Vercel
- [ ] Project created with correct settings:
  - [ ] Framework: `Vite`
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist/public`

### Environment Variables
- [ ] `VITE_API_BASE_URL` - Backend URL from Render
- [ ] `NODE_ENV=production`

### Deployment Verification
- [ ] Build completes successfully
- [ ] Site loads without errors
- [ ] API calls work (check browser network tab)
- [ ] Chat functionality works end-to-end
- [ ] All agent mentions work correctly

## 🔄 Post-Deployment Configuration

### Backend CORS Update
- [ ] Update Render backend `CORS_ORIGINS` with actual Vercel URLs:
  - [ ] Production URL: `https://your-app.vercel.app`
  - [ ] Preview URLs: `https://your-app-git-main.vercel.app`
- [ ] Redeploy backend service
- [ ] Test CORS by making requests from frontend

### Domain Configuration (Optional)
- [ ] Custom domain configured in Vercel
- [ ] SSL certificate verified
- [ ] Backend CORS updated with custom domain
- [ ] DNS propagation verified

## 🧪 End-to-End Testing

### Basic Functionality
- [ ] Homepage loads correctly
- [ ] Agent list displays properly
- [ ] Chat input accepts messages
- [ ] Messages are sent and stored
- [ ] AI responses are generated

### Agent Testing
- [ ] `@Assistant` responds appropriately
- [ ] `@Coder` provides code examples
- [ ] `@Writer` creates written content
- [ ] `@Researcher` provides analytical responses
- [ ] Multiple agents can be mentioned in one message

### Error Handling
- [ ] Invalid API requests return proper error messages
- [ ] Network errors are handled gracefully
- [ ] Loading states work correctly
- [ ] Empty states display properly

## 📊 Monitoring Setup

### Service Monitoring
- [ ] Render service health monitoring enabled
- [ ] Vercel deployment notifications configured
- [ ] Supabase usage monitoring reviewed

### Performance Monitoring
- [ ] Backend response times checked
- [ ] Frontend load times verified
- [ ] Database query performance reviewed
- [ ] API rate limits understood

### Alerting (Optional)
- [ ] Uptime monitoring configured (e.g., UptimeRobot)
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Usage alerts configured for free tier limits

## 🔐 Security Review

### Environment Security
- [ ] All secrets stored in platform environment variables
- [ ] No sensitive data in repository
- [ ] CORS properly configured
- [ ] HTTPS enforced on all services

### Database Security
- [ ] Supabase RLS (Row Level Security) reviewed
- [ ] Database access limited to application
- [ ] Connection strings use SSL
- [ ] Backup strategy understood

### API Security
- [ ] Rate limiting considered for production
- [ ] Input validation working
- [ ] Error messages don't leak sensitive information
- [ ] OpenAI API usage monitoring enabled

## 📈 Scaling Preparation

### Usage Monitoring
- [ ] Baseline metrics established
- [ ] Free tier limits documented
- [ ] Usage tracking implemented
- [ ] Scaling triggers identified

### Upgrade Planning
- [ ] Render upgrade path understood ($7/month Starter)
- [ ] Vercel upgrade path understood ($20/month Pro)
- [ ] Supabase upgrade path understood ($25/month Pro)
- [ ] Budget planning for growth

## ✅ Go-Live Checklist

### Final Verification
- [ ] All tests passing
- [ ] All monitoring in place
- [ ] All team members have access
- [ ] Documentation updated
- [ ] Rollback plan prepared

### Launch
- [ ] DNS changes propagated (if using custom domain)
- [ ] Social media/announcement prepared
- [ ] User feedback collection ready
- [ ] Support process defined

### Post-Launch
- [ ] Monitor for first 24 hours
- [ ] Collect initial user feedback
- [ ] Review performance metrics
- [ ] Plan next iteration

---

## 🚨 Emergency Contacts & Resources

- **Render Status**: https://status.render.com/
- **Vercel Status**: https://www.vercel-status.com/
- **Supabase Status**: https://status.supabase.com/
- **OpenAI Status**: https://status.openai.com/

## 📞 Rollback Procedure

If issues arise:
1. Check service status pages
2. Review recent deployments in platform dashboards
3. Rollback to previous deployment if needed
4. Check environment variables for changes
5. Review logs for error patterns
6. Contact platform support if needed

---

**Estimated Deployment Time**: 30-60 minutes
**Recommended Team Size**: 1-2 people
**Prerequisites**: GitHub, Supabase, Render, Vercel accounts