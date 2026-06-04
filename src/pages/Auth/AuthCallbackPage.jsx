import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export default function AuthCallbackPage() {

    const navigate = useNavigate();
    const { handleOAuthCallback } = useAuth();

    useEffect(() => {

        const processLogin = async () => {

            try {
                const user = await handleOAuthCallback();

                const roles = user.roles || [];

                if (roles.includes("Estudiante")) {
                    navigate("/dashboard");
                }
                else if (
                    roles.includes("Encargado de practica") ||
                    roles.includes("Director de carrera") ||
                    roles.includes("Secretaria de Carrera")
                ) {
                    navigate("/coordinador");
                }
                else if (
                    roles.includes("Supervisor de practica")
                ) {
                    navigate("/supervisor");
                }

            }
            catch (error) {
                navigate("/login");
            }
        };

        processLogin();

    }, []);

    return (
        <div className="flex justify-center items-center h-screen">
            Procesando inicio de sesión...
        </div>
    );
}