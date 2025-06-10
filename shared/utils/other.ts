import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatExpireDate = (dateString: any) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return format(date, 'd MMMM yyyy', { locale: ru });
  } catch (error) {
    return dateString;
  }
};
