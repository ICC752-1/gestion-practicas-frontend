import universityLogo from "../../assets/university_logo.webp";
import { Link } from "react-router-dom";

export const Header = () => {
  const navItems = [
    { label: "Preguntas Frecuentes", to: "/faq", active: false },
    { label: "Requisitos", to: "#", active: false },
    { label: "Iniciar Sesión", to: "/login", active: true },
  ];

  return (
    <header className="flex w-full items-center justify-between px-10 h-20 bg-white border-b-[3px] border-[#b13168] z-10 shadow-sm relative">
      <div className="flex items-center gap-4">
        <img
          className="w-16 h-16 object-contain p-1.5 bg-[#b13168] rounded-xl shadow-sm"
          alt="Logo personal para médico azul rojo"
          src={universityLogo}
        />
        <div className="flex flex-col items-start gap-0.5">
          <p className="font-bold text-[#b13168] text-xl tracking-[0] leading-[normal] whitespace-nowrap">
            Sistema de Gestión de Prácticas
          </p>
          <p className="font-bold text-[#b13168] text-sm tracking-[0] leading-[normal]">
            Facultad de Ingeniería y Ciencias
          </p>
        </div>
      </div>
      
      <nav aria-label="Principal" className="flex items-center gap-4">
        {navItems.map((item) =>
          item.active ? (
            <Link
              key={item.label}
              to={item.to}
              aria-current="page"
              className="flex items-center justify-center px-4 py-1.5 bg-[#b13168] rounded-lg border-2 border-[#b13168] transition-opacity hover:opacity-90"
            >
              <span className="font-bold text-white text-base text-center whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center justify-center px-4 py-1.5 bg-transparent rounded-lg border-2 border-[#b13168] transition-colors hover:bg-[#b13168] group"
            >
              <span className="font-bold text-[#b13168] text-base text-center whitespace-nowrap transition-colors group-hover:text-white">
                {item.label}
              </span>
            </Link>
          )
        )}
      </nav>
    </header>
  );
};
