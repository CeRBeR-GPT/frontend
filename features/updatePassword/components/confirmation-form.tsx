import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { useConfirmationForm } from '../hooks';

export const ConfirmationForm = () => {
  const { form, onSubmit, error, isSubmitting } = useConfirmationForm();
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Код подтверждения</FormLabel>
              <FormControl>
                <Input
                  placeholder="12345"
                  {...field}
                  maxLength={5}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {error && <div className="text-sm font-medium text-destructive">{error}</div>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Проверка...</span>
            </div>
          ) : (
            'Подтвердить'
          )}
        </Button>
      </form>
    </Form>
  );
};
