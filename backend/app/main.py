from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.leads import router as lead_router
from app.routes.dashboard import router as dashboard_router
from app.routes.auth import router as auth_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # ✅ allow all origins
    allow_methods=["*"],        # ✅ allow all HTTP methods
    allow_headers=["*"],        # ✅ allow all headers
    allow_credentials=False,    # 🚨 MUST be False with "*"
)

app.include_router(auth_router)
app.include_router(lead_router)
app.include_router(dashboard_router)
