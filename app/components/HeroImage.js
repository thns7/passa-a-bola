const HeroImage = () => {
  return (
    <div className="relative h-screen bg-[var(--primary-color)] flex items-center justify-center">
      <img
        src="/player.png" 
        alt="Jogadora de futebol"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
};

export default HeroImage