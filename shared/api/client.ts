
import axios from 'axios';

// Базовый клиент
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-gpt.energy-cerber.ru/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Клиент для refresh-токенов (без автоматического добавления auth-заголовков)
export const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-gpt.energy-cerber.ru/',
  headers: {
    'Content-Type': 'application/json'
  }
});