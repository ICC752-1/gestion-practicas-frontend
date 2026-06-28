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
    <header 
      className="sticky top-0 z-50 flex min-h-[60px] w-full items-center justify-between border-b-2 border-[#d22864] bg-white shadow-sm overflow-hidden"
      style={{ padding: '0.4rem clamp(0.5rem, 2vw, 2.5rem)', gap: '0.5rem' }}
    >
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="bg-[#d22864] rounded-lg shadow-sm flex-shrink-0 p-1" style={{ padding: 'clamp(4px, 0.4vw, 6px)' }}>
          <img
            style={{ width: 'clamp(36px, 3.5vw, 46px)', height: 'clamp(36px, 3.5vw, 46px)' }}
            className="object-contain"
            alt="Universidad de La Frontera"
            src={universityLogo}
          />            
        </div>    
        <div className="flex flex-col leading-tight min-w-0">
          <h1 className="font-bold tracking-tight text-[#d22864] truncate"
            style={{ fontSize: 'clamp(0.65rem, 2.0vw, 1.25rem)' }}>
            Sistema de Gestión de Prácticas
          </h1>
          <p className="font-medium text-[#d22864] opacity-90 truncate"
            style={{ fontSize: 'clamp(0.6rem, 1vw, 0.75rem)' }}>
            Facultad de Ingeniería y Ciencias
          </p>
        </div>
      </div>

      {/* Nav siempre visible */}
      <nav aria-label="Principal" className="flex items-center flex-shrink-0"
        style={{ gap: 'clamp(0.25rem, 1vw, 2rem)' }}
      >
        {navItems.map((item) =>
          item.active ? (
            <Link
              key={item.label}
              to={item.to}
              aria-current="page"
              className="flex items-center justify-center bg-[#d22864] rounded-lg border-2 border-[#d22864] transition-opacity hover:opacity-90 whitespace-nowrap"
              style={{ padding: 'clamp(1px, 0.4vw, 4px) clamp(6px, 1vw, 16px)', fontSize: 'clamp(0.6rem, 1vw, 0.8rem)' }}
            >
              <span className="font-bold text-white text-center">
                {item.label}
              </span>
            </Link>
          ) : (
            <Link
              key={item.label}
              to={item.to}
              className="flex items-center justify-center rounded-lg border-2 border-[#d22864] transition-colors hover:bg-[#d22864] group whitespace-nowrap"
              style={{ padding: 'clamp(1px, 0.4vw, 4px) clamp(6px, 1vw, 16px)', fontSize: 'clamp(0.6rem, 1vw, 0.8rem)' }}
            >
              <span className="font-bold text-[#d22864] text-center transition-colors group-hover:text-white">
                {item.label}
              </span>
            </Link>
          )
        )}
      </nav>
    </header>
  );
};
