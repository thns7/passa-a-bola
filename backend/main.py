from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from services.football_service_hybrid import football_service



load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL e SUPABASE_KEY não estão definidos no .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "API do Passa a Bola funcionando!"}

.
origins = [
    "https://passa-a-bola.onrender.com",
    "https://passa-a-bola-vz9v.vercel.app",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginData(BaseModel):
    email: EmailStr
    password: str

@app.options("/login")
async def login_options():
    return {"message": "OK"}

@app.options("/register")
async def register_options():
    return {"message": "OK"}

@app.options("/api/matches/live")
async def live_options():
    return {"message": "OK"}

@app.options("/api/matches/upcoming")
async def upcoming_options():
    return {"message": "OK"}

@app.post("/register")
def register(user: User):
    existing = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email já registrado.")

    hashed_password = pwd_context.hash(user.password)
    res = supabase.table("users").insert({
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }).execute()

    return {"message": "Usuário registrado com sucesso", "user": res.data}

@app.post("/login")
def login(data: LoginData):
    result = supabase.table("users").select("*").eq("email", data.email).execute()
    user = result.data[0] if result.data else None

    if not user:
        raise HTTPException(status_code=400, detail="Email ou senha inválidos.")

    if not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Email ou senha inválidos.")

    user.pop("password", None)
    return {"message": "Login OK", "user": user}


@app.get("/api/matches/live")
async def get_live_matches():
    try:
        result = await football_service.get_live_matches()
        return {
            "success": True,
            "data": result["data"],
            "count": len(result["data"]),
            "source": result["source"],
            "mode": "premium" if football_service.has_premium_access else "free"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": [],
            "source": "error"
        }

@app.get("/api/matches/upcoming")
async def get_upcoming_matches():
    try:
        result = await football_service.get_upcoming_matches()
        return {
            "success": True,
            "data": result["data"],
            "count": len(result["data"]),
            "source": result["source"],
            "mode": "premium" if football_service.has_premium_access else "free"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": [],
            "source": "error"
        }

@app.get("/api/status")
async def get_api_status():
    return {
        "has_premium_access": football_service.has_premium_access,
        "mode": "premium" if football_service.has_premium_access else "free",
        "message": "API Premium ativa" if football_service.has_premium_access else "Usando dados mockados"
    }
