import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { authService } from "../../services/authService";
import { getOAuthErrorMessage } from "../../services/oauthErrors";
import {
    getRedirectPathForRoles,
    normalizeRoleNames,
} from "../../services/roleRouting";
import ficaLogo from "../../assets/logo_fica.jpg";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");
  const [oauthError, setOauthError] = useState(() => {
      const oauthErrorCode = new URLSearchParams(window.location.search)
          .get("oauth_error");
      return oauthErrorCode ? getOAuthErrorMessage(oauthErrorCode) : "";
  });
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const handleSubmit = async (event) => {
      event.preventDefault();
      setOauthError("");
      try {
          const user = await login(email, password);
          const roles = normalizeRoleNames(user.roles || []);
          console.log("[DEBUG_LOG] Roles detectados en Login:", roles);
          navigate(getRedirectPathForRoles(roles));
      } catch (err) {
          if (err.response?.data?.detail === "TEMPORARY_PASSWORD_CHANGE_REQUIRED") {
              setRequiresPasswordChange(true);
              setPasswordChangeMessage("");
              return;
          }
          console.error(err);
      }
  };

  const handleTemporaryPasswordChange = async (event) => {
      event.preventDefault();
      setOauthError("");
      setPasswordChangeMessage("");
      if (newPassword !== confirmPassword) {
          setPasswordChangeMessage("Las contraseñas no coinciden.");
          return;
      }
      try {
          await authService.completeTemporaryPassword(email, password, newPassword);
          setRequiresPasswordChange(false);
          setPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordChangeMessage("Contraseña definida. Inicia sesión con tu nueva contraseña.");
      } catch (err) {
          setPasswordChangeMessage(
              err.response?.data?.detail || "No se pudo definir la contraseña definitiva."
          );
      }
  };

  const handleGoogleLogin = () => {
      setOauthError("");
      window.location.assign(authService.getGoogleLoginUrl());
  };

  return (
    <div className="bg-[#f3f3f3] w-full min-h-screen flex flex-col relative overflow-x-hidden">
      <Header />

      <div className="max-w-7xl mx-auto py-3 px-6 w-full">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-[#d22864] font-semibold hover:underline text-2xl"
        >
          ←
        </button>
      </div>

      <main className="flex-1 flex items-center justify-center py-6 px-4 w-full">
        <section
          id="inicio-sesion"
          className="flex flex-col w-full max-w-[480px] items-center gap-5 px-6 sm:px-10 py-8 bg-[#f4f4f4] rounded-[32px] shadow-[0px_4px_25px_#00000030]"
          aria-labelledby="login-title"
        >
          <img
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain rounded-full shadow-sm"
            alt="Universidad de La Frontera"
            src={ficaLogo}
          />

          <form
            onSubmit={requiresPasswordChange ? handleTemporaryPasswordChange : handleSubmit}
            className="flex flex-col items-start gap-5 w-full"
          >
            {requiresPasswordChange && (
              <div className="w-full rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                La credencial temporal es de un solo uso. Define una contraseña definitiva para habilitar tu cuenta.
              </div>
            )}
            {!requiresPasswordChange && passwordChangeMessage && (
              <div className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                {passwordChangeMessage}
              </div>
            )}

            <div className="flex flex-col items-start gap-5 w-full">
              {/* Email */}
              <div className="flex flex-col items-start gap-2 w-full">
                <label htmlFor="email" id="login-title" className="font-bold text-black text-lg">
                  Correo electrónico
                </label>
                <div className="flex h-12 items-center gap-2 px-4 w-full bg-white rounded-[16px] border border-[#a1a1a1]">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 6.75C4 5.7835 4.7835 5 5.75 5H18.25C19.2165 5 20 5.7835 20 6.75V17.25C20 18.2165 19.2165 19 18.25 19H5.75C4.7835 19 4 18.2165 4 17.25V6.75Z" stroke="#777777" strokeWidth="1.8"/>
                    <path d="M5 7L11.1056 11.274C11.6538 11.6577 12.3462 11.6577 12.8944 11.274L19 7" stroke="#777777" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    id="email" name="email" type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="CorreoElectronico@ufromail.cl"
                    className="flex-1 h-full text-sm text-[#666666] placeholder:text-[#666666] bg-transparent outline-none"
                    aria-label="Correo electrónico"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col items-start gap-2 w-full">
                <label htmlFor="password" className="font-bold text-black text-lg">
                  {requiresPasswordChange ? "Credencial temporal" : "Contraseña"}
                </label>
                <div className="flex h-12 items-center gap-2 px-4 w-full bg-white rounded-[16px] border border-[#a1a1a1]">
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 10V7.75C8 5.67893 9.67893 4 11.75 4H12.25C14.3211 4 16 5.67893 16 7.75V10" stroke="#777777" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M6.75 10H17.25C17.9404 10 18.5 10.5596 18.5 11.25V18C18.5 18.6904 17.9404 19.25 17.25 19.25H6.75C6.05964 19.25 5.5 18.6904 5.5 18V11.25C5.5 10.5596 6.05964 10 6.75 10Z" fill="#777777" stroke="#777777" strokeWidth="1"/>
                  </svg>
                  <input
                    id="password" name="password" type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="relative min-w-0 flex-1 h-full font-normal text-[#666666] text-[20px] tracking-[4px] placeholder:text-[#666666] bg-transparent outline-none border-none focus:ring-0"
                    aria-label="Contraseña"
                  />
                </div>
                {(oauthError || error || (requiresPasswordChange && passwordChangeMessage)) && (
                  <div className="text-red-500 text-xs mt-1">
                    {oauthError || (requiresPasswordChange && passwordChangeMessage) || error}
                  </div>
                )}
              </div>

              {/* Cambio de Contraseña Temporal */}
              {requiresPasswordChange && (
                <div className="flex flex-col items-start gap-2 w-full">
                  <label htmlFor="new-password" className="font-bold text-black text-lg">
                    Nueva contraseña
                  </label>
                  <input
                    id="new-password" type="password" required minLength="8"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Nueva contraseña"
                    className="flex h-12 w-full rounded-[16px] border border-solid border-[#a1a1a1] bg-white px-4 text-sm text-[#666666] outline-none"
                  />
                  <input
                    type="password" required minLength="8"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Confirmar nueva contraseña"
                    className="flex h-12 w-full rounded-[16px] border border-solid border-[#a1a1a1] bg-white px-4 text-sm text-[#666666] outline-none"
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#d22864] rounded-[16px] font-bold text-white text-base hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
            >
              {loading ? "Procesando..." : requiresPasswordChange ? "Definir contraseña" : "Iniciar Sesión"}
            </button>

            {!requiresPasswordChange && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-[16px] hover:bg-gray-50 transition-colors"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
                <span className="font-bold text-gray-700 text-base">Continuar con Google</span>
              </button>
            )}

            <a href="#" className="w-full text-center text-black text-sm hover:underline mt-1">
              ¿Olvidaste tu contraseña?
            </a>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Login;