"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, Edit3, Trash2, MoreVertical, ArrowLeft, Heart, MessageCircle, User } from "lucide-react";
import UserProfileModal from "../components/UserProfileModal";

const API_BASE_URL = "https://passa-a-bola.onrender.com";

export default function CommentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get("id");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  
  // Novos estados para loading
  const [postLoading, setPostLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postError, setPostError] = useState(null);
  const [commentsError, setCommentsError] = useState(null);
  
  // Estado para o modal de perfil
  const [selectedUser, setSelectedUser] = useState(null);

  // Estados para likes
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likesLoading, setLikesLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (userData) {
      try { 
        setUser(JSON.parse(userData)); 
      } catch { 
        setUser(null); 
      }
    }

    if (postId) {
      fetchPost();
      fetchComments();
      fetchLikes();
    } else {
      setPostError("ID do post não encontrado");
      setPostLoading(false);
    }
  }, [postId]);

  // Função para buscar informações completas do usuário
  const getUserInfo = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/${userId}`);
      if (res.ok) {
        const userData = await res.json();
        return {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          avatar: userData.avatar || "/perfilPadrao.jpg",
          bio: userData.bio,
          location: userData.location
        };
      }
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
    }
    return {
      id: userId,
      name: "Usuário",
      username: null,
      avatar: "/perfilPadrao.jpg"
    };
  };

  const fetchPost = async () => {
    setPostLoading(true);
    setPostError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`);
      
      if (!res.ok) {
        throw new Error(`Erro ${res.status}: Não foi possível carregar o post`);
      }
      
      const postData = await res.json();
      
      // Buscar informações completas do autor do post
      const authorInfo = await getUserInfo(postData.user_id);
      const postWithAuthorInfo = {
        ...postData,
        author_name: authorInfo.name,
        author_username: authorInfo.username,
        author_avatar: authorInfo.avatar,
        author_id: authorInfo.id
      };
      
      setPost(postWithAuthorInfo);
      
    } catch (error) {
      console.error("Erro ao buscar post:", error);
      setPostError(error.message);
    } finally {
      setPostLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${postId}`);
      
      if (!res.ok) {
        throw new Error(`Erro ${res.status}: Não foi possível carregar os comentários`);
      }
      
      const commentsData = await res.json();
      
      // Buscar informações completas de cada usuário dos comentários
      const commentsWithUserInfo = await Promise.all(
        commentsData.map(async (comment) => {
          const userInfo = await getUserInfo(comment.user_id);
          return {
            ...comment,
            user_name: userInfo.name,
            user_username: userInfo.username,
            user_avatar: userInfo.avatar,
            user_id: userInfo.id
          };
        })
      );
      
      setComments(commentsWithUserInfo);
      
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      setCommentsError(error.message);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Função para buscar likes do post
  const fetchLikes = async () => {
    if (!user || !postId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/likes`);
      if (res.ok) {
        const likesData = await res.json();
        const userLiked = likesData.likes && likesData.likes.includes(user.id);
        setIsLiked(userLiked);
        setLikesCount(likesData.likes_count || 0);
      }
    } catch (error) {
      console.error("Erro ao buscar likes:", error);
    }
  };

  // Função para curtir/descurtir o post
  const handleLike = async () => {
    if (!user || !postId || likesLoading) return;

    setLikesLoading(true);
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
        setIsLiked(data.action === "added");
        setLikesCount(data.post.likes_count);
      } else {
        throw new Error("Erro ao curtir post");
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
      alert("Erro ao curtir publicação. Tente novamente.");
    } finally {
      setLikesLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || !postId) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        }),
      });

      if (res.ok) {
        setNewComment("");
        await fetchComments();
      } else {
        throw new Error("Erro ao adicionar comentário");
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      alert("Erro ao adicionar comentário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editText.trim()
        }),
      });

      if (res.ok) {
        setEditingComment(null);
        setEditText("");
        await fetchComments();
      } else {
        throw new Error("Erro ao editar comentário");
      }
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      alert("Erro ao editar comentário. Tente novamente.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Tem certeza que deseja excluir este comentário?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchComments();
      } else {
        throw new Error("Erro ao excluir comentário");
      }
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
      alert("Erro ao excluir comentário. Tente novamente.");
    }
  };

  const handleUserClick = (userId) => {
    setSelectedUser(userId);
  };

  // Componente do Menu para comentários
  const CommentMenu = ({ comment, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    if (!user || comment.user_id !== user.id) return null;

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[140px] py-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 transition-colors"
            >
              <Edit3 className="h-3 w-3" />
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 text-sm transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Excluir
            </button>
          </div>
        )}
      </div>
    );
  };

  // Componente Skeleton para loading
  const CommentSkeleton = () => (
    <div className="bg-white rounded-2xl p-4 mb-4 animate-pulse border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );

  const PostSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 mb-6 animate-pulse border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-48 bg-gray-200 rounded-lg"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-gray-600 hover:text-[var(--primary-color)] transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Voltar</span>
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900">Comentários</h1>
            </div>
            <div className="w-9"></div> {/* Espaço para alinhamento */}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-2xl mx-auto p-4 pb-32">
        {/* Post Principal */}
        <div className="mb-8">
          {postLoading ? (
            <PostSkeleton />
          ) : postError ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
              <div className="text-red-500 mb-3">
                <MessageCircle className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar post</h3>
              <p className="text-gray-600 mb-4">{postError}</p>
              <button
                onClick={fetchPost}
                className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Tentar Novamente
              </button>
            </div>
          ) : post ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* Header do Post */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img
                    src={post.author_avatar || "/perfilPadrao.jpg"}
                    alt={post.author_name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleUserClick(post.author_id)}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[var(--primary-color)] text-white p-1 rounded-full">
                    <User className="h-3 w-3" />
                  </div>
                </div>
                <div 
                  className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleUserClick(post.author_id)}
                >
                  <h3 className="font-semibold text-gray-900">{post.author_name}</h3>
                  <p className="text-sm text-gray-500">
                    @{post.author_username || post.author_name?.toLowerCase().replace(/\s+/g, '')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Conteúdo do Post */}
              <div className="mb-4">
                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Imagem do Post */}
              {post.image && (
                <div className="mb-4">
                  <img
                    src={post.image}
                    alt="Post"
                    className="rounded-xl w-full max-h-96 object-cover shadow-sm"
                  />
                </div>
              )}

              {/* Stats do Post */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleLike}
                  disabled={likesLoading}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {isLiked ? (
                    <Heart className="h-5 w-5 fill-red-600 text-red-600" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                  <span className="text-sm">{likesCount} curtidas</span>
                </button>
                <div className="flex items-center gap-2 text-[var(--primary-color)]">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{comments.length} comentários</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Post não encontrado</h3>
              <p className="text-gray-600">Esta publicação pode ter sido removida ou não existe mais.</p>
            </div>
          )}
        </div>

        {/* Seção de Comentários */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Comentários {comments.length > 0 && `(${comments.length})`}
            </h2>
          </div>

          {/* Estado de Loading dos Comentários */}
          {commentsLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <CommentSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Estado de Erro dos Comentários */}
          {commentsError && !commentsLoading && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
              <div className="text-red-500 mb-3">
                <MessageCircle className="h-12 w-12 mx-auto opacity-50" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar comentários</h3>
              <p className="text-gray-600 mb-4">{commentsError}</p>
              <button
                onClick={fetchComments}
                className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* Lista de Comentários */}
          {!commentsLoading && !commentsError && (
            <>
              {comments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum comentário ainda</h3>
                  <p className="text-gray-600 mb-4">Seja o primeiro a comentar esta publicação!</p>
                  <div className="w-12 h-1 bg-[var(--primary-color)] rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <img
                            src={comment.user_avatar || "/perfilPadrao.jpg"}
                            alt={comment.user_name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleUserClick(comment.user_id)}
                          />
                          <div 
                            className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleUserClick(comment.user_id)}
                          >
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 text-sm">{comment.user_name}</p>
                              {comment.user_id === user?.id && (
                                <span className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full">
                                  Você
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              @{comment.user_username || comment.user_name?.toLowerCase().replace(/\s+/g, '')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <CommentMenu 
                          comment={comment}
                          onEdit={() => {
                            setEditingComment(comment.id);
                            setEditText(comment.content);
                          }}
                          onDelete={() => handleDeleteComment(comment.id)}
                        />
                      </div>

                      {editingComment === comment.id ? (
                        <div className="mt-3 space-y-3">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none"
                            rows="3"
                            placeholder="Edite seu comentário..."
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingComment(null);
                                setEditText("");
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                            >
                              <Edit3 className="h-3 w-3" />
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-800 leading-relaxed">{comment.content}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Input de Comentário Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Digite seu comentário..."
                className="w-full border border-gray-300 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] resize-none transition-all"
                rows="1"
                style={{ minHeight: '60px', maxHeight: '120px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !loading) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <div className="absolute right-3 bottom-3">
                <button 
                  onClick={handleAddComment} 
                  disabled={loading || !newComment.trim()}
                  className={`p-2 rounded-full transition-all ${
                    !newComment.trim() || loading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[var(--primary-color)] text-white hover:shadow-lg transform hover:scale-105"
                  }`}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-right mt-2">
            <span className={`text-xs ${newComment.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
              {newComment.length}/500
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Perfil do Usuário */}
      {selectedUser && (
        <UserProfileModal
          userId={selectedUser}
          currentUser={user}
          onClose={() => setSelectedUser(null)}
          onFollowUpdate={() => {
            // Função vazia pois não precisamos atualizar nada aqui
          }}
        />
      )}
    </div>
  );
}