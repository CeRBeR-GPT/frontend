import { z } from 'zod';

export const formSchema = z.object({
  code: z.string().min(5, { message: 'Код должен содержать 5 цифр' }).max(5),
});

export type ConfirmationSchemaType = z.infer<typeof formSchema>;
