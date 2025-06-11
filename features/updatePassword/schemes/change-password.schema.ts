import { z } from 'zod';

export const formSchema = z
  .object({
    newPassword: z.string().min(6, { message: 'Пароль должен содержать минимум 6 символов' }),
    confirmPassword: z.string().min(6, { message: 'Пароли не совпадают' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export type ChangePasswordSchemaType = z.infer<typeof formSchema>;
