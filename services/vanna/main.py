from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sqlite3
import psycopg2
from urllib.parse import urlparse
from typing import Any, Dict, List, Tuple
from dotenv import load_dotenv
from vanna.remote import VannaDefault
from config import DATABASE_URL, GROQ_API_KEY, VANNA_MODEL

load_dotenv()

app = FastAPI(title="Vanna AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vanna AI
vn = VannaDefault(model=VANNA_MODEL, api_key=GROQ_API_KEY)


def _is_postgres(url: str) -> bool:
    return url.startswith("postgres://") or url.startswith("postgresql://")


def get_db_connection():
    """Return a DB connection based on DATABASE_URL (Postgres or SQLite)."""
    if DATABASE_URL and _is_postgres(DATABASE_URL):
        # psycopg2 can use the URL directly
        return psycopg2.connect(DATABASE_URL)
    # Fallback to SQLite; support plain path or sqlite:/// relative
    if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
        # Handle forms like sqlite:///relative/path.db
        parsed = urlparse(DATABASE_URL)
        db_path = parsed.path
        if db_path.startswith("/"):
            # On Windows URLs, urlparse adds a leading '/'
            db_path = db_path.lstrip("/")
        return sqlite3.connect(db_path)
    # Legacy default path (dev.db in repo)
    database_path = os.path.join(os.path.dirname(__file__), "../../apps/api/dev.db")
    return sqlite3.connect(database_path)

# Train Vanna with schema (run once)
def train_vanna():
    """Train Vanna AI with database schema for either Postgres or SQLite."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if DATABASE_URL and _is_postgres(DATABASE_URL):
            # Postgres: list tables in the public schema
            cursor.execute(
                """
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type='BASE TABLE'
                """
            )
            tables = [r[0] for r in cursor.fetchall()]
            for table_name in tables:
                cursor.execute(
                    """
                    SELECT column_name, data_type
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = %s
                    ORDER BY ordinal_position
                    """,
                    (table_name,),
                )
                cols = cursor.fetchall()  # List[Tuple[str,str]]
                ddl_cols = ", ".join([f"{c[0]} {c[1].upper()}" for c in cols])
                ddl = f"CREATE TABLE {table_name} ({ddl_cols});"
                vn.train(ddl=ddl)
                if cols:
                    vn.train(documentation=f"Table {table_name} contains: {', '.join([c[0] for c in cols])}")
        else:
            # SQLite: list tables via sqlite_master
            cursor.execute(
                """
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name NOT LIKE 'sqlite_%'
                """
            )
            tables = cursor.fetchall()
            for (table_name,) in tables:
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = cursor.fetchall()  # (cid, name, type, notnull, dflt_value, pk)
                ddl = f"CREATE TABLE {table_name} ("
                col_defs = []
                for col in columns:
                    col_name = col[1]
                    col_type = col[2]
                    col_defs.append(f"{col_name} {col_type}")
                ddl += ", ".join(col_defs) + ");"
                vn.train(ddl=ddl)
                if columns:
                    vn.train(documentation=f"Table {table_name} contains: {', '.join([col[1] for col in columns])}")

        cursor.close()
        conn.close()
        print("✅ Vanna AI trained with database schema")
    except Exception as e:
        print(f"❌ Error training Vanna: {e}")

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    sql: str
    results: list
    answer: str

@app.on_event("startup")
async def startup_event():
    """Run on startup"""
    train_vanna()

@app.get("/")
async def root():
    return {"message": "Vanna AI Service", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Natural language to SQL query endpoint
    """
    try:
        question = request.question

        # Generate SQL from natural language
        sql = vn.generate_sql(question)
        if not sql:
            raise HTTPException(status_code=400, detail="Could not generate SQL from question")

        # Execute SQL
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(sql)

        # Fetch results
        columns = [desc[0] for desc in cursor.description] if cursor.description else []
        rows = cursor.fetchall() if columns else []
        results = [dict(zip(columns, row)) for row in rows]

        cursor.close()
        conn.close()

        # Simple NL answer fallback to avoid optional plotting dependencies
        answer = f"Query executed successfully. Found {len(results)} row(s)."
        return ChatResponse(sql=sql, results=results, answer=answer)
    except (sqlite3.Error, psycopg2.Error) as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("VANNA_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
