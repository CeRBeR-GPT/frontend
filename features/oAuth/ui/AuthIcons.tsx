"use client"

import { Button } from "@/shared/ui/ui/button"
import { GoogleIcon } from "../../../shared/ui/ui/GoogleIcon";
import { YandexIcon } from "../../../shared/ui/ui/YandexIcon";
import { GitHubIcon } from "../../../shared/ui/ui/GitHubIcon";
import { useOAuth } from "@/features/oAuth/model/use-oAuth";

export const AuthIcons = () => {
    const { handleSocialLogin } = useOAuth()

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