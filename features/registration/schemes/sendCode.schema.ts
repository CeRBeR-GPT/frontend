import { z } from 'zod';

export const formSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Пожалуйста, введите корректный email' })
      .refine((email) => !email.endsWith('@mail.ru'), {
        message: 'Регистрация с @mail.ru временно недоступна',
      }),
    password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
    confirmPassword: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type sendCodeSchemaType = z.infer<typeof formSchema>;
