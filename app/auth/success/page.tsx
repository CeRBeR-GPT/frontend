"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AuthSuccess = () => {
  const router = useRouter();
    console.log("Hereee")
  useEffect(() => {
    const handleAuthSuccess = async () => {
      // Извлекаем токены из куки
      const accessToken = Cookies.get("access_token");
      const refreshToken = Cookies.get("refresh_token");
      
      console.log("tokens:", accessToken, refreshToken)
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("Kirill-token", "Kirill-token")

      if (accessToken && refreshToken) {
        // Сохраняем токены в localStorage

        // Очищаем куки
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        // Перенаправляем на /chat
        router.push("/chat");
      } else {
        // Если токены отсутствуют, перенаправляем на главную страницу
        router.push("/");
      }
    };

    handleAuthSuccess();
  }, [router]);

  return <div>Перенаправление...</div>;
};

export default AuthSuccess;