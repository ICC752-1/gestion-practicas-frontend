import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let refreshRequest = null;
const TOKEN_REFRESH_MARGIN_SECONDS = 30;

const getTokenExpiration = (token) => {
    try {
        const [, payload] = token.split(".");
        const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
        const decodedPayload = JSON.parse(window.atob(normalizedPayload));
        return decodedPayload.exp;
    } catch {
        return null;
    }
};

const shouldRefreshToken = (token) => {
    const expiration = getTokenExpiration(token);

    if (!expiration) {
        return false;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return expiration - nowInSeconds <= TOKEN_REFRESH_MARGIN_SECONDS;
};

const clearSessionAndRedirect = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");

    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
};

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    const payload = refreshToken ? { refresh_token: refreshToken } : {};

    if (!refreshRequest) {
        refreshRequest = axios
            .post(`${api.defaults.baseURL || ""}/auth/refresh`, payload, {
                withCredentials: true,
            })
            .then((response) => {
                localStorage.setItem("token", response.data.access_token);
                if (refreshToken && response.data.refresh_token) {
                    localStorage.setItem("refresh_token", response.data.refresh_token);
                }
                return response.data.access_token;
            })
            .finally(() => {
                refreshRequest = null;
            });
    }

    return refreshRequest;
};

api.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem("token");
        const requestUrl = config.url || "";
        const isAuthRequest = requestUrl.includes("/auth/login")
            || requestUrl.includes("/auth/refresh");

        if (token && !isAuthRequest && shouldRefreshToken(token)) {
            try {
                token = await refreshAccessToken();
            } catch {
                clearSessionAndRedirect();
                token = null;
                return config;
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl = originalRequest?.url || "";
        const canRefresh = !originalRequest?._retry
            && !requestUrl.includes("/auth/login")
            && !requestUrl.includes("/auth/refresh");

        if (error.response?.status === 401 && canRefresh) {
            originalRequest._retry = true;

            try {
                const newToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch {
                clearSessionAndRedirect();
            }
        }

        if (error.response?.status === 401) {
            clearSessionAndRedirect();
        }

        return Promise.reject(error);
    }
);

export default api;
