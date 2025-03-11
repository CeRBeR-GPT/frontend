"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";

const AuthSuccess = () => {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      // Извлекаем токены из куки
      const accessToken = Cookies.get("access_token");
      const refreshToken = Cookies.get("refresh_token");

      console.log("tokens:", accessToken, refreshToken);

      if (accessToken && refreshToken) {
        // Сохраняем токены в localStorage
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        // Очищаем куки
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        try {
          // Получаем данные пользователя с сервера
          const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const userData = response.data; // Предположим, что сервер возвращает данные пользователя
          const email = userData.email; // Извлекаем email
          const password = userData.password; // Извлекаем пароль (если он есть)
          console.log("ПРОПРАЕНВЕНА",email, password)

          // Выполняем вход с использованием данных пользователя
          const result = await login(email, password);

          if (result.success) {
            // Перенаправляем на страницу чата
            router.push(`/chat/${result.lastChatId}`);
          } else {
            // Если вход не удался, перенаправляем на главную страницу
            router.push("/");
          }
        } catch (error) {
          console.error("Ошибка при получении данных пользователя:", error);
          router.push("/");
        }
      } else {
        // Если токены отсутствуют, перенаправляем на главную страницу
        router.push("/");
      }
    };

    handleAuthSuccess();
  }, [router, login]);

  return <div>Перенаправление...</div>;
};

export default AuthSuccess;