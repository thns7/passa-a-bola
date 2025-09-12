"use client";

import { useRouter } from "next/navigation";
import Button from "./Button";
import TextLink from "./TextLink";

const CardSection = ({ 
  title, 
  description, 
  showRegisterLogin = false, 
  children,
  size = "sm"
}) => {
  const router = useRouter();

  const sizeClasses = {
    sm: "h-[42%] rounded-tr-[40%]",
    base: "h-[50%] rounded-tr-[30%]",
    lg: "h-[65%] rounded-tr-[20%]",
  };

  return (
    <div
      className={`
        bg-white p-6 shadow-lg flex flex-col justify-evenly
        md:static md:shadow-none md:p-0
        ${sizeClasses[size]} md:h-auto md:rounded-none
        absolute left-0 right-0 bottom-0
      `}
    >
      <div>
        {title && <h1 className="text-4xl font-semibold mb-4">{title}</h1>}
        {description && (
          <p className="text-[#949494] text-sm md:text-base">{description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-6">
        {children}

        {showRegisterLogin && (
          <>
            <Button size="lg" onClick={() => router.push("/register")}>
              Registrar
            </Button>
            <TextLink className="text-left" onClick={() => router.push("/login")}>Login</TextLink>
          </>
        )}
      </div>
    </div>
  );
};

export default CardSection;
