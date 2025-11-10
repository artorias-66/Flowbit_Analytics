# Flowbit Analytics - Project Summary

## 🎯 Project Overview

**Flowbit Analytics** is a production-grade full-stack web application built for the Flowbit Private Limited Full Stack Developer Internship assignment. It consists of two main modules:

1. **Interactive Analytics Dashboard** - Data-driven visualizations with pixel-accurate design
2. **"Chat with Data" Interface** - AI-powered natural language analytics using Vanna AI

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                   http://localhost:3000                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND (apps/web)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │  Dashboard   │  │  Chat UI     │  │  shadcn/ui + Recharts│  │
│  │  Pages       │  │  Interface   │  │  TailwindCSS         │  │
│  └──────────────┘  └──────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              EXPRESS BACKEND API (apps/api)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ Stats Route  │  │ Invoices     │  │  Chat Proxy         │  │
│  │ Trends Route │  │ Vendors      │  │  to Vanna AI        │  │
│  │ TypeScript   │  │ Prisma ORM   │  │  axios              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────────────┘  │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                 │
│                            │                  │                  │
└────────────────────────────┼──────────────────┼──────────────────┘
                             │                  │
                             ▼                  ▼
                 ┌──────────────────┐  ┌──────────────────────┐
                 │   POSTGRESQL     │  │  VANNA AI SERVICE    │
                 │   DATABASE       │  │  (services/vanna)    │
                 │                  │  │                       │
                 │  ┌────────────┐  │  │  ┌────────────────┐ │
                 │  │ invoices   │  │◄─┤  │ FastAPI        │ │
                 │  │ vendors    │  │  │  │ Vanna AI       │ │
                 │  │ customers  │  │  │  │ Groq LLM       │ │
                 │  │ line_items │  │  │  │ NL→SQL         │ │
                 │  │ payments   │  │  │  └────────────────┘ │
                 │  └────────────┘  │  │                       │
                 └──────────────────┘  └──────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: shadcn/ui (Radix UI primitives)
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Fetch API

### Backend API
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 14+
- **HTTP Client**: Axios (for Vanna proxy)
- **Dev Tools**: ts-node-dev

### AI/ML Service
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **AI Library**: Vanna AI
- **LLM Provider**: Groq
- **Database Driver**: psycopg2

### Monorepo & Tooling
- **Monorepo**: Turborepo
- **Package Manager**: npm
- **Version Control**: Git
- **Code Formatting**: Prettier
- **Linting**: ESLint

## 📁 Project Structure

```
flowbit-analytics/
├── apps/
│   ├── web/                      # Next.js Frontend Application
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router pages
│   │   │   │   ├── dashboard/   # Dashboard page
│   │   │   │   ├── chat/        # Chat interface page
│   │   │   │   ├── layout.tsx   # Root layout
│   │   │   │   └── page.tsx     # Home page (redirects)
│   │   │   ├── components/       # React components
│   │   │   │   ├── ui/          # shadcn/ui components
│   │   │   │   ├── dashboard/   # Dashboard-specific components
│   │   │   │   └── chat/        # Chat-specific components
│   │   │   └── lib/             # Utilities
│   │   │       ├── api-client.ts # API client
│   │   │       └── utils.ts      # Helper functions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.js
│   │   └── next.config.mjs
│   │
│   └── api/                      # Express Backend Application
│       ├── src/
│       │   ├── routes/           # API route handlers
│       │   │   ├── stats.ts     # Stats endpoint
│       │   │   ├── invoices.ts  # Invoices list
│       │   │   ├── trends.ts    # Trends & analytics
│       │   │   ├── vendors.ts   # Vendor endpoints
│       │   │   └── chat.ts      # Chat proxy to Vanna
│       │   ├── index.ts         # Express server entry
│       │   └── seed.ts          # Database seeding script
│       ├── prisma/
│       │   └── schema.prisma    # Database schema
│       ├── package.json
│       └── tsconfig.json
│
├── services/
│   └── vanna/                    # Python Vanna AI Service
│       ├── main.py              # FastAPI application
│       ├── config.py            # Configuration
│       ├── requirements.txt     # Python dependencies
│       └── README.md            # Service documentation
│
├── data/
│   └── Analytics_Test_Data.json # Sample invoice data
│
├── package.json                 # Root package.json (workspace)
├── turbo.json                   # Turborepo configuration
├── tsconfig.json                # Root TypeScript config
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment variables template
│
├── README.md                    # Main project documentation
├── SETUP.md                     # Setup & installation guide
├── DEPLOYMENT.md                # Deployment guide
├── CHECKLIST.md                 # Submission checklist
└── PROJECT_SUMMARY.md           # This file
```

