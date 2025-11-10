# Flowbit Analytics - Setup Instructions

This guide will help you set up and run the complete Flowbit Analytics application.

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- ✅ **npm** >= 10.0.0 (comes with Node.js)
- ✅ **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))
- ✅ **Python** >= 3.9 ([Download](https://www.python.org/downloads/))
- ✅ **Git**

Verify installations:
```powershell
node --version  # Should be v20.0.0 or higher
npm --version   # Should be 10.0.0 or higher
psql --version  # Should be PostgreSQL 14 or higher
python --version # Should be Python 3.9 or higher
```

## 🚀 Step-by-Step Setup

### Step 1: Install Node Dependencies

Open PowerShell in the project root directory:

```powershell
# Install all dependencies (root + all workspaces)
npm install

# This will install dependencies for:
# - Root monorepo
# - apps/web (Next.js frontend)
# - apps/api (Express backend)
```

This may take 2-3 minutes. You'll see:
```
added 1500+ packages
```

### Step 2: Setup Environment Variables

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Open .env in notepad to edit
notepad .env
```

Update the following values in `.env`:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flowbit_analytics"

# Vanna AI Service URL (leave as is for local development)
VANNA_API_BASE_URL="http://localhost:8000"
VANNA_API_KEY="your-vanna-api-key"

# Groq LLM API Key - Get from https://console.groq.com
GROQ_API_KEY="gsk_your_groq_api_key_here"

# Frontend/Backend URLs (leave as is for local development)
NEXT_PUBLIC_API_BASE="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backend API Port
PORT=3001
NODE_ENV=development

# Vanna Service Port
VANNA_PORT=8000
```

**Important**: Replace `yourpassword` with your PostgreSQL password and add a real Groq API key.

### Step 3: Setup PostgreSQL Database

Open a new PowerShell terminal:

```powershell
# Connect to PostgreSQL (enter your password when prompted)
psql -U postgres

# Create the database
CREATE DATABASE flowbit_analytics;

# Verify creation
\l

# Exit psql
\q
```

### Step 4: Run Database Migrations

Back in your main terminal:

```powershell
# Navigate to API directory
cd apps/api

# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init

# Return to root
cd ../..
```

You should see output like:
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied
```

### Step 5: Add Sample Data to Database

**IMPORTANT**: First, place your `Analytics_Test_Data.json` file in the `data/` directory:

```powershell
# If you have the JSON file, copy it to data/ folder
# The file should contain the invoice data array

# Then seed the database
npm run db:seed
```

You should see:
```
🌱 Starting database seed...
📄 Found X invoices to import
✅ Database seeded successfully!
   📦 Vendors: X
   👥 Customers: X
   📄 Invoices: X
   📋 Line Items: X
   💳 Payments: X
```

### Step 6: Setup Python Vanna AI Service

Open a **NEW PowerShell terminal** (keep the first one for later):

```powershell
# Navigate to Vanna service directory
cd services/vanna

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# You should see (venv) in your prompt

# Install Python dependencies
pip install -r requirements.txt

# Return to root (keep venv activated)
cd ../..
```

### Step 7: Start All Services

Now you'll start three services in three separate terminals:

#### Terminal 1 - Frontend (Next.js)
```powershell
cd apps/web
npm run dev
```
Frontend will run on: **http://localhost:3000**

#### Terminal 2 - Backend API (Express)
```powershell
cd apps/api
npm run dev
```
Backend will run on: **http://localhost:3001**

#### Terminal 3 - Vanna AI Service (Python) - with venv activated
```powershell
cd services/vanna
# Make sure venv is activated (you should see (venv))
.\venv\Scripts\Activate  # If not already activated
python main.py
```
Vanna AI will run on: **http://localhost:8000**

### Step 8: Access the Application

Open your browser and navigate to:

🌐 **http://localhost:3000**

You should see:
- Dashboard with overview cards showing stats
- Charts displaying invoice trends, vendor spend, etc.
- Invoices table with searchable data
- "Chat with Data" link in navigation

Click **"Chat with Data"** to test the AI interface!

## 🧪 Testing the Application

### Test the Dashboard

1. Visit http://localhost:3000/dashboard
2. You should see:
   - 4 stat cards at the top
   - Invoice trends chart
   - Vendor spend bar chart
   - Category spend pie chart
   - Cash outflow forecast
   - Invoices table with search

### Test the Chat Interface

1. Click "Chat with Data" in navigation
2. Try these questions:
   - "What are the top 5 vendors by total spend?"
   - "Show me invoices from last month"
   - "What is the average invoice value?"
   - "List all pending invoices"

You should see:
- The SQL query generated
- Results in a table format
- Natural language answer

### Test the API Directly

```powershell
# Test health endpoint
curl http://localhost:3001/health

# Test stats endpoint
curl http://localhost:3001/api/stats

# Test invoices endpoint
curl http://localhost:3001/api/invoices
```

## 🐛 Troubleshooting

### Issue: "Cannot find module X"

**Solution**: Run `npm install` in the root directory

### Issue: Database connection error

**Solution**: 
1. Verify PostgreSQL is running: `Get-Service postgresql*`
2. Check DATABASE_URL in .env has correct credentials
3. Ensure database exists: `psql -U postgres -l`

### Issue: "Port 3000 already in use"

**Solution**:
```powershell
# Find and kill the process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Issue: Python venv activation fails

**Solution**:
```powershell
# Enable script execution (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try activating again
.\venv\Scripts\Activate
```

### Issue: Prisma Client not generated

**Solution**:
```powershell
cd apps/api
npx prisma generate
cd ../..
```

### Issue: Vanna AI service errors

**Solution**:
1. Verify GROQ_API_KEY is set in .env
2. Check DATABASE_URL is correct
3. Ensure PostgreSQL is accessible
4. Check Python dependencies: `pip list`

## 📝 Quick Start Commands (After Initial Setup)

Once everything is set up, start all services with:

**Terminal 1**:
```powershell
cd apps/web
npm run dev
```

**Terminal 2**:
```powershell
cd apps/api
npm run dev
```

**Terminal 3**:
```powershell
cd services/vanna
.\venv\Scripts\Activate
python main.py
```

## 🎯 Next Steps

- [ ] Add your actual Analytics_Test_Data.json to `data/` folder
- [ ] Customize the dashboard styling to match your Figma design
- [ ] Train Vanna AI with more example questions
- [ ] Deploy to production (see DEPLOYMENT.md)
- [ ] Add authentication and user management

## 📧 Need Help?

If you encounter issues:

1. Check this troubleshooting section
2. Review the logs in each terminal
3. Verify all prerequisites are installed
4. Check environment variables in .env

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions!
