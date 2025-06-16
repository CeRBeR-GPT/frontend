import { z } from 'zod';

export const formSchema = z.object({
  email: z.string().email({ message: 'Пожалуйста, введите корректный email' }),
  password: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
});

export type AuthSchemaType = z.infer<typeof formSchema>;
