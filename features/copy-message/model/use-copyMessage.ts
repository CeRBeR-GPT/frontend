import { useCallback, useState } from 'react';

import { useToast } from '@/shared/hooks';

export const useCopyMessage = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const handleCopyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: 'Код скопирован',
      description: 'Код был успешно скопирован в буфер обмена.',
    });
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const handleCopyTextMarkdown = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Текст скопирован',
      description: 'Текст скопирован в буфер обмена.',
    });
  }, []);

  return { handleCopyCode, handleCopyTextMarkdown, copiedCode };
};
