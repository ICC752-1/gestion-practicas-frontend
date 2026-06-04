import {
    useEffect,
    useState,
} from "react";

import { authService } from "../services/authService";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAuthenticated = !!user;

    useEffect(() => {
        const restoreSession = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const userData = await authService.getMe();
                setUser(userData);
            } catch {
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, [token]);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const data = await authService.login(email, password);

            localStorage.setItem("token", data.access_token);

            setToken(data.access_token);

            const userData = await authService.getMe();

            setUser(userData);

            return userData;
        } catch (err) {
            if (err.response?.status === 401) {
                setError("Credenciales inválidas");
            } else if (!err.response) {
                setError("Servidor no disponible");
            } else {
                setError("Error al iniciar sesión");
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authService.logout();

        setUser(null);
        setToken(null);

        window.location.href = "/landing";
    };

    const handleOAuthCallback = async () => {

        const params = new URLSearchParams(window.location.search);

        const accessToken = params.get("token");

        if (!accessToken) {
            throw new Error("No se recibió un token.");
        }

        localStorage.setItem("token", accessToken);
        setToken(accessToken);

        const userData = await authService.getMe();

        setUser(userData);

        return userData;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                error,
                login,
                logout,
                handleOAuthCallback
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
