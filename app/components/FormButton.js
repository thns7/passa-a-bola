"use client";

export default function FormButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-[var(--primary-color)] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition w-full"
    >
      {children}
    </button>
  );
}
