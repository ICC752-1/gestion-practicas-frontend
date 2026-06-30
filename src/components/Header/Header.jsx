import universityLogo from "../../assets/university_logo.webp";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Preguntas Frecuentes", to: "/faq", active: location.pathname === "/faq" },
    { label: "Requisitos", to: "/requisitos", active: location.pathname === "/requisitos" },
    { label: "Iniciar Sesión", to: "/login", active: location.pathname === "/login" },
  ];

  const renderNavItem = (item, isMobile = false) => {
    const baseClass = isMobile
      ? "flex w-full items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors"
      : "flex items-center justify-center rounded-lg border-2 px-4 py-2 text-sm font-bold transition-colors whitespace-nowrap";

    const stateClass = item.active
      ? "border-[#d22864] bg-[#d22864] text-white hover:opacity-90"
      : "border-[#d22864] text-[#d22864] hover:bg-[#d22864] hover:text-white";

    return (
      <Link
        key={item.label}
        to={item.to}
        aria-current={item.active ? "page" : undefined}
        onClick={() => setIsMobileMenuOpen(false)}
        className={`${baseClass} ${stateClass}`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#d22864] bg-white shadow-sm">
      <div className="mx-auto flex min-h-[64px] w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-10">
        <Link
          to="/"
          className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[#d22864] p-1 shadow-sm sm:h-12 sm:w-12">
            <img
              className="h-full w-full object-contain"
              alt="Universidad de La Frontera"
              src={universityLogo}
            />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <h1 className="truncate text-sm font-bold tracking-tight text-[#d22864] sm:text-lg lg:text-xl">
              Sistema de Gestión de Prácticas
            </h1>
            <p className="truncate text-xs font-medium text-[#d22864] opacity-90 sm:text-sm">
              Facultad de Ingeniería y Ciencias
            </p>
          </div>
        </Link>

        <nav aria-label="Principal" className="hidden flex-shrink-0 items-center gap-2 md:flex lg:gap-3">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-[#d22864] text-[#d22864] transition-colors hover:bg-[#d22864] hover:text-white md:hidden"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          aria-label={isMobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="public-mobile-navigation"
        >
          {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav
          id="public-mobile-navigation"
          aria-label="Principal móvil"
          className="border-t border-[#d22864]/15 bg-white px-4 py-3 shadow-sm md:hidden"
        >
          <div className="grid gap-2">
            {navItems.map((item) => renderNavItem(item, true))}
          </div>
        </nav>
      )}
    </header>
  );
};
