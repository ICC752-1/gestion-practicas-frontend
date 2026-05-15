import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const PracticeDetailsForm = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    practiceType: initialData.practiceType || 'presencial',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    days: initialData.days || [],
    startTime: initialData.startTime || '',
    endTime: initialData.endTime || '',
    address: initialData.address || '',
    region: initialData.region || '',
    commune: initialData.commune || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'days') {
      const newDays = checked 
        ? [...formData.days, value] 
        : formData.days.filter(d => d !== value);
      setFormData(prev => ({ ...prev, days: newDays }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext?.(formData);
  };

  const dayOptions = [
    { id: 'lunes', label: 'Lunes' },
    { id: 'martes', label: 'Martes' },
    { id: 'miercoles', label: 'Miércoles' },
    { id: 'jueves', label: 'Jueves' },
    { id: 'viernes', label: 'Viernes' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' },
  ];

  return (
    <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[650px]">
      <h2 className="text-3xl font-bold text-black mb-10">Información de la Práctica</h2>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* Tipo de práctica */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black">Seleccione el tipo de práctica que realizará</label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="practiceType" 
                value="presencial" 
                checked={formData.practiceType === 'presencial'}
                onChange={handleChange}
                className="w-6 h-6 accent-[#d22864]"
              />
              <span className="text-xl text-gray-700">Presencial</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-300 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="practiceType" 
                value="virtual" 
                checked={formData.practiceType === 'virtual'}
                onChange={handleChange}
                className="w-6 h-6 accent-[#d22864]"
              />
              <span className="text-xl text-gray-700">Virtual</span>
            </label>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xl font-bold text-black">Fecha de inicio</label>
            <input 
              type="date" 
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xl font-bold text-black">Fecha de término</label>
            <input 
              type="date" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all"
            />
          </div>
        </div>

        {/* Días de la semana */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black">Seleccione los días regulares de la semana en que realizará su práctica</label>
          <div className="space-y-2">
            {dayOptions.map(day => (
              <label key={day.id} className="flex items-center gap-3 p-4 border border-gray-300 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  name="days" 
                  value={day.id} 
                  checked={formData.days.includes(day.id)}
                  onChange={handleChange}
                  className="w-6 h-6 accent-[#d22864]"
                />
                <span className="text-xl text-gray-700">{day.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Horarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xl font-bold text-black">Hora de inicio</label>
            <input 
              type="time" 
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all"
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xl font-bold text-black">Hora de término</label>
            <input 
              type="time" 
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese la dirección donde realizará su Práctica</label>
          <input 
            type="text" 
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Calle y número. Ej. Av. francia 01145"
            className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all"
          />
        </div>

        {/* Región y Comuna */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Seleccione la región donde realizará su Práctica</label>
          <div className="relative">
            <select 
              name="region" 
              value={formData.region} 
              onChange={handleChange}
              className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none"
            >
              <option value="">Seleccione una región</option>
              <option value="araucania">La Araucanía</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Seleccione la comuna donde realizará su Práctica</label>
          <div className="relative">
            <select 
              name="commune" 
              value={formData.commune} 
              onChange={handleChange}
              className="w-full h-16 px-6 bg-white border border-gray-300 rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none"
            >
              <option value="">Seleccione una comuna</option>
              <option value="temuco">Temuco</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-16 bg-[#d22864] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            Anterior
          </button>
          <button 
            type="submit"
            className="flex-1 h-16 bg-[#d22864] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
};
