"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";

const AuthSuccess = () => {
  const router = useRouter();
  const { login, success} = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {

      const accessToken = Cookies.get("access_token");
      const refreshToken = Cookies.get("refresh_token");

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem('isAuthenticated', 'true');

        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        try {
          const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const lastSavedChat = localStorage.getItem("lastSavedChat");
          const lastChatId = lastSavedChat || "1"

          const result = success()
          if (result.success) {
            router.push(`/chat/${lastChatId}`);
          } else {
            router.push("/");
          }

        } catch (error) {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    };

    handleAuthSuccess();
  }, [router, login]);

  return <div>Перенаправление...</div>;
};

export default AuthSuccess;