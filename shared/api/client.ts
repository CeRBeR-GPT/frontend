
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-gpt.energy-cerber.ru/',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api-gpt.energy-cerber.ru/',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
      config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const refreshApi = async (refresh_token: string | null) => {
    return refreshClient.post(`user/refresh`, {}, {
        headers: {
            Authorization: `Bearer ${refresh_token}`
        }
    });
};