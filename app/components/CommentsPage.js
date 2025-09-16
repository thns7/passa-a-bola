"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CommentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const postId = searchParams.get("id");

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(() => {
    if (typeof window !== "undefined" && postId) {
      const saved = localStorage.getItem(`comments_${postId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const s = localStorage.getItem("currentUser");
    if (s) {
      try { setUser(JSON.parse(s)); } catch { setUser(null); }
    }

    if (!postId) return;

    const sPosts = localStorage.getItem("posts");
    if (sPosts) {
      try {
        const all = JSON.parse(sPosts);
        const found = all.find(p => String(p.id) === String(postId));
        setPost(found ?? null);
      } catch { setPost(null); }
    } else setPost(null);

    const sComments = localStorage.getItem(`comments_${postId}`);
    if (sComments) {
      try { setComments(JSON.parse(sComments)); } catch { setComments([]); }
    } else setComments([]);
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    try { localStorage.setItem(`comments_${postId}`, JSON.stringify(comments)); } catch (e) { console.error(e); }
  }, [comments, postId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const c = {
      id: Date.now(),
      author: user?.name ?? "Usuário",
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    const newArr = [...comments, c];
    setComments(newArr);
    localStorage.setItem(`comments_${postId}`, JSON.stringify(newArr));
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 ">
      <button onClick={() => router.back()} className="text-[var(--primary-color)] mb-4">← Voltar</button>

      {post ? (
        <div className="bg-white p-4 rounded-lg shadow mb-4  ">
          <p className="text-sm text-gray-500 font-semibold">{post.author}</p>
          <p className="mb-2 break-words break-all overflow-hidden">{post.text}</p>
          {post.image && <img src={post.image} alt="Post" className="rounded-lg max-h-60 object-cover" />}
        </div>
      ) : (
        <p className="mb-4 text-gray-600">Publicação não encontrada (ou foi removida).</p>
      )}

      <h2 className="text-xl font-bold mb-4 ">Comentários</h2>

      {comments.length === 0 && <p>Seja o primeiro a comentar!</p>}

      {comments.map((c) => (
        <div key={c.id} className="bg-white p-3 rounded mb-2 shadow animate-duration-400 animate-fade-down">
          <p className="text-sm text-gray-500 ">{c.author}</p>
          <p>{c.text}</p>
        </div>
      ))}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Digite seu comentário..."
          className="flex-1 border rounded p-2"
        />
        <button onClick={handleAddComment} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded">Enviar</button>
      </div>
    </div>
  );
}