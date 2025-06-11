import { fileExtensions } from '@/shared/const';

import { ToastFn } from '../types';

export const downloadCode = (code: string, language: string, toast: ToastFn) => {
  const extension = fileExtensions[language] || 'txt';

  const fileName = `code.${extension}`;

  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);

  toast({
    title: 'Файл скачан',
    description: `Код сохранен как ${fileName}`,
  });
};
