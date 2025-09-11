const NextMatchCard = ({
  timeCasa,
  timeVisitante,
  logoCasa,
  logoVisitante,
  hora,
  data
}) => {
  return (
    <div className="rounded-2xl py-3 px-5 bg-white flex items-center justify-between mb-4">
      <div className="flex items-center">
        <img src={logoCasa} alt={timeCasa} className="w-8 h-8 object-contain" />
      </div>

      <div className="flex flex-col items-center">
        <span className="text-[var(--primary-color)] font-semibold">{hora}</span>
        <span className="text-[#A8C3E6] text-sm">{data}</span>
      </div>

      <div className="flex items-center">
        <img src={logoVisitante} alt={timeVisitante} className="w-8 h-8 object-contain" />
      </div>
    </div>
  )
}

export default NextMatchCard