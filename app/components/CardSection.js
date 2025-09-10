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
    <div className={`absolute left-0 right-0 bottom-0 bg-white p-6 shadow-lg flex flex-col justify-evenly ${sizeClasses[size]}`}>
      <div>
        <h1 className="text-4xl font-semibold mb-5">{title}</h1>
        {description && (
          <p className="text-[#949494] text-sm">{description}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {children}

        {showRegisterLogin && (
          <>
            <Button size="lg" onClick={() => router.push("/register")}>
              Registrar
            </Button>
            <TextLink onClick={() => router.push("/login")}>Login</TextLink>
          </>
        )}
      </div>
    </div>
  );
};

export default CardSection;
