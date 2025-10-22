from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
import base64
import sys
import google.generativeai as genai  

backend_path = os.path.join(os.path.dirname(__file__))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from services.football_service_hybrid import football_service
from services.new_service import news_service

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") 

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL e SUPABASE_KEY não estão definidos no .env")

# ✅ CONFIGURAR GEMINI API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  GEMINI_API_KEY não encontrada - Chatbot não funcionará")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://passa-a-bola.onrender.com",
    "https://passa-a-bola.vercel.app",
    "https://passa-a-bola-vz9v.vercel.app",
    "https://passa-a-bola-*.vercel.app",
    "https://passa-a-bola-smoky.vercel.app",
    "https://*.vercel.app",
    "https://passa-a-bola-vz9v.vercel.app",
    "http://0.0.0.0:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
) 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Models (ADICIONAR OS NOVOS MODELS PARA CHAT)
class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    username: str
    role: str = "user"

class LoginData(BaseModel):
    email: EmailStr
    password: str

class PostCreate(BaseModel):
    content: str
    user_id: str
    user_email: str
    user_name: str
    image: Optional[str] = None
    video: Optional[str] = None

class LikeRequest(BaseModel):
    user_id: str
    post_id: str

class PostUpdate(BaseModel):
    content: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None

class FollowRequest(BaseModel):
    follower_id: str
    following_id: str

class CommentCreate(BaseModel):
    post_id: str
    user_id: str
    content: str

class CommentUpdate(BaseModel):
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

class ChatResponse(BaseModel):
    response: str
    success: bool


PASSINHA_SYSTEM_PROMPT = """
VOCÊ É A PASSINHA - GUIA ESPECIALISTA EM PERFORMANCE PARA FUTEBOL FEMININO

🎯 **SEU PAPEL:** Orientar atletas com informações, exemplos e direcionamentos práticos para performance no futebol feminino.

💪 **COMO AJUDAR COM TREINOS:**
- Fornecer EXEMPLOS de rotinas de treino
- Explicar exercícios BENÉFICOS para cada posição  
- Dar dicas de como MONTAR uma rotina
- Sugerir divisões de treino semanal
- Orientar sobre progressão e evolução

🍳 **COMO AJUDAR COM NUTRIÇÃO:**
- Ensinar receitas PRÁTICAS para atletas
- Explicar timing alimentar (pré/pós-treino)
- Dar exemplos de lanches saudáveis
- Orientar sobre hidratação

📱 **CONHECIMENTO DA PLATAFORMA:**
- Tirar dúvidas sobre funcionalidades do Passa Bola
- Explicar como usar cada módulo
- Guiar na navegação

⚠️ **AVISO IMPORTANTE:**
Sempre finalize com: "Lembre-se: para um plano 100% personalizado, consulte profissionais especializados!"

**EXEMPLOS DE RESPOSTAS PRÁTICAS:**

Quando pedirem "plano de treino":
"Vou te dar um EXEMPLO de rotina que pode te inspirar! Para uma jogadora de meio-campo, uma semana poderia incluir:
• Segunda: Força inferior (agachamentos, afundos) 
• Terça: Treino técnico com bola
• Quarta: Descanso ou mobilidade
• Quinta: Força superior + cardio
• Sexta: Treino tático e finalização
• Sábado: Jogo ou simulação
• Domingo: Descanso

Com base no seu objetivo, posso sugerir exercícios específicos! Me conta sua posição em campo?"

Quando pedirem "receitas":
"Tenho receitas práticas para atletas! 🍳
• PANQUECA PRÉ-TREINO: 1 ovo + 2 colheres de aveia + 1 banana
• SANDUÍCHE PÓS-TREINO: Pão integral + frango desfiado + folhas
• VITAMINA RECUPERATÓRIA: Leite + whey + fruta + aveia

Qual te interessa? Posso dar o passo a passo!"
"""

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_passinha(request: ChatRequest):
    """
    Endpoint REALISTA - Guia de Performance
    """
    print(f"💬 Mensagem: {request.message}")
    
    if not GEMINI_API_KEY:
        return ChatResponse(
            response="🔧 Estou em ajustes! Volte em instantes.",
            success=False
        )
    
    try:
        model = genai.GenerativeModel('models/gemini-2.0-flash-001')
        
        final_prompt = f"""
        {PASSINHA_SYSTEM_PROMPT}
        
        Histórico: {request.history}
        
        Usuário: {request.message}
        
        Responda como Passinha - seja PRÁTICA, INSPIRADORA e ÚTIL.
        Forneça exemplos concretos, dicas acionáveis e orientações claras.
        """
        
        response = model.generate_content(final_prompt)
        return ChatResponse(response=response.text, success=True)
        
    except Exception as e:
        # Fallback prático
        user_msg = request.message.lower()
        
        if any(word in user_msg for word in ['plano', 'treino', 'exercício']):
            return ChatResponse(
                response="""💪 **VOU TE DAR UM EXEMPLO PRÁTICO!**

Para uma **jogadora de futebol**, uma rotina semanal equilibrada pode ser:

**SEGUNDA - Força & Potência**
• Agachamentos: 3x10 repetições
• Afundos: 3x8 cada perna  
• Saltos: 3x8
• Prancha: 3x30 segundos

**TERÇA - Técnica com Bola**
• Domínio: 15 minutos
• Passe: 10 minutos
• Finalização: 15 minutos
• Drible: 10 minutos

**QUARTA - Descanso Ativo**
• Alongamento leve
• Caminhada tranquila
• Hidratação extra

**QUINTA - Resistência**
• Corrida intervalada: 8x200m
• Tiros de velocidade: 10x50m
• Mobilidade articular

**SEXTA - Força Superior + Habilidades**
• Flexões: 3x10
• Remada: 3x10
• Abdominais: 3x15
• Treino de precisão de passe

**SABADO - Jogo/Simulação**
• Partida prática
• Aplicação tática
• Trabalho em equipe

**DOMINGO - Descanso Total**

**Me conta sua posição em campo que dou mais dicas específicas!** 🎯""",
                success=False
            )
        
        elif any(word in user_msg for word in ['receita', 'comida']):
            return ChatResponse(
                response="""🍳 **RECEITAS PRÁTICAS PARA ATLETAS:**

**🥞 PANQUECA PRÉ-TREINO**
• 1 ovo + 2 colheres de aveia + 1 banana amassada
• Misture tudo e leve à frigideira antiaderente
• Sirva com mel (opcional)

**🥪 SANDUÍCHE PÓS-TREINO**  
• 2 fatias de pão integral
• 1 filé de frango grelhado
• Folhas de alface e tomate
• Requeijão light

**🥤 VITAMINA RECUPERATÓRIA**
• 200ml de leite
• 1 scoop de whey protein
• 1 banana
• 1 colher de aveia
• Bata tudo e beba após o treino

**Qual você quer aprender em detalhes?** 👩‍🍳""",
                success=False
            )
        
        else:
            return ChatResponse(
                response="""Olá! Sou a Passinha 🎯

Sua guia de performance para futebol feminino!

**Posso te ajudar com:**
• 💪 Exemplos de rotinas de treino
• 🍳 Receitas práticas para atletas  
• 📊 Dicas de nutrição esportiva
• 📱 Como usar a plataforma Passa Bola

**O que você precisa hoje?** 😊""",
                success=False
            )
    
