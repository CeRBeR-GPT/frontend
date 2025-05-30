import axios from "axios";

const instance = axios.create({
    baseURL: 'https://api-gpt.energy-cerber.ru/',
    headers: {
        'Content-Type': 'application/json'
    }
});

const refreshInstance = axios.create({
    baseURL: 'https://api-gpt.energy-cerber.ru/',
    headers: {
        'Content-Type': 'application/json'
    }
});

instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem('access_token');
};

// User API

export const refreshApi = async (refresh_token: string | null) => {
    return refreshInstance.post(`user/refresh`, {}, {
        headers: {
            Authorization: `Bearer ${refresh_token}`
        }
    });
};


// chat API

export const createChatApi = async (chatName: string) => {
    return instance.post(`chat/new?name=${chatName}`);
};

export const getChatAllApi = async () => {
    return instance.get(`chat/all`);
};

export const getChatByIdApi = async (id: string) => {
    return instance.get(`chat/${id}`);
};