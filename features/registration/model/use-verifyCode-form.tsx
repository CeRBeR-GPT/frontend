import { useEffect, useState } from "react";
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRegistration } from "./use-registration";
import { useRouter } from "next/navigation"
import { getChatAllApi } from "@/api/api";
import { useUser } from "@/shared/contexts/user-context";

const formSchema = z.object({
  code: z.string().min(5, { message: "Код должен содержать 5 цифр" }).max(5),
})

export const useVerifyCodeForm = () => {
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const { verifyEmailCode, verifyCode, registartion} = useRegistration()
    const { refreshUserData } = useUser()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          code: "",
        },
    })

    useEffect(() => {
        const savedEmail = localStorage.getItem("email")
        const savedPassword = localStorage.getItem("password")
        
        if (savedEmail && savedPassword) {
          setEmail(savedEmail)
          setPassword(savedPassword)
        } else {
          router.push("/auth/register")
        }
    }, [router])
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!email || !password) return

        const userData = { email, password };
        setIsSubmitting(true);
        setError("");
        try {
            const response = await verifyEmailCode(email, values.code);
            if (response.status === 200 || response.status === 201) {
            const registrationResponse = await registartion(userData);
            if (registrationResponse.status === 200 || registrationResponse.status === 201) {
                localStorage.setItem("access_token", registrationResponse.data.access_token);
                
                const result = await verifyCode(email, values.code, password);
                if (result.success) {
                    let welcomeChatId = "1"
                    localStorage.removeItem("email")
                    localStorage.removeItem("password")
                    
                    try {
                        const chatResponse = await getChatAllApi()
                        
                        if (chatResponse.data) {
                        welcomeChatId = chatResponse.data[0].id
                        localStorage.setItem("lastSavedChat", chatResponse.data[0].id);
                        }
                    } catch (error) {

                    }

                    await refreshUserData()
                    router.push(`/chat/${welcomeChatId}`);

                } else {
                    setError("Ошибка верификации кода.");
                }
            }
            }
        } catch (error) {
            setError("Произошла ошибка при проверке кода. Пожалуйста, попробуйте снова.");
        } finally {
            setIsSubmitting(false);
        }
    }

  return {
    form,
    onSubmit,
    error,
    isSubmitting,
    email
   };
};
