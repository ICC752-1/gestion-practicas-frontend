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

    async getActivationInfo(token) {
        const response = await api.get("/auth/activation-info", {
            params: { token },
        });

        return response.data;
    },

    async activateAccount(token, newPassword, admissionYear) {
        const payload = {
            token,
            new_password: newPassword,
        };

        if (admissionYear !== undefined) {
            payload.admission_year = admissionYear;
        }

        await api.post("/auth/activate-account", payload);
    },

    getGoogleLoginUrl() {
        return buildApiUrl("/auth/google/login");
    },
};
