'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";

export default function PerfilPage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(3);
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setUser(parsedUser);

      const userPosts = JSON.parse(localStorage.getItem("posts")) || [];
      setPosts(userPosts.filter((p) => p.userId === parsedUser.id));
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      {/* Mobile */}
      <div className="flex md:hidden">
        <div className="w-full mx-auto bg-[#F0F0F0] min-h-screen">
          
          <header className="relative h-[140px] animate-duration-400 animate-fade-down">
            <img
              src="/svgs/headerPerfil.svg"
              alt="Header background"
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
            
            <div
              className="absolute top-4 right-4 text-white cursor-pointer"
              onClick={() => router.push("/editar-perfil")}
            >
              <MoreHorizontal className="h-6 w-6" />
            </div>

            
            <div className="absolute left-7 bottom-[-62px] flex items-center gap-4">
              <img
                src={user.avatar || "/perfilPadrao.jpg"}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-full border-4 border-white object-cover"
              />
              <div>
                <h1 className="text-xl font-semibold drop-shadow">
                  {user.name || "Usuário"}
                </h1>
                <h2 className="text-[#5f2e8c80] text-sm">
                  {user.username || user.name?.toLowerCase() + "_"}
                </h2>
                <p className="text-sm text-gray-400">
                  {user.location || "Sua localização"}
                </p>
              </div>
            </div>
          </header>

          {/* Bio */}
          <div className="px-6 mt-20 text-sm text-gray-700 leading-relaxed">
            <p>{user.bio || "Adicione sua bio aqui..."}</p>

            <div className="mt-3">
              <p className="text-gray-500">
                <strong className="text-gray-700">E-mail:</strong>{" "}
                <a
                  href={`mailto:${user.email || "seuemail@dominio.com"}`}
                  className="text-gray-400"
                >
                  {user.email || "seuemail@dominio.com"}
                </a>
              </p>
            </div>
          </div>

          
          <div className="px-4 py-5 mt-10 mb-20 border-t border-t-gray-400">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Posts</h3>
              <span className="text-gray-500 text-sm">{posts.length}</span>
            </div>

            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={index} className="break-words break-all overflow-hidden bg-white rounded-xl shadow p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar || "/perfilPadrao.jpg"}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <MoreHorizontal size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm mb-2">{post.text}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Imagem do post"
                      className="rounded-lg w-full object-cover"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center">
                Nenhum post ainda.
              </p>
            )}
          </div>

          
          <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
            <BottomNav activeIndex={active} onChange={setActive} />
          </div>
       </div>
      </div>
      {/* Desktop */}
      <div className="hidden md:flex">
      <div className="w-full mx-auto bg-[#F0F0F0] min-h-screen">
          
      <Header name={user.name || "Usuário"} />
    
      <div className="">
        <header className="relative h-[140px] animate-duration-400 animate-fade-down">    
              
              <div className="absolute left-7 bottom-[-62px] flex items-center gap-4">
                <img
                  src={user.avatar || "/perfilPadrao.jpg"}
                  alt="Foto de perfil"
                  className="h-24 w-24 rounded-full border-4 border-white object-cover"
                />
                
                <div>
                  <h1 className="text-xl font-semibold drop-shadow">
                    {user.name || "Usuário"}
                  </h1>
                  <div
                    className="text-black  cursor-pointer"
                    onClick={() => router.push("/editar-perfil")}
                  >
                    <p className="text-[var(--primary-color)]">Editar perfil</p>
                  </div>
                  <h2 className="text-[#5f2e8c80] text-sm">
                    {user.username || user.name?.toLowerCase() + "_"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {user.location || "Sua localização"}
                  </p>
                </div>
              </div>
            </header>

          {/* Bio */}
          <div className="px-6 mt-20 text-sm text-gray-700 leading-relaxed">
            <p>{user.bio || "Adicione sua bio aqui..."}</p>

            <div className="mt-3">
              <p className="text-gray-500">
                <strong className="text-gray-700">E-mail:</strong>{" "}
                <a
                  href={`mailto:${user.email || "seuemail@dominio.com"}`}
                  className="text-gray-400"
                >
                  {user.email || "seuemail@dominio.com"}
                </a>
              </p>
            </div>
          </div>

          
          <div className=" px-4 py-5 mt-10 mb-20 border-t border-t-gray-400">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Posts</h3>
              <span className="text-gray-500 text-sm">{posts.length}</span>
            </div>

            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={index} className="break-words break-all overflow-hidden max-w-md m-auto bg-white rounded-xl shadow p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar || "/perfilPadrao.jpg"}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <MoreHorizontal size={18} className="text-gray-400" />
                  </div>
                  <p className="text-sm mb-2">{post.text}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Imagem do post"
                      className="rounded-lg w-full object-cover"
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center">
                Nenhum post ainda.
              </p>
            )}
          </div>

          
          <div className="fixed bottom-0 left-0 w-full z-50 md:hidden">
            <BottomNav activeIndex={active} onChange={setActive} />
          </div>
        </div>
       </div>
      </div>
    </div>
  );
}
