'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, MapPin, Calendar, LogOut, Users, Crown, Check, Star, Zap, X } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import UserProfileModal from "../components/UserProfileModal";

const API_BASE_URL = "https://passa-a-bola.onrender.com";

export default function PerfilPage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(3);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [hasPremium, setHasPremium] = useState(false); // Estado temporário
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setUser(parsedUser);
      fetchUserPosts(parsedUser.id);
      fetchFollowers(parsedUser.id);
      fetchFollowing(parsedUser.id);
      
      // Temporário: verificar se usuário tem premium (mock)
      checkPremiumStatus(parsedUser.id);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Função temporária - depois integra com backend
  const checkPremiumStatus = (userId) => {
    // Mock - sempre false por enquanto
    setHasPremium(false);
  };

  const fetchUserPosts = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/posts`);
      if (res.ok) {
        const allPosts = await res.json();
        const userPosts = allPosts.filter(post => post.user_id === userId);
        
        const postsWithLikes = await Promise.all(
          userPosts.map(async (post) => {
            const likesRes = await fetch(`${API_BASE_URL}/posts/${post.id}/likes`);
            const likesData = await likesRes.json();
            const likedByUser = likesData.likes.includes(userId);
            
            return {
              id: post.id,
              text: post.content,
              image: post.image,
              likes: post.likes_count || 0,
              likedBy: likedByUser ? [user?.name] : [],
              created_at: post.created_at
            };
          })
        );
        
        setPosts(postsWithLikes);
      }
    } catch (error) {
      console.error("Erro ao buscar posts do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/followers`);
      if (res.ok) {
        const data = await res.json();
        setFollowers(data.followers || []);
        setFollowersCount(data.followers.length);
      }
    } catch (error) {
      console.error("Erro ao buscar seguidores:", error);
    }
  };

  const fetchFollowing = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/following`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || []);
        setFollowingCount(data.following.length);
      }
    } catch (error) {
      console.error("Erro ao buscar seguindo:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  const handleSubscribe = () => {
    // Temporário - só abre o modal
    setShowPremiumModal(true);
  };

  // COMPONENTE DO CARD PREMIUM
  const PremiumCard = () => {
    if (hasPremium) {
      return (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-8 w-8 text-yellow-300" />
            <div>
              <h3 className="text-xl font-bold">Torcedor Elite ✅</h3>
              <p className="text-green-100 text-sm">Sua assinatura está ativa!</p>
            </div>
          </div>
          <p className="text-sm mb-4">Aproveite todos os benefícios premium!</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-300" />
              <span>IA Ilimitada Ativa</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-300" />
              <span>Lembretes Inteligentes</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-300" />
              <span>Arquivo Histórico Completo</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl shadow-lg p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="h-8 w-8 text-yellow-300" />
          <div>
            <h3 className="text-xl font-bold">Torcedor Elite</h3>
            <p className="text-purple-100 text-sm">Experiência premium completa</p>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-green-300" />
    <span className="text-sm">IA Personalizada Ilimitada</span>
  </div>
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-green-300" />
    <span className="text-sm">Lembretes Inteligentes</span>
  </div>
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-green-300" />
    <span className="text-sm">Arquivo Histórico Completo</span>
  </div>
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-green-300" />
    <span className="text-sm">Notícias Antecipadas</span>
  </div>
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-green-300" />
    <span className="text-sm">Descontos Exclusivos</span>
  </div>
  {/* NOVOS BENEFÍCIOS PARA JOGADORAS */}
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-green-300" />
    <span className="text-sm">Portfólio Profissional</span>
  </div>
  <div className="flex items-center gap-2">
    <Check className="h-4 w-4 text-green-300" />
    <span className="text-sm">Perfil Verificado</span>
  </div>
</div>
        
        <button
          onClick={handleSubscribe}
          className="w-full bg-yellow-400 text-purple-900 font-bold py-3 px-4 rounded-xl hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2"
        >
          <Star className="h-5 w-5" />
          Obter Torcedor Elite
        </button>
      </div>
    );
  };

  // MODAL PREMIUM
  const PremiumModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-2xl p-6 text-white text-center relative">
          <button 
            onClick={() => setShowPremiumModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
          <Crown className="h-12 w-12 mx-auto mb-3 text-yellow-300" />
          <h2 className="text-2xl font-bold">Torcedor Elite</h2>
          <p className="text-purple-100">Upgrade para a experiência completa</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">IA Ilimitada</p>
                <p className="text-sm text-gray-600">Acesso sem restrições à nossa IA especializada</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">Lembretes Inteligentes</p>
                <p className="text-sm text-gray-600">Notificações personalizadas dos seus times</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">Conteúdo Exclusivo</p>
                <p className="text-sm text-gray-600">Arquivo histórico e notícias antecipadas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold">Vantagens Exclusivas</p>
                <p className="text-sm text-gray-600">Descontos e benefícios com parceiros</p>
              </div>
            </div>
             <div className="flex items-center gap-3">
    <Zap className="h-5 w-5 text-green-500" />
    <div>
      <p className="font-semibold">Portfólio Profissional</p>
      <p className="text-sm text-gray-600">Perfil verificado, estatísticas e visibilidade para olheiros</p>
    </div>
  </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-gray-900">R$ 19,90</span>
                <span className="text-gray-600">/mês</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">ou R$ 167,90/ano (economize 30%)</p>
            </div>
          </div>
          
          <div className="space-y-3">
  <button
    onClick={() => router.push("/checkout-premium")}
    className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors"
  >
    Assinar Agora
  </button>
  <button
    onClick={() => setShowPremiumModal(false)}
    className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors"
  >
    Talvez Depois
  </button>
</div>
        </div>
      </div>
    </div>
  );

  const FollowersModal = () => (
    <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Seguidores</h3>
            <button onClick={() => setShowFollowers(false)} className="text-gray-500 hover:text-gray-700">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {followers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum seguidor</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {followers.map((follower) => (
                <div 
                  key={follower.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(follower.id)}
                >
                  <img
                    src={follower.avatar || "/perfilPadrao.jpg"}
                    alt={follower.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{follower.name}</p>
                    <p className="text-sm text-gray-500">@{follower.username}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const FollowingModal = () => (
    <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Seguindo</h3>
            <button onClick={() => setShowFollowing(false)} className="text-gray-500 hover:text-gray-700">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {following.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Não segue ninguém</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {following.map((followed) => (
                <div 
                  key={followed.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedUser(followed.id)}
                >
                  <img
                    src={followed.avatar || "/perfilPadrao.jpg"}
                    alt={followed.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{followed.name}</p>
                    <p className="text-sm text-gray-500">@{followed.username}</p>
                  </div>
                  <span className="text-purple-600 text-sm">Seguindo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Mobile */}
      <div className="md:hidden">
        <div className="w-full mx-auto min-h-screen"> 
          <div className="relative bg-[var(--primary-color)] pt-6 pb-20">
            <div className="px-4">
              <div className="flex justify-between items-start mb-4">
                <span></span>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push("/editar-perfil")}
                    className="text-white p-2 rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-white p-2 bg-red-400 rounded-full backdrop-blur-sm"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="flex items-end gap-4">
                  <div className="relative">
                    <img
                      src={user.avatar || "/perfilPadrao.jpg"}
                      alt="Foto de perfil"
                      className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 border-2 border-white rounded-full w-6 h-6"></div>
                  </div>
                  
                  <div className="pb-2">
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                      {user.name || "Usuário"}
                    </h1>
                    <p className="text-purple-200 text-sm">
                      @{user.username || user.name?.toLowerCase().replace(/\s+/g, '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative -mt-8 mx-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                <div className="text-xs text-gray-500">Publicações</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowFollowers(true)}
              >
                <div className="text-2xl font-bold text-gray-900">{followersCount}</div>
                <div className="text-xs text-gray-500">Seguidores</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowFollowing(true)}
              >
                <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
                <div className="text-xs text-gray-500">Seguindo</div>
              </div>
            </div>
          </div>

          {/* CARD PREMIUM NO MOBILE */}
          <div className="px-4 mt-4">
            <PremiumCard />
          </div>

          <div className="px-4 mt-4">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                {user.bio || "Adicione uma bio criativa para que outros usuários possam te conhecer melhor!"}
              </p>
              
              <div className="space-y-3">
                {user.location && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Membro desde 2024</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 mt-6 mb-20">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Posts</h3>
              <span className="text-gray-500 text-sm">{posts.length}</span>
            </div>

            {loading ? (
              <p className="text-gray-400 text-sm text-center">Carregando posts...</p>
            ) : posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow p-4">
                    <p className="mb-3 break-words whitespace-pre-wrap">{post.text}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Imagem do post"
                        className="rounded-lg max-h-80 mx-auto items-center mb-3"
                      />
                    )}
                    <div className="flex gap-4 items-center text-sm mt-3 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-gray-500">
                        ❤️ {post.likes || 0} curtidas
                      </span>
                      <span className="text-gray-500 text-xs">
                        {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center">
                Nenhum post ainda.
              </p>
            )}
          </div>

          <BottomNav activeIndex={active} onChange={setActive} />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <Header name={user.name || "Usuário"} />
        
        <div className="max-w-6xl mx-auto px-6 py-8 mt-15">
          <div className="bg-[var(--primary-color)] rounded-3xl shadow-xl overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div></div>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/editar-perfil")}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full font-medium hover:bg-white/30 transition-colors"
                  >
                    Editar Perfil
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="flex items-end gap-6">
                  <div className="relative">
                    <img
                      src={user.avatar || "/perfilPadrao.jpg"}
                      alt="Foto de perfil"
                      className="h-32 w-32 rounded-3xl border-4 border-white shadow-2xl object-cover"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white rounded-full w-8 h-8"></div>
                  </div>
                  
                  <div className="pb-2">
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
                      {user.name || "Usuário"}
                    </h1>
                    <p className="text-purple-200 text-lg">
                      @{user.username || user.name?.toLowerCase().replace(/\s+/g, '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {/* CARD PREMIUM NO DESKTOP */}
              <PremiumCard />
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Publicações</span>
                    <span className="font-semibold text-purple-600">{posts.length}</span>
                  </div>
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowFollowers(true)}
                  >
                    <span className="text-gray-600">Seguidores</span>
                    <span className="font-semibold text-purple-600">{followersCount}</span>
                  </div>
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowFollowing(true)}
                  >
                    <span className="text-gray-600">Seguindo</span>
                    <span className="font-semibold text-purple-600">{followingCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sobre</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {user.bio || "Adicione uma bio criativa para que outros usuários possam te conhecer melhor!"}
                </p>
                
                <div className="space-y-3">
                  {user.location && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-gray-600">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Membro desde 2024</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Publicações</h3>
                
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-gray-50 rounded-xl p-4">
                        <p className="mb-3 break-words whitespace-pre-wrap">{post.text}</p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt="Imagem do post"
                            className="rounded-lg max-h-80 mx-auto items-center mb-3"
                          />
                        )}
                        <div className="flex gap-4 items-center text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            ❤️ {post.likes || 0} curtidas
                          </span>
                          <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma publicação ainda</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedUser && (
        <UserProfileModal
          userId={selectedUser}
          currentUser={user}
          onClose={() => setSelectedUser(null)}
          onFollowUpdate={() => {
            fetchFollowers(user.id);
            fetchFollowing(user.id);
          }}
        />
      )}

      {showFollowers && <FollowersModal />}
      {showFollowing && <FollowingModal />}
      {showPremiumModal && <PremiumModal />}
    </div>
  );
}