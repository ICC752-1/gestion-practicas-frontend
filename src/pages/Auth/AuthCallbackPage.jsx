import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { getRedirectPathForRoles } from "../../services/roleRouting";

export default function AuthCallbackPage() {

    const navigate = useNavigate();
    const { handleOAuthCallback } = useAuth();

    useEffect(() => {

        const processLogin = async () => {

            try {
                const user = await handleOAuthCallback();

                navigate(
                    getRedirectPathForRoles(user.roles || []),
                    { replace: true },
                );

            }
            catch (error) {
                const errorCode = error?.code || "invalid_callback";
                navigate(
                    `/login?oauth_error=${encodeURIComponent(errorCode)}`,
                    { replace: true },
                );
            }
        };

        processLogin();

    }, [handleOAuthCallback, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            Procesando inicio de sesión...
        </div>
    );
}
