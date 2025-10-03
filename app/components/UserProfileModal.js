"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Calendar, Heart, UserCheck, UserPlus, Users, User, MessageCircle } from "lucide-react";

const API_BASE_URL = "https://passa-a-bola.onrender.com";

export default function UserProfileModal({ userId, currentUser, onClose, onFollowUpdate }) {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [nestedUser, setNestedUser] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      const userRes = await fetch(`${API_BASE_URL}/user/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      const postsRes = await fetch(`${API_BASE_URL}/posts`);
      if (postsRes.ok) {
        const allPosts = await postsRes.json();
        const userPostsData = allPosts.filter(post => post.user_id === userId)
          .map(post => ({
            id: post.id,
            text: post.content,
            image: post.image,
            likes: post.likes_count || 0,
            created_at: post.created_at,
            user_name: post.user_name,
            user_id: post.user_id
          }));
        setUserPosts(userPostsData);
      }

      if (currentUser) {
        const followRes = await fetch(`${API_BASE_URL}/user/${currentUser.id}/is_following/${userId}`);
        if (followRes.ok) {
          const followData = await followRes.json();
          setIsFollowing(followData.is_following);
        }

        const followersRes = await fetch(`${API_BASE_URL}/user/${userId}/followers`);
        if (followersRes.ok) {
          const followersData = await followersRes.json();
          setFollowers(followersData.followers || []);
          setFollowersCount(followersData.followers.length);
        }

        const followingRes = await fetch(`${API_BASE_URL}/user/${userId}/following`);
        if (followingRes.ok) {
          const followingData = await followingRes.json();
          setFollowing(followingData.following || []);
          setFollowingCount(followingData.following.length);
        }
      }

    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      if (isFollowing) {
        await fetch(`${API_BASE_URL}/unfollow/${currentUser.id}/${userId}`, {
          method: "DELETE"
        });
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await fetch(`${API_BASE_URL}/follow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            follower_id: currentUser.id,
            following_id: userId
          }),
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
      
      if (onFollowUpdate) {
        onFollowUpdate();
      }
    } catch (error) {
      console.error("Erro ao seguir/deixar de seguir:", error);
    }
  };

  const handleUserClick = async (clickedUserId) => {
    try {
      setNestedUser(clickedUserId);
      setShowFollowers(false);
      setShowFollowing(false);
    } catch (error) {
      console.error("Erro ao carregar perfil aninhado:", error);
    }
  };

  const handleBackFromNested = () => {
    setNestedUser(null);
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleBackFromComments = () => {
    setSelectedPost(null);
  };

  const FollowersModal = () => (
    <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Seguidores</h3>
            <button onClick={() => setShowFollowers(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
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
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(follower.id)}
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
                  <span className="text-[var(--primary-color)] text-xs">Ver perfil</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const FollowingModal = () => (
    <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Seguindo</h3>
            <button onClick={() => setShowFollowing(false)} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
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
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(followed.id)}
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
                  <span className="text-[var(--primary-color)] text-xs">Ver perfil</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Componente de Comentários (simplificado do CommentsPage)
  const CommentsSection = ({ post }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState("");

    useEffect(() => {
      if (post) {
        fetchComments();
      }
    }, [post]);

    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/comments/${post.id}`);
        if (res.ok) {
          const commentsData = await res.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
      }
    };

    const handleAddComment = async () => {
      if (!newComment.trim() || !currentUser || !post.id) return;

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: post.id,
            user_id: currentUser.id,
            content: newComment.trim()
          }),
        });

        if (res.ok) {
          setNewComment("");
          await fetchComments();
        }
      } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
      } finally {
        setLoading(false);
      }
    };

    const CommentMenu = ({ comment, onEdit, onDelete }) => {
      const [showMenu, setShowMenu] = useState(false);

      if (!currentUser || comment.user_id !== currentUser.id) return null;

      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-500 hover:text-gray-700 text-lg p-1"
          >
            ⋮
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
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

    return (
      <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-70 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <button 
                onClick={handleBackFromComments}
                className="text-[var(--primary-color)] hover:text-[var(--primary-color)] flex items-center gap-2"
              >
                ← Voltar
              </button>
              <h3 className="text-lg font-semibold">Comentários</h3>
              <button onClick={handleBackFromComments} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Post original */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={user?.avatar || "/perfilPadrao.jpg"}
                alt={post.user_name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{post.user_name}</p>
              </div>
            </div>
            <p className="text-gray-800 mb-3">{post.text}</p>
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="rounded-lg max-h-80 mx-auto items-center  mb-3"
              />
            )}
          </div>

          {/* Lista de comentários */}
          <div className="max-h-96 overflow-y-auto p-4">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Seja o primeiro a comentar!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <img
                          src={comment.user_avatar || "/perfilPadrao.jpg"}
                          alt={comment.user_name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{comment.user_name}</p>
                          <p className="text-xs text-gray-500">
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
                        onDelete={async () => {
                          if (confirm("Tem certeza que deseja excluir este comentário?")) {
                            try {
                              const res = await fetch(`${API_BASE_URL}/comments/${comment.id}`, {
                                method: "DELETE",
                              });
                              if (res.ok) {
                                await fetchComments();
                              }
                            } catch (error) {
                              console.error("Erro ao deletar comentário:", error);
                            }
                          }
                        }}
                      />
                    </div>

                    {editingComment === comment.id ? (
                      <div className="mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full border rounded p-2 mb-2 text-sm"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch(`${API_BASE_URL}/comments/${comment.id}`, {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ content: editText.trim() }),
                                });
                                if (res.ok) {
                                  setEditingComment(null);
                                  setEditText("");
                                  await fetchComments();
                                }
                              } catch (error) {
                                console.error("Erro ao editar comentário:", error);
                              }
                            }}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText("");
                            }}
                            className="px-3 py-1 bg-gray-300 rounded text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input de novo comentário */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Digite seu comentário..."
                className="flex-1 border rounded p-2 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleAddComment();
                  }
                }}
              />
              <button 
                onClick={handleAddComment} 
                disabled={loading || !newComment.trim()}
                className="bg-[var(--primary-color)] text-white px-4 py-2 rounded text-sm disabled:opacity-50 hover:bg-purple-700 transition-colors"
              >
                {loading ? "..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal aninhado para usuários
  const NestedUserModal = () => (
    <UserProfileModal
      userId={nestedUser}
      currentUser={currentUser}
      onClose={handleBackFromNested}
      onFollowUpdate={onFollowUpdate}
    />
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p>Usuário não encontrado</p>
          <button onClick={onClose} className="mt-4 text-[var(--primary-color)]">Fechar</button>
        </div>
      </div>
    );
  }

  // Se tiver um post selecionado, mostrar comentários
  if (selectedPost) {
    return <CommentsSection post={selectedPost} />;
  }

  // Se tiver um usuário aninhado selecionado, mostrar modal aninhado
  if (nestedUser) {
    return <NestedUserModal />;
  }

  return (
    <>
      <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="relative bg-[var(--primary-color)] p-7">
            <button
              onClick={onClose}
              className="absolute top-2 right-4 text-white p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <img
                src={user.avatar || "/perfilPadrao.jpg"}
                alt="Foto de perfil"
                className="h-20 w-20 rounded-2xl border-4 border-white object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-purple-200">@{user.username || user.name?.toLowerCase().replace(/\s+/g, '')}</p>
              </div>
              
              {currentUser && currentUser.id !== userId && (
                <button
                  onClick={handleFollow}
                  className={`cursor-pointer px-6 py-2 rounded-full font-medium transition-colors ${
                    isFollowing 
                      ? "bg-white text-[var(--primary-color)] hover:bg-gray-100" 
                      : "bg-purple-700 text-white hover-[var(--primary-color)]"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="h-4 w-4 inline mr-2" />
                      Seguindo
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 inline mr-2" />
                      Seguir
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{userPosts.length}</div>
                <div className="text-sm text-gray-500">Publicações</div>
              </div>
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowFollowers(true)}
              >
                <div className="text-2xl font-bold text-gray-900">{followersCount}</div>
                <div className="text-sm text-gray-500">Seguidores</div>
              </div>
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowFollowing(true)}
              >
                <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
                <div className="text-sm text-gray-500">Seguindo</div>
              </div>
            </div>

            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 max-h-96 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Publicações</h3>
              
              {userPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma publicação ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handlePostClick(post)}
                    >
                      <p className="text-gray-800 mb-3">{post.text}</p>
                      
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post"
                          className="rounded-lg max-h-80 mx-auto items-center  mb-3"
                        />
                      )}
                      
                      <div className="flex gap-4 items-center text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500 hover:text-[var(--primary-color)]">
                          <MessageCircle className="h-4 w-4" />
                          Comentarios
                        </span>
                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFollowers && <FollowersModal />}
      {showFollowing && <FollowingModal />}
    </>
  );
}