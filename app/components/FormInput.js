"use client";

export default function FormInput({ label, type = "text", ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[#949494]">{label}</label>
      <input
        type={type}
        className="border border-[var(--primary-color)] p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
        required
        {...props}
      />
    </div>
  );
}
