# Vanna AI Service

Python FastAPI service that provides natural language to SQL query conversion using Vanna AI and Groq LLM.

## Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Configuration

Set environment variables in `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/flowbit_analytics
GROQ_API_KEY=your-groq-api-key
VANNA_API_KEY=your-vanna-api-key
VANNA_PORT=8000
```

## Run

```bash
# Development
uvicorn main:app --reload --port 8000

# Production
python main.py
```

## API Endpoints

- `GET /` - Service info
- `GET /health` - Health check
- `POST /chat` - Natural language to SQL

### Example Request

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the top 5 vendors by total spend?"}'
```

### Example Response

```json
{
  "sql": "SELECT v.name, SUM(i.total_with_vat) as total FROM vendors v JOIN invoices i ON v.id = i.vendor_id GROUP BY v.id ORDER BY total DESC LIMIT 5;",
  "results": [
    {"name": "Acme Corp", "total": 125000.50},
    {"name": "Beta Inc", "total": 98000.25}
  ],
  "answer": "The top 5 vendors by total spend are: Acme Corp ($125,000.50), Beta Inc ($98,000.25)..."
}
```
