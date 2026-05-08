import { Bell, LogOut } from 'lucide-react';
import universityLogo from "../../assets/university_logo.webp";
import { Link, useNavigate } from 'react-router-dom';

export const UserHeader = ({ userName = "María Gómez", userRole = "Estudiante", userAvatar = null }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate("/login");
  };
  return (
    <header className="flex w-full items-center justify-between px-10 h-20 bg-white border-b-[3px] border-[#b13168] z-50 shadow-sm sticky top-0">
      {/* Left Section: Logo and Title */}
      <div className="flex items-center gap-4">
        <div className="bg-[#b13168] p-1.5 rounded-xl shadow-sm">
          <img
            className="w-12 h-12 object-contain"
            alt="Universidad de La Frontera"
            src={universityLogo}
          />
        </div>
        <div className="flex flex-col items-start leading-tight">
          <h1 className="font-bold text-[#b13168] text-xl tracking-tight">
            Sistema de Gestión de Prácticas
          </h1>
          <p className="font-semibold text-[#b13168] text-xs">
            Facultad de Ingeniería y Ciencias
          </p>
        </div>
      </div>

      {/* Center Section: Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <Link to="/faq" className="font-bold text-[#b13168] hover:opacity-80 transition-opacity">
          Preguntas Frecuentes
        </Link>
        <Link to="#" className="font-bold text-[#b13168] hover:opacity-80 transition-opacity">
          Requisitos
        </Link>
      </nav>

      {/* Right Section: User Profile & Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-1 text-[#b13168] hover:bg-gray-50 rounded-full transition-colors">
          <Bell size={24} strokeWidth={2.5} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-gray-300 mx-2"></div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end leading-none">
            <span className="font-bold text-[#b13168] text-base">{userName}</span>
            <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{userRole}</span>
          </div>
          
          <div className="relative">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-11 h-11 rounded-full object-cover border-2 border-[#b13168] p-0.5" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-blue-100 border-2 border-[#b13168] flex items-center justify-center overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" 
                  alt="Avatar"
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        </div>

        <button onClick={handleLogout} className="p-2 text-[#b13168] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all" title="Cerrar Sesión">
          <LogOut size={22} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
};
