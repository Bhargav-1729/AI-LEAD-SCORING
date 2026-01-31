import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "lead_scoring_db")

API_KEY = os.getenv("API_KEY")

PUBLIC_RATE_LIMIT = int(os.getenv("PUBLIC_RATE_LIMIT", 30))
PUBLIC_RATE_WINDOW = int(os.getenv("PUBLIC_RATE_WINDOW", 60))

INTERNAL_RATE_LIMIT = int(os.getenv("INTERNAL_RATE_LIMIT", 10))
INTERNAL_RATE_WINDOW = int(os.getenv("INTERNAL_RATE_WINDOW", 60))

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set")
