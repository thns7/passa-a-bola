"use client"   // <<== IMPORTANTE PARA USAR useRouter

import { useRouter } from "next/navigation"  // note que no App Router é navigation, não router
import { Home, Trophy, Users, User } from "lucide-react"

const BottomNav = ({ activeIndex, onChange }) => {
  const router = useRouter()

  const items = [
      { icon: <Home size={24} />, label: "Home", href: "/" },
      { icon: <Trophy size={24} />, label: "Torneios", href: "/events" },
      { icon: <Users size={24} />, label: "Times", href: "/times" },
      { icon: <User size={24} />, label: "Perfil", href: "/perfil" },
  ]

  return (
    <div className="fixed bottom-5 left-0 w-full bg-white shadow-lg flex justify-around items-center h-16 rounded-[3rem]">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            onChange(index)
            router.push(item.href)
          }}
          className={`flex flex-col items-center text-sm transition ${
            activeIndex === index
              ? "text-[var(--primary-color)]"
              : "text-[#A8C3E6]"
          }`}
        >
          <div
            className={`${
              activeIndex === index
                ? "bg-white p-5 rounded-full shadow-md -mt-15"
                : ""
            }`}
          >
            {item.icon}
          </div>
        </button>
      ))}
    </div>
  )
}

export default BottomNav
