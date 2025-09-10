"use client";

export default function AuthForm({ onSubmit, children }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 w-full">
      {children}
    </form>
  );
}
