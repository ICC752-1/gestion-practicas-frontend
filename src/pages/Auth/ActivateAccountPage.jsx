import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Footer } from "../../components/Footer/Footer";
import { Header } from "../../components/Header/Header";
import { authService } from "../../services/authService";

const STUDENT_ROLE_NAME = "Estudiante";

const getActivationErrorMessage = (error, fallback) => {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
        return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
        const field = detail[0]?.loc?.at(-1);
        if (field === "phone") {
            return "Ingresa un teléfono válido de 9 dígitos.";
        }
        return detail[0]?.msg?.replace(/^Value error,\s*/i, "") || fallback;
    }

    return fallback;
};

export default function ActivateAccountPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || "";
    const [accountInfo, setAccountInfo] = useState(null);
    const [loadingAccount, setLoadingAccount] = useState(Boolean(token));
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const isStudent = accountInfo?.roles?.includes(STUDENT_ROLE_NAME) || false;

    useEffect(() => {
        let ignore = false;

        const loadActivationInfo = async () => {
            if (!token) {
                setLoadingAccount(false);
                return;
            }

            setLoadingAccount(true);
            setError("");

            try {
                const info = await authService.getActivationInfo(token);
                if (!ignore) {
                    setAccountInfo(info);
                    setPhone(info.phone || "");
                    setGender(info.sexo === "No definido" ? "" : (info.sexo || ""));
                }
            } catch (err) {
                if (!ignore) {
                    setError(getActivationErrorMessage(
                        err,
                        "No se pudo validar el enlace de activación.",
                    ));
                }
            } finally {
                if (!ignore) {
                    setLoadingAccount(false);
                }
            }
        };

        loadActivationInfo();

        return () => {
            ignore = true;
        };
    }, [token]);

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
            await authService.activateAccount(
                token,
                newPassword,
                {
                    phone: phone.trim() || undefined,
                    sexo: gender || undefined,
                },
            );
            setMessage("Cuenta activada. Ya puedes iniciar sesión con tu nueva contraseña.");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(getActivationErrorMessage(
                err,
                "No se pudo activar la cuenta. El enlace puede estar vencido o ya usado.",
            ));
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

                    {loadingAccount && (
                        <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-600">
                            Validando enlace de activación...
                        </div>
                    )}

                    {accountInfo && (
                        <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-600">
                            <p className="font-bold text-gray-900">
                                {accountInfo.first_name} {accountInfo.last_name}
                            </p>
                            <p>{accountInfo.email}</p>
                            {isStudent && accountInfo.enrollment && (
                                <p className="mt-2 font-semibold text-gray-700">
                                    Matrícula: {accountInfo.enrollment}
                                </p>
                            )}
                            {isStudent && accountInfo.admission_year && (
                                <p className="font-semibold text-gray-700">
                                    Año de ingreso: {accountInfo.admission_year}
                                </p>
                            )}
                        </div>
                    )}

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

                        <div className="border-t border-gray-100 pt-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Datos personales opcionales
                            </h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Puedes completarlos ahora o actualizarlos más adelante.
                            </p>
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="activation-phone"
                                        className="mb-2 block text-sm font-bold text-gray-800"
                                    >
                                        Teléfono
                                    </label>
                                    <input
                                        id="activation-phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-gray-300 px-4 outline-none focus:border-[#d22864]"
                                        placeholder="Ej: 912345678"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="activation-gender"
                                        className="mb-2 block text-sm font-bold text-gray-800"
                                    >
                                        Género
                                    </label>
                                    <select
                                        id="activation-gender"
                                        value={gender}
                                        onChange={(event) => setGender(event.target.value)}
                                        className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 outline-none focus:border-[#d22864]"
                                    >
                                        <option value="">Prefiero completarlo después</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Otro">Otro</option>
                                        <option value="No definido">No definido</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || loadingAccount || !token || Boolean(error && !accountInfo)}
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
