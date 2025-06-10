import axios from 'axios';

/**
 * Специальный axios-клиент для работы с refresh-токенами
 * Отличается от основного клиента:
 * 1. Не добавляет автоматически Authorization-заголовок
 * 2. Не перехватывает 401 ошибки (чтобы избежать рекурсии)
 * 3. Используется только для специфичных эндпоинтов (/auth/refresh)
 */
export const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-gpt.energy-cerber.ru/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Минимальные интерцепторы только для логирования
refreshClient.interceptors.request.use((config) => {
  console.debug('[RefreshClient] Request:', config.method?.toUpperCase(), config.url);
  return config;
});

refreshClient.interceptors.response.use(
  (response) => {
    console.debug('[RefreshClient] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error(
      '[RefreshClient] Error:',
      error.response?.status,
      error.config.url,
      error.message
    );
    return Promise.reject(error);
  }
);
