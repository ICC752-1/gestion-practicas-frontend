import api from "./api";

const buildApiUrl = (path) => {
    const baseUrl = api.defaults.baseURL || "";

    if (!baseUrl) {
        return path;
    }

    return `${baseUrl.replace(/\/+$/, "")}${path}`;
};

export const authService = {
    async login(email, password) {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        return response.data;
    },

    async getMe() {
        const response = await api.get("/auth/me");
        return response.data;
    },

    logout() {
        localStorage.removeItem("token");
    },

    getGoogleLoginUrl() {
        return buildApiUrl("/auth/google/login");
    },
};
