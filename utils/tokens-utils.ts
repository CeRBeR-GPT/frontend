import axios from "axios";

export const refreshAccess = async (refresh_token: string | null): Promise<string> => {
    try {
        const response = await axios.post(`https://api-gpt.energy-cerber.ru/user/refresh`, {}, {
            headers: {
                Authorization: `Bearer ${refresh_token}`,
            },
        })

        localStorage.setItem('access_token', response.data.access_token)
        localStorage.setItem('isAuthenticated', 'true')

        return response.data.access_token

    } catch (error) {
        console.error('Refresh token failed:', error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('isAuthenticated')
        return ""
    }
}

