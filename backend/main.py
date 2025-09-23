from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL e SUPABASE_KEY não estão definidos no .env")

# Cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "https://passa-a-bola.onrender.com",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic model
class User(BaseModel):
    name: str
    email: EmailStr
    password: str

@app.post("/register")
def register(user: User):
    # Checar se email já existe
    existing = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email já registrado.")

    # Hash da senha
    hashed_password = pwd_context.hash(user.password)

    # Inserir no Supabase
    res = supabase.table("users").insert({
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }).execute()

    return {"message": "Usuário registrado com sucesso", "user": res.data}

class LoginData(BaseModel):
    email: EmailStr
    password: str

@app.post("/login")
def login(data: LoginData):
    result = supabase.table("users").select("*").eq("email", data.email).execute()
    user = result.data[0] if result.data else None

    if not user:
        raise HTTPException(status_code=400, detail="Email ou senha inválidos.")

    # Verifica senha
    if not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Email ou senha inválidos.")

    # Retorna info do usuário (menos a senha, se quiser)
    user.pop("password", None)
    return {"message": "Login OK", "user": user}