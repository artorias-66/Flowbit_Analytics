import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration - SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///../../apps/api/dev.db")

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# Vanna API configuration
VANNA_API_KEY = os.getenv("VANNA_API_KEY", "default-key")
VANNA_MODEL = os.getenv("VANNA_MODEL", "chinook")