## 🔌 API Endpoints

### Backend API (Port 3001)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Health check | `{ status: "ok" }` |
| GET | `/api/stats` | Overview statistics | `{ totalSpendYTD, totalInvoices, ... }` |
| GET | `/api/invoice-trends` | Monthly trends | `[{ month, invoiceCount, totalSpend }]` |
| GET | `/api/vendors/top10` | Top 10 vendors | `[{ name, total }]` |
| GET | `/api/category-spend` | Spend by category | `[{ category, amount }]` |
| GET | `/api/cash-outflow` | Cash outflow forecast | `[{ date, amount }]` |
| GET | `/api/invoices` | List invoices | `[{ id, invoiceNumber, ... }]` |
| POST | `/api/chat` | Chat with data | `{ sql, results, answer }` |

### Vanna AI Service (Port 8000)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | Service info | `{ message, status }` |
| GET | `/health` | Health check | `{ status: "ok" }` |
| POST | `/chat` | Natural language query | `{ sql, results, answer }` |

## 🗄️ Database Schema

### Tables & Relationships

```sql
-- vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY,
  name VARCHAR,
  address VARCHAR,
  tax_id VARCHAR,
  created_at TIMESTAMP
);

-- customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR,
  address VARCHAR,
  tax_id VARCHAR,
  created_at TIMESTAMP
);

-- invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR UNIQUE,
  invoice_date TIMESTAMP,
  delivery_date TIMESTAMP,
  vendor_id UUID REFERENCES vendors(id),
  customer_id UUID REFERENCES customers(id),
  total_before_vat DECIMAL,
  total_vat DECIMAL,
  total_with_vat DECIMAL,
  status VARCHAR,
  created_at TIMESTAMP
);

-- line_items table
CREATE TABLE line_items (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR,
  quantity DECIMAL,
  unit_price DECIMAL,
  total_before_vat DECIMAL,
  vat_rate DECIMAL,
  vat_amount DECIMAL,
  total_with_vat DECIMAL,
  category VARCHAR
);

-- payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  due_date TIMESTAMP,
  payment_terms VARCHAR,
  bank_account VARCHAR
);
```

### ER Diagram (Text Representation)

```
vendors (1) ──────┐
                  │
                  │ has many
                  │
                  ▼
              invoices (M) ───── has one ────┐
                  ▲                            │
                  │                            │
                  │ has many                   │
                  │                            ▼
customers (1) ────┘                       payments (1)
                  │
                  │ has many
                  │
                  ▼
             line_items (M)
```

## 🎨 UI Components

### Dashboard Components

1. **StatsCards** - 4 overview metric cards
2. **InvoiceTrends** - Combined line/bar chart
3. **VendorSpend** - Bar chart of top 10 vendors
4. **CategorySpend** - Pie chart of categories
5. **CashOutflow** - Line chart of forecast
6. **InvoicesTable** - Searchable data table

### Chat Components

1. **ChatInterface** - Main chat UI
2. **Message bubbles** - User/assistant messages
3. **SQL display** - Generated queries
4. **Results table** - Query results

### UI Primitives (shadcn/ui)

- Button
- Card
- Input
- Tabs
- Dialog (ready to use)
- Select (ready to use)
- Dropdown Menu (ready to use)

## 🔐 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Vanna AI Service
VANNA_API_BASE_URL=https://vanna-gq7r.onrender.com
VANNA_API_KEY=your-key

# Groq LLM
GROQ_API_KEY=your-groq-key

# Frontend URLs
NEXT_PUBLIC_API_BASE=https://flowbit-ai-58t0.onrender.com
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend
PORT=3001
NODE_ENV=development

