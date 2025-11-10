# Flowbit Analytics - Full Stack Assignment

Production-grade full-stack web application with Interactive Analytics Dashboard and AI-powered "Chat with Data" interface.

## 🏗️ Architecture

This is a **Turborepo monorepo** containing:

- **`apps/web`**: Next.js 14 frontend (TypeScript, shadcn/ui, TailwindCSS, Recharts)
- **`apps/api`**: Express.js backend API (TypeScript, PostgreSQL, Prisma ORM)
- **`services/vanna`**: Python FastAPI service (Vanna AI + Groq LLM)
- **`data/`**: Sample invoice data (JSON)

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 14
- **Python** >= 3.9 (for Vanna AI service)
- **Git**

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to project directory
cd c:\projects\assignment_flowbitAI

# Install all dependencies (root + all workspaces)
npm install

# Copy environment variables
copy .env.example .env

# Edit .env with your database credentials and API keys
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE flowbit_analytics;
\q

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 3. Run Development Servers

```bash
# Start all services (frontend + backend + vanna)
npm run dev
```

Or start individually:

```bash
# Terminal 1 - Frontend (http://localhost:3000)
cd apps/web
npm run dev

# Terminal 2 - Backend API (http://localhost:3001)
cd apps/api
npm run dev

# Terminal 3 - Vanna AI Service (http://localhost:8000)
cd services/vanna
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## 🗂️ Project Structure

```
flowbit-analytics/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/        # App Router pages
│   │   │   ├── components/ # React components
│   │   │   └── lib/        # Utilities
│   │   └── package.json
│   │
│   └── api/                 # Express Backend
│       ├── src/
│       │   ├── routes/     # API endpoints
│       │   ├── controllers/
│       │   ├── services/
│       │   └── prisma/     # Database schema
│       └── package.json
│
├── services/
│   └── vanna/              # Vanna AI Service
│       ├── main.py
│       ├── requirements.txt
│       └── config.py
│
├── data/
│   └── Analytics_Test_Data.json
│
├── package.json            # Root package
├── turbo.json              # Turborepo config
└── README.md
```

## 📊 Database Schema (ER Diagram)

### Tables

1. **invoices**
   - `id` (PK)
   - `invoice_number`
   - `invoice_date`
   - `delivery_date`
   - `vendor_id` (FK → vendors)
   - `customer_id` (FK → customers)
   - `total_before_vat`
   - `total_vat`
   - `total_with_vat`
   - `status`
   - `created_at`

2. **vendors**
   - `id` (PK)
   - `name`
   - `address`
   - `tax_id`

3. **customers**
   - `id` (PK)
   - `name`
   - `address`
   - `tax_id`

4. **line_items**
   - `id` (PK)
   - `invoice_id` (FK → invoices)
   - `description`
   - `quantity`
   - `unit_price`
   - `total_before_vat`
   - `vat_rate`
   - `vat_amount`
   - `total_with_vat`

5. **payments**
   - `id` (PK)
   - `invoice_id` (FK → invoices)
   - `due_date`
   - `payment_terms`
   - `bank_account`

## 🔌 API Endpoints

### Backend API (`http://localhost:3001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Overview card totals (Total Spend, Invoice Count, etc.) |
| GET | `/api/invoice-trends` | Monthly invoice count and spend trend data |
| GET | `/api/vendors/top10` | Top 10 vendors by total spend |
| GET | `/api/category-spend` | Spend grouped by category/line item |
| GET | `/api/cash-outflow` | Expected cash outflow by date range |
| GET | `/api/invoices` | List all invoices (supports filters: `?search=`, `?status=`) |
| POST | `/api/chat` | Proxy to Vanna AI service |

### Example Response: `/api/stats`

```json
{
  "totalSpendYTD": 1250000.50,
  "totalInvoices": 1248,
  "documentsUploaded": 89,
  "averageInvoiceValue": 1001.60
}
```

### Vanna AI Service (`http://localhost:8000`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Natural language query → SQL + Results |

#### Example Request:

```json
{
  "question": "Show me the top 5 vendors by total spend"
}
```

#### Example Response:

```json
{
  "sql": "SELECT v.name, SUM(i.total_with_vat) as total FROM vendors v JOIN invoices i ON v.id = i.vendor_id GROUP BY v.id ORDER BY total DESC LIMIT 5;",
  "results": [
    {"name": "Acme Corp", "total": 125000},
    {"name": "Beta Inc", "total": 98000}
  ]
}
```

## 🎨 Frontend Features

### 1. Analytics Dashboard (`/dashboard`)

- **Overview Cards**: Total Spend YTD, Total Invoices, Documents Uploaded, Average Invoice Value
- **Charts**:
  - Invoice Volume + Value Trend (Line/Bar combo)
  - Spend by Vendor (Top 10 bar chart)
  - Spend by Category (Pie/Donut chart)
  - Cash Outflow Forecast (Line chart)
- **Invoices Table**: Searchable, sortable, scrollable with vendor, date, invoice #, amount, status

### 2. Chat with Data (`/chat`)

- Natural language query input
- Streaming response display
- Shows generated SQL query
- Displays results in formatted table
- Powered by Vanna AI + Groq LLM

## 🚢 Deployment

### Frontend & Backend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd apps/web
vercel --prod

# Deploy backend (as serverless functions)
cd apps/api
vercel --prod
```

### Vanna AI Service (Render/Railway/Fly.io)

**Option A: Render**
1. Connect GitHub repo
2. Select `services/vanna` as root directory
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Option B: Railway**
```bash
railway login
railway init
railway up
```

### Environment Variables (Production)

Update `.env` with production values:

```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
VANNA_API_BASE_URL=https://vanna-gq7r.onrender.com
GROQ_API_KEY=<redacted-your-groq-key>
NEXT_PUBLIC_API_BASE=https://flowbit-ai-58t0.onrender.com
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Lint
npm run lint

# Format
npm run format
```

## 📦 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, shadcn/ui, TailwindCSS, Recharts
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **AI/ML**: Vanna AI, Groq LLM
- **Deployment**: Vercel, Render/Railway
- **Monorepo**: Turborepo

## 📝 Development Notes

- Code follows production best practices
- Type-safe with TypeScript throughout
- Normalized database schema with referential integrity
- RESTful API design
- Responsive UI matching Figma design
- Error handling and validation on all layers
- Environment-based configuration

## 📧 Contact

**Internship Assignment for**: Flowbit Private Limited  
**Submission Email**: recruit@flowbitai.com  
**Deadline**: 10.11.2025

---

Built with ❤️ for Flowbit AI Internship Assignment
