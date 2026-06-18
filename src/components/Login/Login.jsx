import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { authService } from "../../services/authService";
import { getOAuthErrorMessage } from "../../services/oauthErrors";
import { getRedirectPathForRoles } from "../../services/roleRouting";
import ficaLogo from "../../assets/logo_fica.jpg";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [oauthError, setOauthError] = useState(() => {
      const oauthErrorCode = new URLSearchParams(window.location.search)
          .get("oauth_error");

      return oauthErrorCode ? getOAuthErrorMessage(oauthErrorCode) : "";
  });
  const navigate = useNavigate();
    const {
        login,
        loading,
        error
    } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setOauthError("");

        try {

            const user = await login(email, password);

            const roles = user.roles || [];
            console.log("[DEBUG_LOG] Roles detectados en Login:", roles);

            navigate(getRedirectPathForRoles(roles));

        } catch (err) {
            console.error(err);
        }
    };

    const handleGoogleLogin = () => {
        setOauthError("");
        window.location.assign(authService.getGoogleLoginUrl());
    };

  return (
    <div className="bg-[#f3f3f3] w-full min-h-screen flex flex-col relative overflow-x-hidden">
      <Header />
      <main className="flex-grow flex items-center justify-center py-10 w-full">
        <section
          id="inicio-sesion"
          className="flex flex-col w-full max-w-[540px] items-center gap-6 px-8 sm:px-16 py-8 bg-[#f4f4f4] rounded-[40px] shadow-[0px_4px_30px_#00000040] mx-4"
          aria-labelledby="login-title"
        >
          <img
            className="w-32 h-32 sm:w-44 sm:h-44 object-contain rounded-full shadow-md"
            alt="Universidad de La Frontera"
            src={ficaLogo}
          />
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-start gap-6 w-full"
          >
            <div className="flex flex-col items-start gap-8 w-full">
              {/* Email */}
              <div className="flex flex-col items-start gap-3 w-full">
                <label htmlFor="email" id="login-title"
                  className="font-bold text-black text-2xl">
                  Correo electrónico
                </label>
                <div className="flex h-14 items-center gap-2 px-4 w-full bg-white rounded-[20px] border border-[#a1a1a1]">
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 6.75C4 5.7835 4.7835 5 5.75 5H18.25C19.2165 5 20 5.7835 20 6.75V17.25C20 18.2165 19.2165 19 18.25 19H5.75C4.7835 19 4 18.2165 4 17.25V6.75Z" stroke="#777777" strokeWidth="1.8"/>
                    <path d="M5 7L11.1056 11.274C11.6538 11.6577 12.3462 11.6577 12.8944 11.274L19 7" stroke="#777777" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    id="email" name="email" type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="CorreoElectronico@ufromail.cl"
                    className="flex-1 h-full text-base text-[#666666] placeholder:text-[#666666] bg-transparent outline-none"
                    aria-label="Correo electrónico"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="flex flex-col items-start gap-3 w-full">
                <label htmlFor="password"
                  className="font-bold text-black text-2xl">
                  Contraseña
                </label>
                <div className="flex h-14 items-center gap-2 px-4 w-full bg-white rounded-[20px] border border-[#a1a1a1]">
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M8 10V7.75C8 5.67893 9.67893 4 11.75 4H12.25C14.3211 4 16 5.67893 16 7.75V10" stroke="#777777" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M6.75 10H17.25C17.9404 10 18.5 10.5596 18.5 11.25V18C18.5 18.6904 17.9404 19.25 17.25 19.25H6.75C6.05964 19.25 5.5 18.6904 5.5 18V11.25C5.5 10.5596 6.05964 10 6.75 10Z" fill="#777777" stroke="#777777" strokeWidth="1"/>
                  </svg>
                  <input
                    id="password" name="password" type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="flex-1 h-full text-[#666666] text-2xl tracking-[6px] bg-transparent outline-none"
                    aria-label="Contraseña"
                  />
                </div>
                {(oauthError || error) && (
                  <div className="text-red-500 text-sm mt-1">{oauthError || error}</div>
                )}
              </div>
            </div>

            {/* Botones */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#d22864] rounded-[20px] font-bold text-white text-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-[20px] hover:bg-gray-50 transition-colors"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
              <span className="font-bold text-gray-700 text-lg">Continuar con Google</span>
            </button>

            <a href="#"
              className="w-full text-center text-black text-lg hover:underline">
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
