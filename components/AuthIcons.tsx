"use client"

import { Button } from "@/components/ui/button"
import { GoogleIcon } from "./ui/GoogleIcon";
import { YandexIcon } from "./ui/YandexIcon";
import { GitHubIcon } from "./ui/GitHubIcon";

export const AuthIcons = (props: { setError: (arg0: string) => void; }) => {

    const handleSocialLogin = async (provider: "google" | "yandex" | "github") => {
        try {
          window.location.href = `https://api-gpt.energy-cerber.ru/auth/${provider}`;
        } catch (error) {
          console.error(`${provider} login error:`, error);
          props.setError(`Произошла ошибка при входе через ${provider}. Пожалуйста, попробуйте снова.`);
        }
    };

    return(
        <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("google")}>
                <GoogleIcon/>
                Google
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("yandex")}>
                <YandexIcon/>
                Яндекс
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleSocialLogin("github")}>
                <GitHubIcon/>
                GitHub
              </Button>
        </div>
    )
}