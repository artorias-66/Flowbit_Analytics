# 🚀 Quick Start Guide - Flowbit Analytics

**Get your application running in under 10 minutes!**

## ⚡ Prerequisites

Ensure you have these installed:
- Node.js 20+ and npm 10+
- PostgreSQL 14+
- Python 3.9+

## 📦 Step 1: Install Dependencies (2 minutes)

```powershell
# In project root
cd c:\projects\assignment_flowbitAI

# Install Node.js dependencies for all workspaces
npm install
```

## 🗄️ Step 2: Setup Database (2 minutes)

```powershell
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE flowbit_analytics;
\q

# Copy environment file
Copy-Item .env.example .env

# Edit .env - Update DATABASE_URL with your PostgreSQL password
notepad .env
```

## 🔧 Step 3: Run Migrations (1 minute)

```powershell
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
cd ../..
```

## 📊 Step 4: Add Sample Data (1 minute)

**IMPORTANT**: Place your `Analytics_Test_Data.json` file in the `data/` folder, then:

```powershell
npm run db:seed
```

## 🐍 Step 5: Setup Python Environment (2 minutes)

**Open a NEW terminal window:**

```powershell
cd services/vanna
python -m venv venv
.\venv\Scripts\Activate
pip install -r requirements.txt
cd ../..
```

## 🎬 Step 6: Start All Services (3 terminals)

### Terminal 1 - Frontend
```powershell
cd apps/web
npm run dev
```
✅ Frontend: http://localhost:3000

### Terminal 2 - Backend API
```powershell
cd apps/api
npm run dev
```
✅ Backend: http://localhost:3001

### Terminal 3 - Vanna AI (with venv activated)
```powershell
cd services/vanna
.\venv\Scripts\Activate  # If not already activated
python main.py
```
✅ Vanna AI: http://localhost:8000

## ✨ Step 7: Test the Application

Open your browser to **http://localhost:3000**

You should see:
- ✅ Dashboard with 4 stat cards
- ✅ Charts displaying data
- ✅ Invoices table with search
- ✅ "Chat with Data" navigation link

Try asking in Chat:
- "What are the top 5 vendors by spend?"
- "Show me pending invoices"
- "What is the total spend this year?"

## 🐛 Troubleshooting

### "Cannot find module"
```powershell
npm install
```

### "Database connection failed"
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### "Port already in use"
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Python activation fails
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 Next Steps

1. ✅ Application running locally
2. 📖 Read [SETUP.md](./SETUP.md) for detailed instructions
3. 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
4. ✅ Check [CHECKLIST.md](./CHECKLIST.md) before submission
5. 📊 Review [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for architecture details

## 🎥 Record Your Demo

Once everything works:
1. Record 3-5 minute video
2. Show dashboard features
3. Demonstrate chat interface
4. Explain architecture
5. Upload to YouTube/Loom

## 📧 Submit Your Assignment

Email to: **recruit@flowbitai.com**

Include:
- Live application URLs
- GitHub repository link
- Demo video link
- Brief description

**Deadline: 10.11.2025**

---

**Need help?** Check [SETUP.md](./SETUP.md) for detailed troubleshooting!

🎉 **Happy coding!**
