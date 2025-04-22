
import axios from "axios"

interface MyFormData {
    file?: File;
}

interface IUserDataRegistration {
    email: string;
    password: string;
}

const getToken = () => localStorage.getItem('access_token');

const instance = axios.create({
  baseURL: 'https://api-gpt.energy-cerber.ru/',
  headers: {
    ContentType: 'multipart/form-data',
    Authorization: `Bearer ${getToken()}`
  }
})

//User

export const sendEmailCodeApi = async (email: string) => {
    return instance.get(`user/register/verify_code?email=${email}`).then(response => {
        return response;
    })
}

export const verifyEmailCodeApi = async (email: string, code: string) => {
    return instance.post(`user/register/verify_code?email=${email}&code=${code}`).then(response => {
        return response;
    })
}

export const handleSubmitFeedbackApi = async (name: string, message: string, formData: FormData) => {
    return instance.post(`user/feedback?name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}`, formData).then(response => {
        return response;
    })
}

export const registartionApi = async (userData: IUserDataRegistration) => {
    return instance.post(`/user/register`, userData).then(response => {
        return response;
    })
}