# Vanna Service
VANNA_PORT=8000
```

## 📈 Key Features

### ✅ Implemented

- [x] Full-stack monorepo with Turborepo
- [x] Next.js 14 frontend with App Router
- [x] Express.js TypeScript backend
- [x] PostgreSQL with Prisma ORM
- [x] Normalized database schema
- [x] Data ingestion from JSON
- [x] 7 REST API endpoints
- [x] Interactive analytics dashboard
- [x] 4 chart types with Recharts
- [x] Searchable invoices table
- [x] Chat with Data interface
- [x] Vanna AI integration
- [x] Groq LLM integration
- [x] Natural language to SQL
- [x] SQL query execution
- [x] Results visualization
- [x] Responsive design
- [x] TypeScript throughout
- [x] shadcn/ui components
- [x] TailwindCSS styling
- [x] Error handling
- [x] Loading states
- [x] CORS configuration
- [x] Environment configuration
- [x] Comprehensive documentation

### 🎁 Bonus Features (Optional)

- [ ] Authentication/login
- [ ] Export to PDF/Excel
- [ ] Advanced filters
- [ ] Dark mode toggle
- [ ] Unit tests
- [ ] E2E tests
- [ ] CI/CD pipeline
- [ ] Docker containerization

## 📊 Performance Metrics (Target)

- **Frontend Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Queries**: < 100ms
- **Vanna AI Response**: < 3 seconds
- **Lighthouse Score**: > 90

## 🧪 Testing Strategy

### Manual Testing Checklist

1. **Dashboard**
   - [ ] Stats cards display correctly
   - [ ] All 4 charts render
   - [ ] Invoices table searchable
   - [ ] Responsive on mobile

2. **Chat Interface**
   - [ ] Can send messages
   - [ ] SQL query displayed
   - [ ] Results table shows data
   - [ ] Error handling works

3. **API Endpoints**
   - [ ] All endpoints return data
   - [ ] Error handling works
   - [ ] CORS headers correct

4. **Database**
   - [ ] Migrations applied
   - [ ] Seed data loaded
   - [ ] Relationships valid

### Automated Testing (Future)

```typescript
// Example unit test
describe('StatsCards', () => {
  it('should fetch and display stats', async () => {
    // Test implementation
  });
});
```

## 🚀 Deployment Strategy

### Development
- Frontend: `npm run dev` in apps/web
- Backend: `npm run dev` in apps/api
- Vanna: `python main.py` in services/vanna

### Staging
- Frontend: Vercel preview deployment
- Backend: Railway staging environment
- Vanna: Render free tier

### Production
- Frontend: Vercel production
- Backend: Vercel serverless or Railway
- Vanna: Render/Railway/Fly.io
- Database: Vercel Postgres/Supabase/Neon

## 📝 Documentation Files

1. **README.md** - Project overview, architecture, features
2. **SETUP.md** - Installation and local development
3. **DEPLOYMENT.md** - Production deployment guide
4. **CHECKLIST.md** - Submission requirements
5. **PROJECT_SUMMARY.md** - This comprehensive overview

## 🎓 Learning Outcomes

By building this project, you'll demonstrate:

- Full-stack TypeScript development
- Monorepo architecture with Turborepo
- Next.js App Router and server components
- Express.js API development
- PostgreSQL database design
- Prisma ORM usage
- AI/ML integration (Vanna AI, Groq)
- Python FastAPI development
- Data visualization with Recharts
- shadcn/ui and TailwindCSS
- RESTful API design
- Environment configuration
- Production deployment
- Technical documentation

## 🏆 Success Criteria

Your submission will be evaluated on:

1. **End-to-end architecture** - Monorepo, services, deployment
2. **Database design** - Schema, normalization, queries
3. **Frontend implementation** - Next.js, TypeScript, shadcn/ui
4. **AI integration** - Vanna AI working with real data
5. **Code quality** - TypeScript, structure, best practices
6. **Documentation** - Clear, comprehensive, professional
7. **Production readiness** - Deployed, working, performant

## 📧 Support & Contact

**Assignment Submission**
- Email: recruit@flowbitai.com
- Deadline: 10.11.2025

**Need Help?**
1. Review documentation in order: README → SETUP → DEPLOYMENT
2. Check CHECKLIST.md for requirements
3. Read error messages carefully
4. Search Stack Overflow / GitHub Issues
5. Ask specific questions with context

## 🎉 Final Notes

This is a **production-grade** application demonstrating:
- Modern full-stack architecture
- AI-powered analytics
- Best practices and patterns
- Professional code quality
- Comprehensive documentation

**Good luck with your internship assignment!** 🚀

---

*Built with ❤️ for Flowbit AI Full Stack Developer Internship*
