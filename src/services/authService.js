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

    async logout() {
        const refreshToken = localStorage.getItem("refresh_token");
        const payload = refreshToken ? { refresh_token: refreshToken } : {};

        try {
            await api.post("/auth/logout", payload);
        } catch {
            // El cierre local debe completarse aunque el token ya no sea valido.
        }

        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
    },

    async completeTemporaryPassword(email, temporaryPassword, newPassword) {
        await api.post("/auth/complete-temporary-password", {
            email,
            temporary_password: temporaryPassword,
            new_password: newPassword,
        });
    },

    getGoogleLoginUrl() {
        return buildApiUrl("/auth/google/login");
    },
};
