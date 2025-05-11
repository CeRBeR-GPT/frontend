"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOAuth } from "@/features/oAuth/model/use-oAuth";

const AuthSuccess = () => {
    const router = useRouter();
    const { handleAuthSuccess } = useOAuth()

    useEffect(() => {
        handleAuthSuccess().then((result) => {
            if (result.success) {
                router.push(`/chat/${result.lastChatId}`);
            } else {
                router.push("/");
            }
        });
    }, [router, handleAuthSuccess]);
    

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