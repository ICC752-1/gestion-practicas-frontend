import { ArrowRight, ShieldAlert } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getRedirectPathForRoles } from "../services/roleRouting";

const AccessDenied = ({ roles }) => {
    const redirectPath = getRedirectPathForRoles(roles);

    return (
        <div className="min-h-screen bg-gray-50 px-6 py-16 flex items-center justify-center">
            <section className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                    <ShieldAlert size={28} />
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-red-500">
                    Acceso denegado
                </p>
                <h1 className="mt-3 text-2xl font-black text-gray-900">
                    Tu rol no permite abrir esta vista
                </h1>
                <p className="mt-3 text-sm font-medium text-gray-500">
                    Ingresa desde el panel correspondiente a tu sesión.
                </p>
                <Link
                    to={redirectPath}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#d22864] px-5 py-3 text-sm font-bold text-white hover:bg-[#b01e52]"
                >
                    Ir a mi panel
                    <ArrowRight size={16} />
                </Link>
            </section>
        </div>
    );
};

export const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Cargando...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const userRoles = user?.roles || [];
    const hasAllowedRole = allowedRoles.length === 0
        || allowedRoles.some((role) => userRoles.includes(role));

    if (!hasAllowedRole) {
        return <AccessDenied roles={userRoles} />;
    }

    return children;
};
