'use client'

import { useState } from "react"
import BottomNav from "../components/BottomNav"
import Header from "../components/Header"
import MatchCard from "../components/MatchCard"
import NextMatchCard from "../components/NextMatch"
import TextLink from "../components/TextLink"
import TituloAlt from "../components/TituloAlt"

export default function HomePage(){
    const [active, setActive] = useState(0)

    return(
        <div className="bg-[#F0F0F0] h-screen">
            <Header name="Thiago" />
            <main className="max-w-[23.75rem] mx-auto px-4">
                <TituloAlt titulo="Ao vivo"/>
                <MatchCard
                    campeonato="Brasileirão Feminino"
                    timeCasa="Corinthians"
                    timeVisitante="São Paulo"
                    logoCasa="/corinthians.png"
                    logoVisitante="/spfc.png"
                    placarCasa={0}
                    placarVisitante={3}
                    tempo="76’"
                />
                <div className="flex justify-between">
                    <TituloAlt titulo="Partidas"/>
                    <TextLink><p className="my-3">Ver todos</p></TextLink> 
                </div>
                <NextMatchCard
                    timeCasa="Flamengo"
                    timeVisitante="Fluminense"
                    logoCasa="/flamengo.png"
                    logoVisitante="/fluminense.png"
                    hora="18:00"
                    data="14 de maio"
                />
                <NextMatchCard
                    timeCasa="Flamengo"
                    timeVisitante="Fluminense"
                    logoCasa="/flamengo.png"
                    logoVisitante="/fluminense.png"
                    hora="18:00"
                    data="14 de maio"
                />
                <NextMatchCard
                    timeCasa="Flamengo"
                    timeVisitante="Fluminense"
                    logoCasa="/flamengo.png"
                    logoVisitante="/fluminense.png"
                    hora="18:00"
                    data="14 de maio"
                />
                <TituloAlt titulo="Principais Noticias"/>
            </main>
            <BottomNav activeIndex={active} onChange={setActive} />   
        </div>
    )
}
