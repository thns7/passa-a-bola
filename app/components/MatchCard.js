const MatchCard = ({
  campeonato,
  timeCasa,
  timeVisitante,
  logoCasa,
  logoVisitante,
  placarCasa,
  placarVisitante,
  tempo
}) => {
  return (
    <div className="rounded-2xl shadow-md p-5 bg-white">
      <h2 className="text-center">{campeonato}</h2>
      
      <div className="flex justify-between items-center mt-4">
        <div className="flex flex-col items-center">
          <img src={logoCasa} alt={timeCasa} className="w-16 h-16 object-contain"/>
          <span className="mt-2">{timeCasa}</span>
          <span className="text-[#A8C3E6] text-sm">Casa</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-3xl">
            {placarCasa} : {placarVisitante}
          </span>
          <span className="mt-2 bg-gray-200 px-3 py-1 rounded-full text-sm">{tempo}</span>
        </div>
        <div className="flex flex-col items-center">
          <img src={logoVisitante} alt={timeVisitante} className="w-16 h-16 object-contain"/>
          <span className="mt-2">{timeVisitante}</span>
          <span className="text-[#A8C3E6] text-sm">Visitante</span>
        </div>
      </div>
    </div>
  )
}

export default MatchCard
