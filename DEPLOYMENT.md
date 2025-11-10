# Deployment Guide - Flowbit Analytics

This guide covers deploying all three services to production.

## 🎯 Deployment Architecture

Recommended reference implementation (what this repo now supports out of the box):

- **Frontend (Next.js)**: Vercel (build + serverless / edge)
- **Backend API (Express)**: Render (Docker) or Vercel Serverless (alternative)
- **Vanna AI Service (FastAPI)**: Render (Docker) / Railway / Fly.io
- **Database (Production)**: Postgres (Neon / Supabase / Vercel Postgres). SQLite is kept only for local development.

Additional artifacts added:
- `apps/api/Dockerfile` for containerizing the Node API with Prisma migrations on start.
- `services/vanna/Dockerfile` for containerizing the FastAPI Vanna service.
- `docker-compose.yml` for local multi-service simulation.
- `.env.production.example` files per service for required variables.

## 📦 Pre-Deployment Checklist

- [ ] All features working locally
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] CORS configured properly

## 🚀 Deploy Frontend to Vercel

### 1. Install Vercel CLI

```powershell
npm install -g vercel
```

### 2. Deploy Frontend (Next.js)

```powershell
cd apps/web

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? flowbit-analytics-web
# - Directory? ./
# - Override settings? No
```

Vercel will provide a URL like: `https://flowbit-analytics-web.vercel.app`

## 🧩 Deploy Backend API (Express)

### Option A: Render (Docker) – Recommended

The repository includes a production `apps/api/Dockerfile` that:
1. Installs dependencies
2. Generates Prisma Client against Postgres schema (`schema.postgres.prisma`)
3. Builds TypeScript → `dist` output
4. On container start runs `prisma migrate deploy` then launches the server.

Steps:
1. Push code to GitHub (public or private connected to Render).
2. In Render dashboard: New → Web Service.
3. Select repo; set **Root Directory** to `apps/api` (Render will still build context from root—adjust to use Docker).
4. Choose "Use Dockerfile". Render auto-detects `apps/api/Dockerfile` if root used; if not, set root to repository and specify Docker path.
5. Set Environment Variables:
  - `DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require`
  - `PORT=3001`
6. Deploy. The service will run migrations automatically. Logs will show Prisma migrate status and `🚀 API server running...`.

### Option B: Vercel Serverless Functions (Requires Refactor)

Current Express app is a single server (`app.listen`). To use Vercel serverless you must:
1. Export the Express app without calling `listen` (e.g., `export default app`).
2. Add an entry file under `api/` directory or use `vercel.json` configuration mapping functions.
3. Remove or adapt long-lived state (none currently beyond Prisma). Prisma works fine in serverless with connection pooling (use Neon/Supabase). 

Given time constraints, Option A (Render Docker) is the quickest path.

### Option C: Railway (Docker or Nixpacks)

Similar to Render; if using Docker just point to the repo and set env vars. Use `railway variables` CLI for environment management.

### 4. Set Environment Variables (Frontend Project on Vercel)

Go to your Vercel project dashboard → Settings → Environment Variables

Add:
```
DATABASE_URL=your-production-database-url
VANNA_API_BASE_URL=https://vanna-gq7r.onrender.com
NEXT_PUBLIC_API_BASE=https://flowbit-ai-58t0.onrender.com
NEXT_PUBLIC_APP_URL=https://flowbit-analytics-web-two.vercel.app
```

### 5. Redeploy with New Environment Variables

```powershell
vercel --prod
```

## 🐍 Deploy Vanna AI Service (FastAPI)

### Option 1: Render (Docker)

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: flowbit-vanna-ai
  - **Root Directory**: repository root (Render will find `services/vanna/Dockerfile`). Or set root to `services/vanna` and ensure Dockerfile is inside.
  - **Dockerfile**: `services/vanna/Dockerfile`
  - No separate build/start commands needed — handled by Docker.
5. Add Environment Variables:
   - `DATABASE_URL`: Your production database URL
   - `GROQ_API_KEY`: Your Groq API key
   - `VANNA_API_KEY`: Your Vanna API key
6. Click "Create Web Service"

