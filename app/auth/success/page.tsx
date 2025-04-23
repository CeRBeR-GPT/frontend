"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/use-auth";
import axios from "axios";
import { getChatAllApi } from "@/api/api";

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
          const lastSavedChat = localStorage.getItem("lastSavedChat");
          let welcomeChatId = "1"
          if (!lastSavedChat) {
            try {
              const chatResponse = await getChatAllApi()
              if (chatResponse.data){
                welcomeChatId = chatResponse.data[0].id
                localStorage.setItem("lastSavedChat", chatResponse.data[0].id);
              }
            } catch (error) {
            }

          }
          const lastChatId = lastSavedChat || welcomeChatId

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto border-t-4 border-b-4 border-emerald-500 rounded-full animate-spin"></div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Авторизация успешна</h1>
        <p className="text-gray-600 mb-4">Перенаправление в личный кабинет...</p>
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full animate-pulse" style={{ width: "75%" }}></div>
        </div>
      </div>
    </div>
  )
};

export default AuthSuccess;