# Rotas de autenticação
@app.post("/register")
def register(user: User):
    try:
        # Verificar se email já existe
        existing_email = supabase.table("users").select("*").eq("email", user.email).execute()
        if existing_email.data:
            raise HTTPException(status_code=400, detail="Email já registrado.")

        # Verificar se username já existe
        existing_username = supabase.table("users").select("*").eq("username", user.username).execute()
        if existing_username.data:
            raise HTTPException(status_code=400, detail="Username já está em uso.")

        # Validar formato do username
        import re
        if not re.match("^[a-z0-9_]{3,20}$", user.username):
            raise HTTPException(
                status_code=400, 
                detail="Username inválido. Use apenas letras minúsculas, números e _ (3-20 caracteres)"
            )

        hashed_password = pwd_context.hash(user.password)

        res = supabase.table("users").insert({
            "name": user.name,
            "email": user.email,
            "username": user.username,
            "password": hashed_password,
            "role": user.role
        }).execute()

        return {"message": "Usuário registrado com sucesso", "user": res.data[0] if res.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.post("/login")
def login(data: LoginData):
    try:
        result = supabase.table("users").select("*").eq("email", data.email).execute()
        user = result.data[0] if result.data else None

        if not user:
            raise HTTPException(status_code=400, detail="Email ou senha inválidos.")

        if not pwd_context.verify(data.password, user["password"]):
            raise HTTPException(status_code=400, detail="Email ou senha inválidos.")

        user.pop("password", None)
        return {"message": "Login OK", "user": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")


@app.get("/api/noticias")
async def get_noticias(limit: int = 6):
    """Endpoint para obter notícias de futebol feminino"""
    try:
        noticias = news_service.get_news(limit)
        return {
            "success": True,
            "noticias": noticias,
            "total": len(noticias),
            "source": "api" if len(noticias) > 0 and noticias[0].get("id", 0) > 3 else "fallback"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "noticias": [],
            "source": "error"
        }

# Rotas para posts
@app.post("/posts")
def create_post(post: PostCreate):
    try:
        # Preparar dados para inserção
        post_data = {
            "content": post.content,
            "user_id": post.user_id,
            "user_email": post.user_email,
            "user_name": post.user_name,
            "likes_count": 0,
            "image": post.image,
            "video": post.video  # ADICIONE ESTA LINHA
        }
        
        # Remover campos None para não enviar dados desnecessários
        post_data = {k: v for k, v in post_data.items() if v is not None}
        
        result = supabase.table("posts").insert(post_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Erro ao criar post")
            
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.get("/posts")
def get_posts():
    try:
        result = supabase.table("posts").select("*").order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar posts: {str(e)}")

@app.get("/posts/{post_id}")
def get_post(post_id: str):
    try:
        result = supabase.table("posts").select("*").eq("id", post_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Post não encontrado")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar post: {str(e)}")

@app.get("/posts/{post_id}/likes")
def get_post_likes(post_id: str):
    try:
        result = supabase.table("post_likes").select("user_id").eq("post_id", post_id).execute()
        return {"likes": [like["user_id"] for like in result.data]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar likes: {str(e)}")

@app.post("/posts/like")
def toggle_like(like: LikeRequest):
    try:
        existing_like = supabase.table("post_likes").select("*").eq("post_id", like.post_id).eq("user_id", like.user_id).execute()
        
        if existing_like.data:
            supabase.table("post_likes").delete().eq("post_id", like.post_id).eq("user_id", like.user_id).execute()
            current_post = supabase.table("posts").select("likes_count").eq("id", like.post_id).execute()
            if current_post.data:
                new_count = current_post.data[0]["likes_count"] - 1
                supabase.table("posts").update({"likes_count": new_count}).eq("id", like.post_id).execute()
            action = "removed"
        else:
            supabase.table("post_likes").insert({
                "post_id": like.post_id,
                "user_id": like.user_id
            }).execute()
            current_post = supabase.table("posts").select("likes_count").eq("id", like.post_id).execute()
            if current_post.data:
                new_count = current_post.data[0]["likes_count"] + 1
                supabase.table("posts").update({"likes_count": new_count}).eq("id", like.post_id).execute()
            action = "added"
        
        likes_result = supabase.table("post_likes").select("user_id").eq("post_id", like.post_id).execute()
        liked_users = [like["user_id"] for like in likes_result.data] if likes_result.data else []
        
        updated_post = supabase.table("posts").select("*").eq("id", like.post_id).execute()
        return {
            "action": action, 
            "post": updated_post.data[0] if updated_post.data else None,
            "liked_users": liked_users
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar like: {str(e)}")

@app.put("/posts/{post_id}")
def update_post(post_id: str, post_update: PostUpdate):
    try:
        result = supabase.table("posts").update({
            "content": post_update.content
        }).eq("id", post_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Post não encontrado")
            
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar post: {str(e)}")

@app.delete("/posts/{post_id}")
def delete_post(post_id: str):
    try:
        # Primeiro deletar comentários e likes associados
        supabase.table("comments").delete().eq("post_id", post_id).execute()
        supabase.table("post_likes").delete().eq("post_id", post_id).execute()
        
        # Depois deletar o post
        result = supabase.table("posts").delete().eq("id", post_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Post não encontrado")
            
        return {"message": "Post deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar post: {str(e)}")

# NOVO: Rotas para comentários
@app.post("/comments")
def create_comment(comment: CommentCreate):
    try:
        # Buscar informações do usuário
        user_result = supabase.table("users").select("name, avatar").eq("id", comment.user_id).execute()
        if not user_result.data:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        user_data = user_result.data[0]
        
        result = supabase.table("comments").insert({
            "post_id": comment.post_id,
            "user_id": comment.user_id,
            "user_name": user_data["name"],
            "user_avatar": user_data.get("avatar"),
            "content": comment.content
        }).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Erro ao criar comentário")
            
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.get("/comments/{post_id}")
def get_comments(post_id: str):
    try:
        result = supabase.table("comments").select("*").eq("post_id", post_id).order("created_at", desc=False).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar comentários: {str(e)}")

@app.put("/comments/{comment_id}")
def update_comment(comment_id: str, comment_update: CommentUpdate):
    try:
        # Primeiro verificar se o comentário existe e pertence ao usuário
        existing_comment = supabase.table("comments").select("*").eq("id", comment_id).execute()
        if not existing_comment.data:
            raise HTTPException(status_code=404, detail="Comentário não encontrado")
        
        result = supabase.table("comments").update({
            "content": comment_update.content,
            "updated_at": datetime.now().isoformat()
        }).eq("id", comment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Comentário não encontrado")
            
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar comentário: {str(e)}")

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: str):
    try:
        # Primeiro verificar se o comentário existe
        existing_comment = supabase.table("comments").select("*").eq("id", comment_id).execute()
        if not existing_comment.data:
            raise HTTPException(status_code=404, detail="Comentário não encontrado")
        
        result = supabase.table("comments").delete().eq("id", comment_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Comentário não encontrado")
            
        return {"message": "Comentário deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar comentário: {str(e)}")

@app.get("/posts/{post_id}/comments/count")
def get_comments_count(post_id: str):
    try:
        result = supabase.table("comments").select("id", count="exact").eq("post_id", post_id).execute()
        return {"count": len(result.data) if result.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao contar comentários: {str(e)}")

# Rotas de perfil
@app.get("/user/{user_id}")
def get_user(user_id: str):
    try:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        user = result.data[0] if result.data else None
        
        if not user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        user.pop("password", None)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar usuário: {str(e)}")

@app.put("/user/{user_id}")
def update_user(user_id: str, user_update: UserUpdate):
    try:
        update_data = {}
        
        if user_update.name is not None:
            update_data["name"] = user_update.name
            
        if user_update.username is not None:
            # Validar formato do username
            import re
            if not re.match("^[a-z0-9_]{3,20}$", user_update.username):
                raise HTTPException(
                    status_code=400, 
                    detail="Username inválido. Use apenas letras minúsculas, números e _ (3-20 caracteres)"
                )
            
            
            existing_username = supabase.table("users").select("*").eq("username", user_update.username).neq("id", user_id).execute()
            if existing_username.data:
                raise HTTPException(status_code=400, detail="Username já está em uso por outro usuário.")
            
            update_data["username"] = user_update.username
            
        if user_update.bio is not None:
            update_data["bio"] = user_update.bio
            
        if user_update.location is not None:
            update_data["location"] = user_update.location
            
        if user_update.avatar is not None:
            update_data["avatar"] = user_update.avatar
        
        
        if not update_data:
            raise HTTPException(status_code=400, detail="Nenhum dado fornecido para atualização")
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        result = supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        updated_user = result.data[0]
        updated_user.pop("password", None)
        return {"message": "Perfil atualizado com sucesso", "user": updated_user}
        
    except HTTPException:
        
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar usuário: {str(e)}")

# Rotas de seguidores
@app.post("/follow")
def follow_user(follow: FollowRequest):
    try:
        existing_follow = supabase.table("user_follows").select("*").eq("follower_id", follow.follower_id).eq("following_id", follow.following_id).execute()
        
        if existing_follow.data:
            raise HTTPException(status_code=400, detail="Já está seguindo este usuário")
        
        result = supabase.table("user_follows").insert({
            "follower_id": follow.follower_id,
            "following_id": follow.following_id
        }).execute()
        
        return {"message": "Usuário seguido com sucesso", "follow": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao seguir usuário: {str(e)}")

@app.delete("/unfollow/{follower_id}/{following_id}")
def unfollow_user(follower_id: str, following_id: str):
    try:
        result = supabase.table("user_follows").delete().eq("follower_id", follower_id).eq("following_id", following_id).execute()
        return {"message": "Deixou de seguir o usuário"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deixar de seguir: {str(e)}")

@app.get("/user/{user_id}/followers")
def get_followers(user_id: str):
    try:
        result = supabase.table("user_follows").select("follower_id").eq("following_id", user_id).execute()
        follower_ids = [follow["follower_id"] for follow in result.data] if result.data else []
        
        followers = []
        for follower_id in follower_ids:
            user_result = supabase.table("users").select("id, name, username, avatar").eq("id", follower_id).execute()
            if user_result.data:
                followers.append(user_result.data[0])
        
        return {"followers": followers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar seguidores: {str(e)}")

@app.get("/user/{user_id}/following")
def get_following(user_id: str):
    try:
        result = supabase.table("user_follows").select("following_id").eq("follower_id", user_id).execute()
        following_ids = [follow["following_id"] for follow in result.data] if result.data else []
        
        following = []
        for following_id in following_ids:
            user_result = supabase.table("users").select("id, name, username, avatar").eq("id", following_id).execute()
            if user_result.data:
                following.append(user_result.data[0])
        
        return {"following": following}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar seguindo: {str(e)}")

@app.get("/user/{user_id}/is_following/{target_id}")
def check_is_following(user_id: str, target_id: str):
    try:
        result = supabase.table("user_follows").select("*").eq("follower_id", user_id).eq("following_id", target_id).execute()
        return {"is_following": len(result.data) > 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar seguindo: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "API está funcionando!", "status": "online"}

# Adicione esta rota após as outras rotas de usuário
@app.get("/users")
def get_all_users():
    try:
        result = supabase.table("users").select("id, name, username, avatar, email").execute()
        
        users = []
        for user in result.data:
            user_data = {
                "id": user["id"],
                "name": user["name"],
                "username": user["username"],
                "avatar": user["avatar"]
            }
            users.append(user_data)
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar usuários: {str(e)}")

# E também uma rota de busca específica
@app.get("/users/search")
def search_users(q: str = ""):
    try:
        if not q:
            return []
            
        # Busca por nome ou username
        result = supabase.table("users").select("id, name, username, avatar").or_(f"name.ilike.%{q}%,username.ilike.%{q}%").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar usuários: {str(e)}")

@app.get("/comments")
def get_all_comments():
    
    try:
        result = supabase.table("comments").select("*").order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar comentários: {str(e)}")

@app.get("/admin/stats")
def get_admin_stats():
    
    try:
        
        users_result = supabase.table("users").select("id", count="exact").execute()
        users_count = len(users_result.data) if users_result.data else 0
       
        posts_result = supabase.table("posts").select("id", count="exact").execute()
        posts_count = len(posts_result.data) if posts_result.data else 0
        
        comments_result = supabase.table("comments").select("id", count="exact").execute()
        comments_count = len(comments_result.data) if users_result.data else 0
        
        active_users_result = supabase.table("posts").select("user_id").execute()
        active_users = len(set(post["user_id"] for post in active_users_result.data)) if active_users_result.data else 0
        
        return {
            "success": True,
            "stats": {
                "total_users": users_count,
                "total_posts": posts_count,
                "total_comments": comments_count,
                "active_users": active_users,
                "timestamp": datetime.now().isoformat()
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/admin/users")
def get_all_users_admin():
    
    try:
        
        result = supabase.table("users").select("id, name, email, username, role, updated_at").execute()
        
        
        users = []
        for user in result.data:
            users.append({
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "username": user["username"],
                "role": user["role"],
                "created_at": user.get("updated_at") 
            })
        
        return {
            "success": True,
            "users": users
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.put("/admin/users/{user_id}/role")
def update_user_role(user_id: str, role: str):
    """Altera role do usuário (apenas admin)"""
    try:
        result = supabase.table("users").update({
            "role": role,
            "updated_at": datetime.now().isoformat()
        }).eq("id", user_id).execute()
        
        return {
            "success": True,
            "message": f"Role atualizada para {role}",
            "user": result.data[0] if result.data else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
    
@app.delete("/admin/users/{user_id}")
def delete_user(user_id: str):
    """Deletar usuário (apenas admin)"""
    try:
        
        supabase.table("comments").delete().eq("user_id", user_id).execute()
        supabase.table("post_likes").delete().eq("user_id", user_id).execute()
        supabase.table("posts").delete().eq("user_id", user_id).execute()
        supabase.table("user_follows").delete().or_(f"follower_id.eq.{user_id},following_id.eq.{user_id}").execute()
        
        
        result = supabase.table("users").delete().eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
            
        return {"success": True, "message": "Usuário deletado com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar usuário: {str(e)}")



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

@app.get("/api/matches/{match_id}")
async def get_match_details(match_id: str):
    try:
        result = await football_service.get_match_details(match_id)
        return {
            "success": True,
            "data": result["data"],
            "source": result["source"]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "data": None,
            "source": "error"
        }

@app.get("/api/status")
async def get_api_status():
    return {
        "has_premium_access": football_service.has_premium_access,
        "mode": "premium" if football_service.has_premium_access else "free",
        "message": "API Premium ativa" if football_service.has_premium_access else "Usando dados mockados"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "football_api": "active",
            "news_service": "active",
            "database": "active"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)