import time
from fastapi import Request, HTTPException
from app.config import (
    PUBLIC_RATE_LIMIT,
    PUBLIC_RATE_WINDOW,
    INTERNAL_RATE_LIMIT,
    INTERNAL_RATE_WINDOW,
)

# In-memory stores
PUBLIC_REQUESTS = {}
INTERNAL_REQUESTS = {}

def _check_rate_limit(store, ip, limit, window):
    now = time.time()

    if ip not in store:
        store[ip] = []

    # remove expired timestamps
    store[ip] = [t for t in store[ip] if now - t < window]

    if len(store[ip]) >= limit:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again later."
        )

    store[ip].append(now)

# 🔓 Public endpoints (no API key)
def public_rate_limiter(request: Request):
    ip = request.client.host
    _check_rate_limit(
        PUBLIC_REQUESTS,
        ip,
        PUBLIC_RATE_LIMIT,
        PUBLIC_RATE_WINDOW
    )

# 🔐 Internal endpoints (API key users)
def internal_rate_limiter(request: Request):
    ip = request.client.host
    _check_rate_limit(
        INTERNAL_REQUESTS,
        ip,
        INTERNAL_RATE_LIMIT,
        INTERNAL_RATE_WINDOW
    )
