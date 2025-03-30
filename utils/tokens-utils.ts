import axios from "axios";


export const refreshAccess = async (refresh_token: string | null): Promise<string> => {
    try {
        const response = await axios.post(
            `https://api-gpt.energy-cerber.ru/user/refresh`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${refresh_token}`,
                },
            }
        );

        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("isAuthenticated", "true");

        return response.data.access_token;
    } catch (error) {
        console.error("Refresh token failed:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("isAuthenticated");
        return "";
    }
};

const isTokenExpired = (token: string): boolean => {
    try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        const expiresAt = payload.exp * 1000;
        return Date.now() >= expiresAt;
    } catch (error) {
        console.error("Error parsing JWT:", error);
        return true;
    }
};

export const getAccess = async (
    accessToken: string | null,
    refreshToken: string | null
): Promise<string> => {
    if (!accessToken) {
        if (!refreshToken) return "";
        return await refreshAccess(refreshToken);
    }

    if (!isTokenExpired(accessToken)) {
        return accessToken;
    }

    if (!refreshToken) return "";
    return await refreshAccess(refreshToken);
};

