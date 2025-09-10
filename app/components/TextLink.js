const TextLink = ({ children, onClick }) => {
  return (
    <p
      onClick={onClick}
      className="text-[var(--primary-color)] font-medium text-center cursor-pointer mt-3"
    >
      {children}
    </p>
  );
};

export default TextLink