from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.core.config import settings

from app.db import models

# Create database tables (For dev, in prod use Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "*" # Set appropriately in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to BloodMate API. Visit /docs for API documentation."}

# We will include routers here
from app.api.endpoints import auth, donors, inventory, requests, analytics, campaigns, recipients

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(donors.router, prefix=f"{settings.API_V1_STR}/donors", tags=["donors"])
app.include_router(recipients.router, prefix=f"{settings.API_V1_STR}/recipients", tags=["recipients"])
app.include_router(inventory.router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(requests.router, prefix=f"{settings.API_V1_STR}/requests", tags=["requests"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(campaigns.router, prefix=f"{settings.API_V1_STR}/campaigns", tags=["campaigns"])
