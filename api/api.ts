import axios from "axios";

interface IUserDataRegistration {
    email: string;
    password: string;
}

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

//transactions API

export const newPaymentApi = async (plan: string) => {
    return instance.post(`transaction/new_payment?plan=${plan}`);
};




