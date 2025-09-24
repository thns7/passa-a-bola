"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Script from "next/script";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";

export default function HomePage() {
  const [active, setActive] = useState(2);
  const [activeSection, setActiveSection] = useState("feed");
  const [posts, setPosts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("posts");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const MAX_POST_LENGTH = 150;

  const loadUser = () => {
    const s = localStorage.getItem("currentUser");
    if (s) {
      try {
        setUser(JSON.parse(s));
      } catch {
        setUser(null);
      }
    }
  };

  const loadPosts = () => {
    const s = localStorage.getItem("posts");
    if (s) {
      try {
        const parsed = JSON.parse(s);
        setPosts(Array.isArray(parsed) ? parsed : []);
      } catch {
        setPosts([]);
      }
    } else {
      setPosts([]);
    }
  };

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser));
      } catch {
        setUser(null);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (pathname === "/") {
      loadUser();
      loadPosts();
    }
  }, [pathname]);

  useEffect(() => {
    try {
      localStorage.setItem("posts", JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  const handleCreatePost = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!newPostText.trim()) return;

    const newPost = {
      id: Date.now(),
      author: currentUser?.name ?? "Usuário",
      text: newPostText.trim(),
      image: newPostImage,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
    };

    const newPosts = [newPost, ...posts];
    setPosts(newPosts);
    localStorage.setItem("posts", JSON.stringify(newPosts));
    setNewPostText("");
    setNewPostImage(null);
    setShowPostModal(false);
  };

  const handleLike = (postId) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return;

    const newPosts = posts.map((post) => {
      if (post.id === postId) {
        const alreadyLiked = post.likedBy?.includes(currentUser.name);
        const updatedLikedBy = alreadyLiked
          ? post.likedBy.filter((u) => u !== currentUser.name)
          : [...(post.likedBy || []), currentUser.name];

        return { ...post, likedBy: updatedLikedBy, likes: updatedLikedBy.length };
      }
      return post;
    });

    setPosts(newPosts);
    localStorage.setItem("posts", JSON.stringify(newPosts));
  };

  const getCommentsCount = (postId) => {
    const s = localStorage.getItem(`comments_${postId}`);
    if (!s) return 0;
    try {
      const arr = JSON.parse(s);
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  };

  return (
    <div className="bg-[#F0F0F0] min-h-screen flex flex-col">

      {/* Script global do AdSense */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6447246104244403"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {!user ? (
        <div className="flex items-center justify-center h-screen">
          Carregando...
        </div>
      ) : (
        <>
          <header className="md:hidden flex justify-between mt-10 md:mt-[5vh] ml-[6vw] mr-[4vh]">
            <h1 className="flex text-[6vw]">Comunidade</h1>
            <img
              src="/svgs/tabler_plus.svg"
              alt="+"
              className="h-6 mt-2 cursor-pointer"
              onClick={() => setShowPostModal(true)}
            />
          </header>

          <div className="hidden md:block">
            <Header name={user.name || "Usuário"} />
          </div>

          <section className="mt-0 p-4 w-full">
            <div className="flex mb-4">
              <button
                onClick={() => setActiveSection("feed")}
                className={`m-auto w-40 h-10 ${
                  activeSection === "feed" ? "border-b text-[var(--primary-color)]" : ""
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveSection("amigos")}
                className={`m-auto w-40 h-10 ${
                  activeSection === "amigos" ? "border-b text-[var(--primary-color)]" : ""
                }`}
              >
                Amigos
              </button>
            </div>

            <div className="max-w-md m-auto rounded p-5 pb-25 animate-duration-400 animate-fade-down">
              {activeSection === "feed" && (
                <div>
                  {posts.length === 0 && <p>Nenhuma publicação ainda...</p>}
                  {posts.map((post, index) => (
                    <div key={post.id}>
                      <div
                        className="mb-4 p-4 bg-white rounded-xl shadow cursor-pointer"
                        onClick={() => router.push(`/comments?id=${post.id}`)}
                      >
                        <p className="text-sm text-gray-500 font-semibold">{post.author}</p>
                        <p className="mb-2 break-words break-all overflow-hidden">{post.text}</p>

                        {post.image && (
                          <img
                            src={post.image}
                            alt="Post"
                            className="max-w-md m-auto rounded-lg max-h-60 object-cover mb-2"
                          />
                        )}

                        <div className="flex gap-4 items-center text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id);
                            }}
                            className="flex items-center gap-1 focus:outline-none"
                          >
                            {post.likedBy?.includes(user.name) ? (
                              <span className="text-red-600 text-xl">❤️</span>
                            ) : (
                              <span className="text-gray-400 text-xl">🤍</span>
                            )}
                            <span>{post.likes || 0}</span>
                          </button>
                          <span className="text-gray-500">
                            💬 {getCommentsCount(post.id)} comentários
                          </span>
                        </div>
                      </div>

                      {/* Inserir AdSense a cada 3 posts */}
                      {index % 3 === 2 && (
                        <div className="my-4">
                          <ins
                            className="adsbygoogle"
                            style={{ display: "block" }}
                            data-ad-client="ca-pub-6447246104244403"
                            data-ad-slot="1234567890" // substitua pelo seu bloco
                            data-ad-format="auto"
                            data-full-width-responsive="true"
                          ></ins>
                          <Script id={`adsense-${post.id}`} strategy="afterInteractive">
                            {`(adsbygoogle = window.adsbygoogle || []).push({});`}
                          </Script>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeSection === "amigos" && <p>Lista de amigos aparece aqui...</p>}
            </div>
          </section>

          {showPostModal && (
            <div className="fixed inset-0 bg-[var(--black-opacity)] flex justify-center items-center">
              <div className="bg-white p-6 rounded-2xl w-11/12 max-w-md">
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
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setNewPostImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <p className="text-sm text-gray-400 mb-3">
                  {newPostText.length}/{MAX_POST_LENGTH} caracteres
                </p>
                {newPostImage && (
                  <img
                    src={newPostImage}
                    alt="Prévia"
                    className="rounded-lg max-h-40 object-cover mt-3"
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
                    className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg"
                  >
                    Publicar
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
            <BottomNav activeIndex={active} onChange={setActive} />
          </div>
        </>
      )}
    </div>
  );
}
