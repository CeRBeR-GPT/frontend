

import { useAuth } from "@/features/auth/model/use-auth";
import Cookies from "js-cookie";
import { useLoginForm } from "@/features/auth/model/use-login-form";
import { useRouter } from "next/navigation";
import { getChatAllApi } from "@/entities/chat/model/api";

export const useOAuth = () => {
    const { setError } = useLoginForm()
    const { setIsAuthenticated } = useAuth()
    const router = useRouter();

    const success = () => {
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        return {success: true, lastChatId: "1"}
    }

    const handleSocialLogin = async (provider: "google" | "yandex" | "github") => {
        try {
          window.location.href = `https://api-gpt.energy-cerber.ru/auth/${provider}`;
        } catch (error) {
          setError(`Произошла ошибка при входе через ${provider}. Пожалуйста, попробуйте снова.`);
        }
    };

    const handleAuthSuccess = async () => {
        const accessToken = Cookies.get("access_token");
        const refreshToken = Cookies.get("refresh_token");

        if (!accessToken || !refreshToken) {
            router.push("/");
            return { success: false };
        }

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("isAuthenticated", "true");

        Cookies.remove("access_token");
        Cookies.remove("refresh_token");

        try {
            const lastSavedChat = localStorage.getItem("lastSavedChat");
            let welcomeChatId = "1";

            if (!lastSavedChat) {
                const chatResponse = await getChatAllApi();
                if (chatResponse.data?.length > 0) {
                    welcomeChatId = chatResponse.data[0].id;
                    localStorage.setItem("lastSavedChat", welcomeChatId);
                }
            }

            const lastChatId = lastSavedChat || welcomeChatId;
            setIsAuthenticated(true);

            return { success: true, lastChatId };
        } catch (error) {
            router.push("/");
            return { success: false };
        }
    };


  return { handleSocialLogin, success, handleAuthSuccess };
};
