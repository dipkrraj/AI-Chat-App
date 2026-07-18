import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, SessionLocal
from app.models import Base
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.routers.chat import router as chat_router
from app.routers.auth import router as auth_router

# Create SQLite Database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Modular AI Chat App Backend")

# Setup CORS with customizable origins from environment
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(chat_router)

# --- Database Seeding ---
def seed_database():
    db = SessionLocal()
    try:
        # Check if default user exists (ID 1)
        default_user = db.query(User).filter(User.id == 1).first()
        if not default_user:
            default_user = User(id=1, username="default_user", email="default@dp.ai")
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            print("Seeded: Default user created successfully.")

        # Check if any conversation exists for this user
        default_conv = db.query(Conversation).filter(Conversation.user_id == 1).first()
        if not default_conv:
            # Seed default conversation
            default_conv = Conversation(
                id=1,
                title="First Chat Session",
                user_id=1,
                model="llama-3.1-8b-instant"
            )
            db.add(default_conv)
            db.commit()
            db.refresh(default_conv)
            print("Seeded: Default conversation session created.")
            
            # Seed bot starter message
            starter_msg = Message(
                conversation_id=1,
                sender="assistant",
                content="Hi! I am your database-backed AI assistant. Ask me anything, and our messages will be saved!"
            )
            db.add(starter_msg)
            db.commit()
            print("Seeded: Starter message added.")
    except Exception as e:
        print(f"Database seeding failed: {e}")
    finally:
        db.close()

# Run database seed
seed_database()

# --- Health Check ---
@app.get("/api/health")
async def health():
    return {"status": "ok"}