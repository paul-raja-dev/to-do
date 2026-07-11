from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from database import engine, AsyncSessionLocal
from models import User
from security import hash_password

# Import routers
from auth_routes import router as auth_router
from task_routes import router as task_router
from metrics_routes import router as metrics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed default user on startup for ease of development/testing
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).filter(User.username == "default_user"))
        user = result.scalar_one_or_none()
        if not user:
            default_user = User(
                username="default_user",
                email="default@example.com",
                hashed_password=hash_password("password123")  # Seed with known password
            )
            db.add(default_user)
            await db.commit()
    yield
    await engine.dispose()


app = FastAPI(title="TaskFlow API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(task_router)
app.include_router(metrics_router)


@app.get("/")
async def root():
    return JSONResponse(content={"message": "Welcome to the TaskFlow API"})
