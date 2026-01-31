import os
from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET = os.getenv("JWT_SECRET")
ALGO = "HS256"
EXP_MIN = 60 * 24  # 1 day

def create_token():
    payload = {
        "sub": "admin",
        "exp": datetime.utcnow() + timedelta(minutes=EXP_MIN)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)

def verify_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])
    except JWTError:
        return None
