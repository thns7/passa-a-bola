"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import BottomNav from "../components/BottomNav";
import Script from "next/script";

const API_BASE_URL = "https://passa-a-bola.onrender.com"; // Trocar para o URL real da API
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
    }
  }, [user]);

  // Filtra posts quando searchTerm muda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);

  const fetchPosts = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts`);
      if (res.ok) {
        const data = await res.json();
        
        const postsWithLikes = await Promise.all(
          data.map(async (post) => {
            const likesRes = await fetch(`${API_BASE_URL}/posts/${post.id}/likes`);
            const likesData = await likesRes.json();
            const likedByUser = likesData.likes.includes(userId);
            
            return {
              id: post.id,
              text: post.content,
              author: post.user_name,
              author_id: post.user_id,
              likes: post.likes_count || 0,
              likedBy: likedByUser ? [user.name] : [],
              image: post.image,
              created_at: post.created_at
            };
          })
        );
        
        setPosts(postsWithLikes);
        setFilteredPosts(postsWithLikes);
      }
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
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
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
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
      }
    } catch (error) {
      console.error("Erro ao deletar post:", error);
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
      }
    } catch (error) {
      console.error("Erro ao editar post:", error);
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

  const getCommentsCount = (postId) => {
    return 0;
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

  // Se user ainda não carregou, mostrar loading
  if (!user) {
    return (
      <div className="bg-[#F0F0F0] min-h-screen flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F0F0F0] min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="md:hidden flex justify-between mt-10 md:mt-[5vh] ml-[6vw] mr-[4vh]">
        <h1 className="flex text-[6vw]">Comunidade</h1>
        <img
          src="/svgs/tabler_plus.svg"
          alt="+"
          className="h-6 mt-2 cursor-pointer"
          onClick={() => setShowPostModal(true)}
        />
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block mt-17">
        <Header name={user.name || "Usuário"} />
        
    
      </div>

      <section className=" mt-0 p-4 w-full flex-1">
        <div className="flex justify-center md:gap-130 mb-4">
          <button
            onClick={() => setActiveSection("feed")}
            className={` w-40 h-10 ${
              activeSection === "feed" ? "border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] font-semibold" : "text-gray-600"
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => setActiveSection("amigos")}
            className={` w-40 h-10 ${
              activeSection === "amigos" ? "border-b-2 border-[var(--primary-color)] text-[var(--primary-color)] font-semibold" : "text-gray-600"
            }`}
          >
            Amigos
          </button>
        </div>

        {/* Barra de pesquisa - MOBILE */}
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
              {/* Barra de pesquisa e botão de criar post - DESKTOP */}
              <div className="hidden md:block  p-4">
                <div className="max-w-4xl mx-auto flex gap-4 items-center">
                  {/* Botão de criar post - DESKTOP */}
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="bg-[var(--primary-color)] text-white px-3 py-3 rounded-lg flex items-center gap-2 hover:bg-opacity-90"
                  >
                    <span>+</span>
                    <span>Nova Publicação</span>
                  </button>
                  {/* Barra de pesquisa */}
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
              {searchTerm && (
                <p className="text-gray-600 mb-4 text-center">
                  {filteredPosts.length} resultado(s) para &quot;{searchTerm}&quot;
                </p>
              )}
              
              {filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? "Nenhuma publicação encontrada." : "Nenhuma publicação ainda..."}
                  </p>
                  {!searchTerm && (
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="mt-4 bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg"
                    >
                      Seja o primeiro a publicar!
                    </button>
                  )}
                </div>
              ) : (
                filteredPosts.map((post, index) => (
                  <div key={post.id} className="mb-6">
                    <div className="bg-white rounded-xl shadow hover:shadow-md transition-shadow cursor-pointer relative">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 font-semibold">{post.author}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(post.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
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
                                className="rounded-lg max-h-80 w-full object-cover mb-3"
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
                          <span className="text-gray-500 flex items-center gap-2">
                            💬 {getCommentsCount(post.id)} comentários
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AdSense a cada 3 posts */}
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
            </div>
          )}

          {activeSection === "amigos" && (
            <div className="text-center py-8">
              <p className="text-gray-500">Lista de amigos aparece aqui...</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal de criar post */}
      {showPostModal && (
        <div className="fixed inset-0 bg-[var(--black-opacity)] flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-3">Nova Publicação</h2>
            <textarea
              value={newPostText}
              onChange={(e) => {
                if (e.target.value.length <= MAX_POST_LENGTH) {
                  setNewPostText(e.target.value);
                } else {
                  setNewPostText(e.target.value.slice(0, MAX_POST_LENGTH));
                }
              }}
              placeholder="Escreva algo..."
              className="w-full border rounded p-2 mb-2"
              rows={4}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-2 w-full"
            />

            <p className="text-sm text-gray-400 mb-3">
              {newPostText.length}/{MAX_POST_LENGTH} caracteres
            </p>
            {newPostImage && (
              <img
                src={newPostImage}
                alt="Prévia"
                className="rounded-lg max-h-40 object-cover mt-3 w-full"
              />
            )}

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePost}
                disabled={loading || !newPostText.trim()}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-25 bottom-0 left-0 w-full z-50 md:hidden">
        <BottomNav activeIndex={active} onChange={setActive} />
      </div>
    </div>
  );
}