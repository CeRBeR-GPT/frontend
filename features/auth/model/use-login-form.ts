'use client';

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuth } from "@/features/auth/model/use-auth";
import { useRouter } from "next/navigation";
import { useUser } from "@/shared/contexts/user-context";

const formSchema = z.object({
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  password: z.string().min(6, { message: "Пароль должен содержать минимум 6 символов" }),
});

export const useLoginForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError("");
    form.clearErrors();

    try {
      const result = await login(values.email, values.password);
      
      if (result.success) {
        const lastSavedChat = localStorage.getItem("lastSavedChat") || "1";
        // router.push(`/chat/${lastSavedChat}`);
        window.location.href = `/chat/${lastSavedChat}`;
      } else {
        setError("Неверный email или пароль");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Неизвестная ошибка");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    error,
    showPassword,
    setShowPassword,
    setError
  };
};