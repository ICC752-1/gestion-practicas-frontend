import universityLogo from "../../assets/university_logo.webp";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { label: "Preguntas Frecuentes", to: "/faq", active: location.pathname === "/faq" },
    { label: "Requisitos", to: "/requisitos", active: location.pathname === "/requisitos" },
    { label: "Iniciar Sesión", to: "/login", active: location.pathname === "/login" },
  ];

  return (
    <header className="flex w-full items-center justify-between px-10 h-20 bg-white border-b-[3px] border-[#d22864] z-10 shadow-sm relative">
      <div className="flex items-center gap-4">
        <img
          className="w-16 h-16 object-contain p-1.5 bg-[#d22864] rounded-xl shadow-sm"
          alt="Logo personal para médico azul rojo"
          src={universityLogo}
        />
        <div className="flex flex-col items-start gap-0.5">
          <p className="font-bold text-[#d22864] text-xl tracking-[0] leading-[normal] whitespace-nowrap">
            Sistema de Gestión de Prácticas
          </p>
          <p className="font-bold text-[#d22864] text-sm tracking-[0] leading-[normal]">
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
              className="flex items-center justify-center px-4 py-1.5 bg-[#d22864] rounded-lg border-2 border-[#d22864] transition-opacity hover:opacity-90"
            >
              <span className="font-bold text-white text-base text-center whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center justify-center px-4 py-1.5 bg-transparent rounded-lg border-2 border-[#d22864] transition-colors hover:bg-[#d22864] group"
            >
              <span className="font-bold text-[#d22864] text-base text-center whitespace-nowrap transition-colors group-hover:text-white">
                {item.label}
              </span>
            </Link>
          )
        )}
      </nav>
    </header>
  );
};
