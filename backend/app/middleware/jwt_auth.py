from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.security import bearer_scheme
from app.auth.jwt import verify_token

def jwt_auth(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = credentials.credentials
    if not verify_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
