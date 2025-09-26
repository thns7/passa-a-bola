"use client";

export default function FormInput({ 
  label, 
  type = "text", 
  multiline = false,
  rows = 4,
  ...props 
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-[#949494]">{label}</label>
      {multiline ? (
        <textarea
          rows={rows}
          className="border border-[var(--primary-color)] p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] resize-y min-h-[100px]"
          required
          {...props}
        />
      ) : (
        <input
          type={type}
          className="border border-[var(--primary-color)] p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
          required
          {...props}
        />
      )}
    </div>
  );
}