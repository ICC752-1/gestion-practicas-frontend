import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { authService } from "../../services/authService";

export default function ActivateAccountPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");

        if (!token) {
            setError("El enlace de activación no es válido o está incompleto.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setLoading(true);
        try {
            await authService.activateAccount(token, newPassword);
            setMessage("Cuenta activada. Ya puedes iniciar sesión con tu nueva contraseña.");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                err.response?.data?.detail
                || "No se pudo activar la cuenta. El enlace puede estar vencido o ya usado."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#f3f3f3]">
            <Header />
            <main className="flex flex-grow items-center justify-center px-6 py-16">
                <section className="w-full max-w-xl rounded-[32px] bg-white p-10 shadow-[0px_4px_30px_#00000025]">
                    <h1 className="mb-4 text-3xl font-bold text-[#8B1D46]">
                        Activar cuenta
                    </h1>
                    <p className="mb-8 text-base leading-7 text-gray-600">
                        Define tu contraseña para activar la cuenta creada por el equipo
                        administrativo.
                    </p>

                    {!token && (
                        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                            El enlace no contiene un token de activación válido.
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label
                                htmlFor="activation-new-password"
                                className="mb-2 block text-lg font-bold text-gray-900"
                            >
                                Nueva contraseña
                            </label>
                            <input
                                id="activation-new-password"
                                type="password"
                                minLength="8"
                                required
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                className="h-14 w-full rounded-2xl border border-gray-300 px-4 text-lg outline-none focus:border-[#d22864]"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="activation-confirm-password"
                                className="mb-2 block text-lg font-bold text-gray-900"
                            >
                                Confirmar contraseña
                            </label>
                            <input
                                id="activation-confirm-password"
                                type="password"
                                minLength="8"
                                required
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                className="h-14 w-full rounded-2xl border border-gray-300 px-4 text-lg outline-none focus:border-[#d22864]"
                                placeholder="Repite la contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !token}
                            className="h-14 w-full rounded-2xl bg-[#d22864] px-5 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? "Activando..." : "Activar cuenta"}
                        </button>
                    </form>

                    <Link
                        to="/login"
                        className="mt-8 block text-center font-semibold text-[#8B1D46] hover:underline"
                    >
                        Ir al inicio de sesión
                    </Link>
                </section>
            </main>
            <Footer />
        </div>
    );
}
