"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";

const AuthSuccess = () => {
  const router = useRouter();
  const { login1} = useAuth();

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

        // setIsAuthenticated(true)
        // localStorage.setItem('isAuthenticated', 'true')

        try {
          const response = await axios.get(`https://api-gpt.energy-cerber.ru/user/self`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const userData = response.data;
          const email = userData.email;
          const password = userData.password;
          console.log(userData)

          const result = await login1(email, password);
          const lastSavedChat = localStorage.getItem("lastSavedChat");
          const lastChatId = lastSavedChat || "1"
          router.push(`/chat/${lastChatId}`);
          if (result.success === true) {
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
  }, [router, login1]);

  return <div>Перенаправление...</div>;
};

export default AuthSuccess;