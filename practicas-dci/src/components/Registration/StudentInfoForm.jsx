import { ChevronDown } from 'lucide-react';

export const StudentInfoForm = ({ onNext }) => {
  return (
    <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[650px]">
      <h2 className="text-3xl font-bold text-black mb-10">Información del estudiante</h2>
      
      <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); onNext?.(); }}>
        {/* Matricula */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Matricula</label>
          <input 
            type="text" 
            placeholder="123456789YY"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Código de la carrera */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Código de la carrera</label>
          <input 
            type="text" 
            value="3095"
            disabled
            className="w-full h-16 px-6 bg-[#eeeeee] border border-gray-300 rounded-[20px] text-xl text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Seleccione su carrera */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Seleccione su carrera</label>
          <div className="relative">
            <select className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all appearance-none">
              <option value="">Seleccione una opción</option>
              <option value="icci">Ingeniería Civil en Informática</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
        </div>

        {/* Nombre y apellido */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Nombre y apellido</label>
          <input 
            type="text" 
            placeholder="Juan Perez"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all"
          />
        </div>

        {/* Género */}
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Género con el que se identifica</label>
          <div className="relative">
            <select className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#b13168] focus:ring-1 focus:ring-[#b13168] outline-none transition-all appearance-none">
              <option value="">Seleccione una opción</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="prefer_not_to_say">Prefiero no decirlo</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
        </div>

        {/* Button */}
        <button 
          type="submit"
          className="w-full h-16 bg-[#b13168] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity mt-8 shadow-md cursor-pointer"
        >
          Siguiente
        </button>
      </form>
    </div>
  );
};
