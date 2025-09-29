"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Calendar, Heart, UserCheck, UserPlus, Users, User } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

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
            created_at: post.created_at
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
                <div key={follower.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                <div key={followed.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p>Usuário não encontrado</p>
          <button onClick={onClose} className="mt-4 text-purple-600">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-[#0000006d] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
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
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    isFollowing 
                      ? "bg-white text-purple-600 hover:bg-gray-100" 
                      : "bg-purple-500 text-white hover:bg-purple-600"
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
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Membro desde 2024</span>
              </div>
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
                    <div key={post.id} className="bg-gray-50 rounded-xl p-4">
                      <p className="text-gray-800 mb-3">{post.text}</p>
                      
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post"
                          className="rounded-lg w-full h-48 object-cover mb-3"
                        />
                      )}
                      
                      <div className="flex gap-4 items-center text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likes}
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