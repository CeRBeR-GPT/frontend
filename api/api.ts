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

// User API
export const sendEmailCodeApi = async (email: string) => {
    return instance.get(`user/register/verify_code?email=${email}`);
};

export const verifyEmailCodeApi = async (email: string, code: string) => {
    return instance.post(`user/register/verify_code?email=${email}&code=${code}`);
};

export const registartionApi = async (userData: IUserDataRegistration) => {
    return instance.post(`/user/register`, userData);
};

export const handleSubmitFeedbackApi = async (name: string, message: string, formData: FormData) => {
    return instance.post(`user/feedback?name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        return response;
    })
}

export const loginApi = async (email: string, password: string) => {
    return instance.post(`user/login`, { email, password });
};

export const refreshApi = async (refresh_token: string | null) => {
    return refreshInstance.post(`user/refresh`, {}, {
        headers: {
            Authorization: `Bearer ${refresh_token}`
        }
    });
};

export const updatePasswordApi = async (newPassword: string) => {
    return instance.post(`user/edit_password?new_password=${newPassword}`);
};

export const getVerifyPasswordCodeApi = async () => {
    return instance.get(`user/secure_verify_code`);
};

export const VerifyPasswordCodeApi = async (email: string | undefined, code: string) => {
    return instance.post(`user/secure_verify_code?email=${email}&code=${code}`);
};

export const getUserDataApi = async () => {
    return instance.get(`user/self`);
};