const Button = ({ children, onClick, size = "base" }) => {
  
  const sizeClasses = {
    sm: "text-sm py-1",
    base: "text-base py-2",
    lg: "text-[1.3rem] py-3",
  };

  return (
      <button
        onClick={onClick}
        className={`w-full bg-[var(--primary-color)] text-white 
          rounded-[1rem] transform transition-transform duration-300 ease-out 
          hover:-translate-y-1 hover:shadow-xl ${sizeClasses[size]}`}
      >
        {children}
      </button>
  );
};

export default Button;