import { apiClient } from '@/shared/api';

export const handleSubmitFeedbackApi = async (name: string, message: string, formData: FormData) => {
    return apiClient.post(`user/feedback?name=${encodeURIComponent(name)}&message=${encodeURIComponent(message)}`, 
    formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(response => {
        return response;
    })
}