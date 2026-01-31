import os
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from app.auth.jwt import create_token

router = APIRouter(prefix="/auth")

pwd_ctx = CryptContext(schemes=["bcrypt"])

@router.post("/login")
def admin_login(data: dict):
    if data.get("email") != os.getenv("ADMIN_EMAIL"):
        raise HTTPException(status_code=401)

    if not pwd_ctx.verify(data.get("password"), os.getenv("ADMIN_PASSWORD_HASH")):
        raise HTTPException(status_code=401)

    return {
        "access_token": create_token()
    }
