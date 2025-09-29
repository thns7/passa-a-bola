'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Save, MapPin, User, Mail } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";

const API_BASE_URL = "https://passa-a-bola.onrender.com";

export default function EditarPerfilPage() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(3);
  const [saving, setSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    location: "",
    avatar: ""
  });

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || "",
        username: parsedUser.username || "",
        email: parsedUser.email || "",
        bio: parsedUser.bio || "",
        location: parsedUser.location || "",
        avatar: parsedUser.avatar || ""
      });
      setPreviewAvatar(parsedUser.avatar || "/perfilPadrao.jpg");
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setPreviewAvatar(base64Image);
        setFormData(prev => ({
          ...prev,
          avatar: base64Image
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        alert("Perfil atualizado com sucesso!");
        router.push("/perfil");
      } else {
        const errorData = await res.json();
        alert("Erro ao atualizar perfil: " + errorData.detail);
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Erro de conexão ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      <div className="md:hidden">
        <div className="w-full mx-auto min-h-screen">
          <div className="bg-[var(--primary-color)] pt-6 pb-8 px-4">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => router.back()}
                className="text-white p-2 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-white">Editar Perfil</h1>
            </div>
          </div>

          <div className="px-4 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={previewAvatar}
                    alt="Foto de perfil"
                    className="h-32 w-32 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                  <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-[var(--primary-color)] text-white p-2 rounded-full cursor-pointer hover:[var(--primary-color)] transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 text-[var(--primary-color)]" />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="h-4 w-4 text-[var(--primary-color)]" />
                    Nome de Usuário
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                    placeholder="@seuusuario"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 text-[var(--primary-color)]" />
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 text-[var(--primary-color)]" />
                    Localização
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                    placeholder="Sua cidade, estado"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                    placeholder="Conte um pouco sobre você..."
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {formData.bio.length}/500 caracteres
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:[var(--primary-color)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <BottomNav activeIndex={active} onChange={setActive} />
        </div>
      </div>

      <div className="hidden md:block">
        <Header name={user.name || "Usuário"} />
        
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => router.back()}
              className="text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 flex justify-center">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={previewAvatar}
                        alt="Foto de perfil"
                        className="h-40 w-40 rounded-2xl border-4 border-white shadow-lg object-cover"
                      />
                      <label htmlFor="avatar-upload-desktop" className="absolute bottom-2 right-2 bg-[var(--primary-color)] text-white p-3 rounded-full cursor-pointer hover:[var(--primary-color)] transition-colors">
                        <Camera className="h-5 w-5" />
                        <input
                          id="avatar-upload-desktop"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Clique na câmera para alterar a foto</p>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome de Usuário
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                        placeholder="@seuusuario"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                      placeholder="Sua cidade, estado"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:[var(--primary-color)]"
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {formData.bio.length}/500 caracteres
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-8 py-3 bg-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:[var(--primary-color)] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}