"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function EditarPerfil() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    location: "", // <-- adicionamos aqui
    bio: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsed = JSON.parse(currentUser);
      setUser(parsed);
      setForm({
        name: parsed.name || "",
        username: parsed.username || "",
        location: parsed.location || "", // <-- puxando do user
        bio: parsed.bio || "",
        email: parsed.email || "",
        password: parsed.password || "",
      });
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!user) return;

    const updatedUser = { ...user, ...form };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    router.push("/perfil");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#F0F0F0] min-h-screen pb-10">
      <div className="relative h-[180px] animate-duration-400 animate-fade-down">
        <img
          src="/svgs/headerPerfil.svg"
          alt="Header background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />

        
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        
        <div className="absolute left-1/2 -bottom-9 transform -translate-x-1/2">
          <img
            src={user.avatar || "/perfilPadrao.jpg"}
            alt="Foto de perfil"
            className="h-24 w-24 rounded-full border-4 border-white object-cover"
          />
        </div>
      </div>

      
      <div className="mt-16 px-6 space-y-6">
        <div>
          <label className="block text-sm text-gray-500 mb-1">Seu Nome</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent focus:outline-none py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Local</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)} // <-- agora salva no location
            className="w-full border-b border-gray-300 bg-transparent focus:outline-none py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Biografia</label>
          <input
            type="text"
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent focus:outline-none py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent focus:outline-none py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Senha</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full border-b border-gray-300 bg-transparent focus:outline-none py-2"
          />
        </div>

        
        <button
          onClick={handleSave}
          className="w-full bg-[var(--primary-color)] text-white py-3 rounded-lg mt-4"
        >
          Salvar
        </button>

        
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="w-40 bg-red-500 text-white py-2 rounded-lg"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