Render will provide a URL like: `https://flowbit-vanna-ai.onrender.com` (use this in `VANNA_API_BASE_URL`).

### Option 2: Railway

```powershell
cd services/vanna

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize new project
railway init

# Deploy
railway up

# Add environment variables
railway variables set DATABASE_URL=your-db-url
railway variables set GROQ_API_KEY=your-key
```

### Option 3: Fly.io (Docker)

```powershell
cd services/vanna

# Install Fly CLI (Windows)
iwr https://fly.io/install.ps1 -useb | iex

# Login
fly auth login

# Launch app
fly launch

# Follow prompts and deploy
fly deploy
```

## 🗄️ Deploy Database

### Option 1: Vercel Postgres

1. Go to Vercel dashboard
2. Select your project
3. Go to Storage tab
4. Create Postgres database
5. Copy connection string
6. Update DATABASE_URL in all services

### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use "Session" mode for Prisma)
5. Update DATABASE_URL

### Option 3: Neon

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update DATABASE_URL

### Run Migrations in Production (Postgres)

```powershell
# PowerShell example: run once after provisioning Postgres
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
cd apps/api
npx prisma migrate deploy --schema=prisma/schema.postgres.prisma
# Optional seed (adjust seed script to work with Postgres data expectations)
npm run db:seed
```

## 🔧 Update CORS Configuration

Update `apps/api/src/index.ts` for production origins:

```typescript
app.use(cors({
  origin: [
    'https://flowbit-analytics-web-two.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `analytics.yourdomain.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

## ✅ Post-Deployment Verification

Test each service:

```powershell
# Test frontend
curl https://flowbit-analytics-web-two.vercel.app

# Test backend API
curl https://flowbit-ai-58t0.onrender.com/health

# Test Vanna AI service
curl https://vanna-gq7r.onrender.com/health
```

Test the chat feature:
```powershell
curl -X POST https://vanna-gq7r.onrender.com/chat `
  -H "Content-Type: application/json" `
  -d '{"question":"What are the top 5 vendors?"}'
```

## 📊 Monitoring & Logs

### Vercel Logs
```powershell
vercel logs production
```

### Render Logs
Go to Render dashboard → Your service → Logs tab

### Railway Logs
```powershell
railway logs
```

## 🔐 Security Checklist

- [ ] Environment variables not committed to Git
- [ ] CORS properly configured
- [ ] Database URL uses SSL (`?sslmode=require`)
- [ ] API rate limiting implemented (optional)
- [ ] Groq API key secured
- [ ] Database backups enabled

## 📈 Performance Optimization

### Frontend
- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images with Next.js Image component
- [ ] Enable gzip/brotli compression

### Backend
- [ ] Database connection pooling
- [ ] API response caching
- [ ] Query optimization with Prisma

### Vanna AI
- [ ] Keep service warm (cron job to ping every 5 minutes)
- [ ] Cache frequent queries
- [ ] Optimize SQL generation

## 🚨 Troubleshooting Production Issues

### Frontend shows "API Error"
- Check NEXT_PUBLIC_API_BASE is set correctly
- Verify backend is running
- Check browser console for CORS errors

### Backend database connection fails
- Verify DATABASE_URL includes `?sslmode=require`
- Check database is accessible from internet
- Verify Prisma Client is generated

### Vanna AI service timeout
- Check GROQ_API_KEY is valid
- Verify database connection
- Check service logs for errors

## 📝 Deployment Workflow

For future updates:

```powershell
# 1. Make changes locally
git add .
git commit -m "feat: new feature"
git push origin main

# 2. Vercel auto-deploys from Git
# (if you connected your repo)

# 3. Or manually deploy
cd apps/web
vercel --prod

cd apps/api
vercel --prod

# 4. Vanna service redeploys automatically on Git push
# (if connected to Render/Railway)
```

## 🎉 Success!

Your application is now live at:
- Frontend: https://flowbit-analytics-web-two.vercel.app
- Backend: https://flowbit-ai-58t0.onrender.com
- Vanna AI: https://vanna-gq7r.onrender.com

Share these URLs in your internship submission!

---

**Need to rollback?**
```powershell
vercel rollback
```
