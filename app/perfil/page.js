'use client'

import Image from 'next/image'
import { PencilIcon } from 'lucide-react'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PerfilPage() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) setUser(JSON.parse(currentUser));
        else router.push("/login");
    }, [router]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                Carregando...
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-[#F0F0F0] h-screen overflow-hidden">
            <header className="relative h-70">
                <img
                    src="/svgs/headerPerfil.svg"
                    alt="Header background"
                    className="absolute top-0 left-0 object-cover"
                />
                <div className="absolute top-4 right-4 text-white cursor-pointer">
                    <PencilIcon className="h-6 w-6" />
                </div>
            </header>

            <div className="flex gap-5 absolute top-20 left-6 items-center">
                <img src="/perfilPadrao.jpg" alt="" className="h-24 rounded-full" />
                <div>
                    <h1 className="text-2xl">{user.name || "Usuário"}</h1>
                    <h2 className="text-[var(--primary-color)] text-[1rem]">
                        {user.name.toLowerCase() + "_"}
                    </h2>
                </div>
            </div>

            
            <div class="bio-jogadora">
  <p>
    Sou Luana Nascimento, tenho 23 anos e desde muito nova encontrei no futebol
    mais do que uma paixão, encontrei um propósito. Cresci em uma comunidade
    onde as oportunidades são poucas, mas a vontade de vencer é imensa...
  </p>

  <p>
    <strong>E-mail:</strong>
    <a href="mailto:jogadoraluana@time.com.br">jogadoraluana@time.com.br</a>
  </p>
</div>
        </div>
    );
}
