"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Script from "next/script";
import UserProfileModal from "../components/UserProfileModal";

const API_BASE_URL = "https://passa-a-bola.onrender.com";
const MAX_POST_LENGTH = 500;

export default function CommunityPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [activeSection, setActiveSection] = useState("feed");
  const [active, setActive] = useState(2);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editText, setEditText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [commentsCount, setCommentsCount] = useState({});
  
  // Novos estados para controle de carregamento e erro
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);
  const [followingLoading, setFollowingLoading] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    const userData = localStorage.getItem("currentUser");
    
    if (!loggedIn || !userData) {
      router.push("/login");
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchPosts(user.id);
      fetchFollowing(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author_username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);

  const fetchPosts = async (userId) => {
    setPostsLoading(true);
    setPostsError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/posts`);
      
      if (!res.ok) {
        throw new Error(`Erro ${res.status}: Não foi possível carregar os posts`);
      }
      
      const data = await res.json();
      
      // Se não há posts, definir array vazio
      if (!data || data.length === 0) {
        setPosts([]);
        setFilteredPosts([]);
        setPostsLoading(false);
        return;
      }
      
      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          try {
            const likesRes = await fetch(`${API_BASE_URL}/posts/${post.id}/likes`);
            let likedByUser = false;
            let likesCount = post.likes_count || 0;
            
            if (likesRes.ok) {
              const likesData = await likesRes.json();
              likedByUser = likesData.likes && likesData.likes.includes(userId);
            }
            
            // Buscar informações completas do usuário incluindo username
            const userInfo = await getUserInfo(post.user_id);
            
            return {
              id: post.id,
              text: post.content,
              author: userInfo.name || post.user_name,
              author_username: userInfo.username,
              author_id: post.user_id,
              author_avatar: userInfo.avatar,
              likes: likesCount,
              likedBy: likedByUser ? [user.name] : [],
              image: post.image,
              created_at: post.created_at
            };
          } catch (error) {
            console.error(`Erro ao processar post ${post.id}:`, error);
            // Retornar post básico em caso de erro
            return {
              id: post.id,
              text: post.content,
              author: post.user_name,
              author_username: null,
              author_id: post.user_id,
              author_avatar: "/perfilPadrao.jpg",
              likes: post.likes_count || 0,
              likedBy: [],
              image: post.image,
              created_at: post.created_at,
              error: true
            };
          }
        })
      );
      
      const validPosts = postsWithLikes.filter(post => post !== null);
      setPosts(validPosts);
      fetchCommentsCount(validPosts);
      setFilteredPosts(validPosts);
      
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
      setPostsError(error.message);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Nova função para buscar informações completas do usuário
  const getUserInfo = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        return {
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar || "/perfilPadrao.jpg"
        };
      }
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
    }
    return {
      name: "Usuário",
      username: null,
      avatar: "/perfilPadrao.jpg"
    };
  };

  const fetchFollowing = async (userId) => {
    setFollowingLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}/following`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following || []);
      } else {
        setFollowing([]);
      }
    } catch (error) {
      console.error("Erro ao buscar seguindo:", error);
      setFollowing([]);
    } finally {
      setFollowingLoading(false);
    }
  };

  const getUserAvatar = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        return userData.avatar || "/perfilPadrao.jpg";
      }
    } catch (error) {
      console.error("Erro ao buscar avatar:", error);
    }
    return "/perfilPadrao.jpg";
  };

  // Função para buscar usuários
  const searchUsers = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Buscar todos os usuários e filtrar localmente
      const usersRes = await fetch(`${API_BASE_URL}/users`);
      if (usersRes.ok) {
        const allUsers = await usersRes.json();
        const filteredUsers = allUsers.filter(user => 
          user.name.toLowerCase().includes(term.toLowerCase()) ||
          (user.username && user.username.toLowerCase().includes(term.toLowerCase()))
        );
        setSearchResults(filteredUsers);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim() || !user) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostText,
          user_id: user.id,
          user_email: user.email,
          user_name: user.name,
          image: newPostImage
        }),
      });

      if (res.ok) {
        setNewPostText("");
        setNewPostImage(null);
        setShowPostModal(false);
        await fetchPosts(user.id);
      } else {
        throw new Error("Erro ao criar post");
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Erro ao criar publicação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          user_id: user.id
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: data.post.likes_count, 
                likedBy: data.action === "added" ? [user.name] : [] 
              }
            : post
        ));
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        throw new Error("Erro ao excluir post");
      }
    } catch (error) {
      console.error("Erro ao deletar post:", error);
      alert("Erro ao excluir publicação. Tente novamente.");
    }
  };

  const handleEditPost = async (postId) => {
    if (!editText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editText
        }),
      });

      if (res.ok) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, text: editText }
            : post
        ));
        setEditingPost(null);
        setEditText("");
      } else {
        throw new Error("Erro ao editar post");
      }
    } catch (error) {
      console.error("Erro ao editar post:", error);
      alert("Erro ao editar publicação. Tente novamente.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
  };

  const handleFollowUpdate = () => {
    if (user) {
      fetchFollowing(user.id);
    }
  };

  const fetchCommentsCount = async (postsArray = posts) => {
    const counts = {};
    
    for (const post of postsArray) {
      try {
        const res = await fetch(`${API_BASE_URL}/posts/${post.id}/comments/count`);
        if (res.ok) {
          const data = await res.json();
          counts[post.id] = data.count;
        } else {
          counts[post.id] = 0;
        }
      } catch (error) {
        console.error(`Erro ao buscar contagem para post ${post.id}:`, error);
        counts[post.id] = 0;
      }
    }
    
    setCommentsCount(counts);
  };

  const PostMenu = ({ post, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    if (!user || post.author_id !== user.id) return null;

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ⋮
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setShowMenu(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    );
  };

  const PostHeader = ({ post }) => {
    return (
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleUserClick(post.author_id)}
          >
            <img
              src={post.author_avatar}
              alt={post.author}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-gray-900 hover:text-[var(--primary-color)]">
                {post.author}
              </p>
              <p className="text-xs text-gray-500">
                @{post.author_username || post.author.toLowerCase().replace(/\s+/g, '')}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
        <PostMenu 
          post={post}
          onEdit={() => {
            setEditingPost(post.id);
            setEditText(post.text);
          }}
          onDelete={() => handleDeletePost(post.id)}
        />
      </div>
    );
  };

  // Componente de loading para posts
  const PostSkeleton = () => (
    <div className="bg-white rounded-xl shadow p-4 mb-6 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex gap-6">
        <div className="h-6 w-12 bg-gray-200 rounded"></div>
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="bg-[#f5f6f8] min-h-screen flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f8] min-h-screen flex flex-col">
      <header className="md:hidden flex justify-between mt-10 md:mt-[5vh] ml-[6vw] mr-[4vh]">
        <h1 className="flex text-[6vw]">Comunidade</h1>
        <img
          src="/svgs/tabler_plus.svg"
          alt="+"
          className="h-6 mt-2 cursor-pointer"
          onClick={() => setShowPostModal(true)}
        />
      </header>

      <div className="hidden md:block mt-17">
        <Header name={user.name || "Usuário"} />
      </div>

      <section className="mt-0 p-4 w-full flex-1">
        <div className="flex justify-center md:gap-130 mb-4">
          <button
            onClick={() => setActiveSection("feed")}
            className={`w-40 h-10 ${
              activeSection === "feed" ? "border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] font-semibold" : "text-gray-600"
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveSection("amigos")}
            className={`w-40 h-10 ${
              activeSection === "amigos" ? "border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] font-semibold" : "text-gray-600"
            }`}
          >
            Amigos
          </button>
        </div>

        <div className="md:hidden mb-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="Pesquisar publicações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {activeSection === "feed" && (
            <div>
              <div className="hidden md:block p-4">
                <div className="max-w-4xl mx-auto flex gap-4 items-center">
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="bg-[var(--primary-color)] text-white cursor-pointer px-3 py-3 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                  >
                    <span>+</span>
                    <span>Nova Publicação</span>
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Pesquisar publicações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Estado de Carregamento */}
              {postsLoading && (
                <div>
                  {[...Array(3)].map((_, index) => (
                    <PostSkeleton key={index} />
                  ))}
                </div>
              )}
              
              {/* Estado de Erro */}
              {postsError && !postsLoading && (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-red-600 font-semibold mb-2">Erro ao carregar posts</p>
                    <p className="text-red-500 text-sm mb-4">{postsError}</p>
                    <button
                      onClick={() => user && fetchPosts(user.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              )}
              
              {/* Posts Carregados com Sucesso */}
              {!postsLoading && !postsError && (
                <>
                  {searchTerm && (
                    <p className="text-gray-600 mb-4 text-center">
                      {filteredPosts.length} resultado(s) para &quot;{searchTerm}&quot;
                    </p>
                  )}
                  
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {searchTerm ? "Nenhuma publicação encontrada." : "Nenhuma publicação ainda. Seja o primeiro a publicar!"}
                      </p>
                    </div>
                  ) : (
                    filteredPosts.map((post, index) => (
                      <div key={post.id} className="mb-6">
                        <div className="bg-white rounded-xl shadow hover:shadow-md transition-shadow">
                          <div className="p-4">
                            <PostHeader post={post} />
                            
                            {editingPost === post.id ? (
                              <div onClick={(e) => e.stopPropagation()}>
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full border rounded p-2 mb-2"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditPost(post.id)}
                                    className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingPost(null)}
                                    className="px-3 py-1 bg-gray-300 rounded text-sm"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="mb-3 break-words whitespace-pre-wrap">{post.text}</p>

                                {post.image && (
                                  <img
                                    src={post.image}
                                    alt="Post"
                                    className="rounded-lg max-h-80 mx-auto items-center  mb-3"
                                  />
                                )}
                              </>
                            )}

                            <div className="flex gap-6 items-center text-sm">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(post.id);
                                }}
                                className="flex items-center gap-2 focus:outline-none hover:text-red-600"
                              >
                                {post.likedBy?.includes(user.name) ? (
                                  <span className="text-red-600 text-xl">❤️</span>
                                ) : (
                                  <span className="text-gray-400 text-xl">🤍</span>
                                )}
                                <span>{post.likes || 0}</span>
                              </button>
                              <span 
                                className="text-gray-500 flex items-center gap-2 cursor-pointer hover:text-[var(--primary-color)] transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/comments?id=${post.id}`);
                                }}
                              >
                                💬 {commentsCount[post.id] || 0} comentários
                              </span>
                            </div>
                          </div>
                        </div>

                        {index % 3 === 2 && (
                          <div className="my-6">
                            <ins
                              className="adsbygoogle"
                              style={{ display: "block" }}
                              data-ad-client="ca-pub-6447246104244403"
                              data-ad-slot="1234567890"
                              data-ad-format="auto"
                              data-full-width-responsive="true"
                            ></ins>
                            <Script id={`adsense-${post.id}`} strategy="afterInteractive">
                              {`(adsbygoogle = window.adsbygoogle || []).push({});`}
                            </Script>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === "amigos" && (
            <div className="max-w-4xl mx-auto">
              {/* Barra de pesquisa de usuários */}
              <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar usuários por @ ou nome"
                    value={userSearchTerm}
                    onChange={(e) => {
                      setUserSearchTerm(e.target.value);
                      searchUsers(e.target.value);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  />
                  {userSearchTerm && (
                    <button
                      onClick={() => {
                        setUserSearchTerm("");
                        setSearchResults([]);
                      }}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Resultados da pesquisa ou lista de seguidores */}
              {userSearchTerm ? (
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {searching ? "Buscando..." : `Resultados para "${userSearchTerm}"`}
                  </h3>
                  {searching ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Carregando...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
                  ) : (
                    <div className="grid gap-3">
                      {searchResults.map((user) => (
                        <div 
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <img
                            src={user.avatar || "/perfilPadrao.jpg"}
                            alt={user.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username || "usuário"}</p>
                          </div>
                          <button className="text-[var(--primary-color)] text-sm font-medium hover:text-[var(--primary-color)]">
                            Ver perfil
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Pessoas que você segue</h3>
                  {followingLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Carregando...</p>
                    </div>
                  ) : following.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Você ainda não segue ninguém</p>
                  ) : (
                    <div className="grid gap-3">
                      {following.map((user) => (
                        <div 
                          key={user.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <img
                            src={user.avatar || "/perfilPadrao.jpg"}
                            alt={user.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                          <span className="text-[var(--primary-color)] text-sm">Seguindo</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Nova Publicação (mantido igual) */}
      {showPostModal && (
        <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Nova Publicação</h2>
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setNewPostText("");
                    setNewPostImage(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="O que você está pensando?"
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                  rows="5"
                  maxLength={MAX_POST_LENGTH}
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  {newPostText.length}/{MAX_POST_LENGTH}
                </div>
              </div>

              {newPostImage && (
                <div className="mb-4 relative">
                  <img
                    src={newPostImage}
                    alt="Preview"
                    className="rounded-lg max-h-60 w-full object-cover"
                  />
                  <button
                    onClick={() => setNewPostImage(null)}
                    className="absolute top-2 right-2 bg-[#0000006d] bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
                  >
                    📷 Adicionar imagem
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setNewPostText("");
                    setNewPostImage(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim() || loading}
                  className={`px-6 py-2 rounded-lg text-white transition-colors ${
                    !newPostText.trim() || loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[var(--primary-color)] hover:bg-opacity-90"
                  }`}
                >
                  {loading ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserProfileModal
          userId={selectedUser}
          currentUser={user}
          onClose={() => setSelectedUser(null)}
          onFollowUpdate={handleFollowUpdate}
        />
      )}

      <div className="mb-25 bottom-0 left-0 w-full z-50 md:hidden">
        <BottomNav activeIndex={active} onChange={setActive} />
      </div>
    </div>
  );
}