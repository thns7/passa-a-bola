"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`);
      if (res.ok) {
        const postData = await res.json();
        setPost(postData);
      }
    } catch (error) {
      console.error("Erro ao buscar post:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/comments/${postId}`);
      if (res.ok) {
        const commentsData = await res.json();
        setComments(commentsData);
      }
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
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
      }
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
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
      }
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
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
      }
    } catch (error) {
      console.error("Erro ao deletar comentário:", error);
    }
  };

  // Componente do Menu Hamburguer para comentários
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
    <div className="min-h-screen mx-auto bg-gray-100 p-4 pb-25">
      <button onClick={() => router.back()} className="text-[var(--primary-color)] mb-4">← Voltar</button>

      {post ? (
        <div className="max-w-md m-auto bg-white p-4 rounded-lg shadow mb-4">
          <p className="text-sm text-gray-500 font-semibold">{post.user_name}</p>
          <p className="mb-2 break-words">{post.content}</p>
          {post.image && <img src={post.image} alt="Post" className="rounded-lg object-cover" />}
        </div>
      ) : (
        <p className="mb-4 text-gray-600">Publicação não encontrada (ou foi removida).</p>
      )}
      
      <div className="flex">
        <h2 className="text-xl mx-auto font-bold mb-4">Comentários</h2>
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Seja o primeiro a comentar!</p>
        </div>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="break-words max-w-md m-auto bg-white p-3 rounded mb-2 shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1">
              <img
                src={comment.user_avatar || "/perfilPadrao.jpg"}
                alt={comment.user_name}
                className="h-8 w-8 rounded-full object-cover"
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
              onDelete={() => handleDeleteComment(comment.id)}
            />
          </div>

          {editingComment === comment.id ? (
            <div className="mt-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full border rounded p-2 mb-2 text-sm"
                rows="3"
                placeholder="Edite seu comentário..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditComment(comment.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditText("");
                  }}
                  className="px-3 py-1 bg-gray-300 rounded text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800">{comment.content}</p>
          )}
        </div>
      ))}

      <div className="mt-4 flex gap-2 max-w-md m-auto">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Digite seu comentário..."
          className="flex-1 border rounded p-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !loading) {
              handleAddComment();
            }
          }}
        />
        <button 
          onClick={handleAddComment} 
          disabled={loading || !newComment.trim()}
          className="bg-[var(--primary-color)] text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-opacity-90 transition-colors"
        >
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}