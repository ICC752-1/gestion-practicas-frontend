import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import ficaLogo from "../../assets/logo_fica.jpg";
import { Header } from "../Header/Header";
import { Footer } from "../Footer/Footer";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
    const {
        login,
        loading,
        error
    } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {

            const user = await login(email, password);

            const roles = user.roles || [];

            if (roles.includes("Estudiante")) {
                navigate("/dashboard");

            } else if (
                roles.includes("Encargado de práctica")
            ) {
                navigate("/coordinador");

            } else {
                navigate("/supervisor");
            }

        } catch (err) {
            console.error(err);
        }
    };

  return (
    <div className="bg-[#f3f3f3] w-full min-h-screen flex flex-col relative overflow-x-hidden">
      <Header />
      <main className="flex-grow flex items-center justify-center py-16 w-full">
        <section
          id="inicio-sesion"
          className="flex flex-col w-[604px] items-center gap-[30px] px-20 py-10 bg-[#f4f4f4] rounded-[40px] shadow-[0px_4px_30px_#00000040]"
          aria-labelledby="login-title"
        >
          <img
            className="relative w-[200px] h-[200px] object-contain rounded-full shadow-md"
            alt="Universidad de La Frontera"
            src={ficaLogo}
          />
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-start gap-9 relative self-stretch w-full flex-[0_0_auto]"
          >
            <div className="flex flex-col items-start gap-[50px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <label
                  htmlFor="email"
                  id="login-title"
                  className="self-stretch font-bold text-black text-[32px] relative mt-[-1.00px] tracking-[0] leading-[normal]"
                >
                  Correo electrónico
                </label>
                <div className="flex h-[65px] items-center gap-2 px-5 py-2.5 relative self-stretch w-full bg-white rounded-[20px] border border-solid border-[#a1a1a1]">
                  <div className="relative flex h-9 w-[38px] items-center justify-center">
                    <svg
                      className="w-[26px] h-[26px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6.75C4 5.7835 4.7835 5 5.75 5H18.25C19.2165 5 20 5.7835 20 6.75V17.25C20 18.2165 19.2165 19 18.25 19H5.75C4.7835 19 4 18.2165 4 17.25V6.75Z"
                        stroke="#777777"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M5 7L11.1056 11.274C11.6538 11.6577 12.3462 11.6577 12.8944 11.274L19 7"
                        stroke="#777777"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="CorreoElectronico@ufromail.cl"
                    className="relative flex-1 h-full font-normal text-[#666666] text-xl tracking-[0] leading-[normal] placeholder:text-[#666666] bg-transparent outline-none border-none focus:ring-0"
                    aria-label="Correo electrónico"
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
                <label
                  htmlFor="password"
                  className="relative self-stretch mt-[-1.00px] font-bold text-black text-[32px] tracking-[0] leading-[normal]"
                >
                  Contraseña
                </label>
                <div className="flex h-[65px] items-center gap-2 px-5 py-2.5 relative self-stretch w-full bg-white rounded-[20px] border border-solid border-[#a1a1a1]">
                  <div className="relative flex h-9 w-[38px] items-center justify-center">
                    <svg
                      className="w-[24px] h-[24px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M8 10V7.75C8 5.67893 9.67893 4 11.75 4H12.25C14.3211 4 16 5.67893 16 7.75V10"
                        stroke="#777777"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.75 10H17.25C17.9404 10 18.5 10.5596 18.5 11.25V18C18.5 18.6904 17.9404 19.25 17.25 19.25H6.75C6.05964 19.25 5.5 18.6904 5.5 18V11.25C5.5 10.5596 6.05964 10 6.75 10Z"
                        fill="#777777"
                        stroke="#777777"
                        strokeWidth="1"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••"
                    className="relative flex-1 h-full font-normal text-[#666666] text-[28px] tracking-[6px] leading-[normal] placeholder:text-[#666666] bg-transparent outline-none border-none focus:ring-0"
                    aria-label="Contraseña"
                  />
                </div>
                  {
                      error && (
                          <div className="text-red-500 text-sm mt-2">
                              {error}
                          </div>
                      )
                  }
              </div>
            </div>
              <button
                  type="submit"
                  disabled={loading}
                  className="flex w-[444px] h-16 items-center justify-center gap-2.5 p-2.5 relative bg-[#d22864] rounded-[20px] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
  <span className="relative w-fit font-bold text-white text-2xl tracking-[0] leading-[normal]">
    {loading ? "Ingresando..." : "Iniciar Sesión"}
  </span>
              </button>
            <a
              href="#"
              className="relative w-[444px] h-[29px] font-normal text-black text-2xl text-center tracking-[0] leading-[normal] hover:underline"
            >
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
