const TextLink = ({ children, onClick }) => {
  return (
    <h3
      onClick={onClick}
      className="text-[var(--primary-color)] font-medium text-center cursor-pointer mt-3"
    >
      {children}
    </h3>
  );
};

export default TextLink