import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { VerifyPasswordCodeApi } from "./api";
import { useState } from "react";
import { useUserData } from "@/entities/user/model/use-user";
import { useUpdatePassword } from "./use-updatePassword";
import { useRouter } from "next/navigation"

export const formSchema = z.object({
  code: z.string().min(5, { message: "Код должен содержать 5 цифр" }).max(5),
})

export const useConfirmationForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const { userData } = useUserData()
    const { updatePassword } = useUpdatePassword()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        code: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        setError("");
        const email = userData?.email
        try {
            const response = await VerifyPasswordCodeApi(email, values.code)
            if (response.status === 200 || response.status === 201) {
                const newPassword = localStorage.getItem("new_password")
                if (newPassword !== null){
                    try {
                        const result = await updatePassword(newPassword)
                        if ( result !== undefined && result.success) {
                            setTimeout(() => {
                            router.push("/profile")
                            }, 2000)
                        }
                    } catch (error) {
                    } finally {
                        setIsSubmitting(false)
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
        isSubmitting,
        error,
        setError
    };
};