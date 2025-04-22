
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

export const loginApi = async (email: string, password: string) => {
    return instance.post(`user/login`, {email, password}).then(response => {
        return response;
    })
}

// export const refreshApi = async () => {
//     return instance.post(`user/refresh`, {email, password}).then(response => {
//         return response;
//     })
// }

export const updatePasswordApi = async (newPassword: string) => {
    return instance.post(`user/edit_password?new_password=${newPassword}`).then(response => {
        return response;
    })
}

export const getVerifyPasswordCodeApi = async () => {
    return instance.get(`user/secure_verify_code`).then(response => {
        return response;
    })
}

export const VerifyPasswordCodeApi = async (email: string | undefined, code: string) => {
    return instance.post(`user/secure_verify_code?email=${email}&code=${code}`).then(response => {
        return response;
    })
}

export const getUserDataApi = async (email: string | undefined, code: string) => {
    return instance.get(`user/self`).then(response => {
        return response;
    })
}
