import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const PracticeDetailsForm = ({ onNext, onBack, initialData = {} }) => {
  const [formData, setFormData] = useState({
    practiceType: initialData.practiceType || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    days: initialData.days || [],
    startTime: initialData.startTime || '',
    endTime: initialData.endTime || '',
    internshipAddress: initialData.internshipAddress || '',
    region: initialData.region || '',
    commune: initialData.commune || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'days') {
      const newDays = checked
        ? [...formData.days, value]
        : formData.days.filter((d) => d !== value);
      setFormData((prev) => ({ ...prev, days: newDays }));
      setErrors((prev) => ({ ...prev, days: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.practiceType) {
      newErrors.practiceType = 'Seleccione un tipo de práctica.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria.';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de término es obligatoria.';
    }

    if (formData.days.length === 0) {
      newErrors.days = 'Seleccione al menos un día de la semana.';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es obligatoria.';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'La hora de término es obligatoria.';
    }

    if (!formData.internshipAddress.trim()) {
      newErrors.internshipAddress = 'La dirección de la práctica es obligatoria.';
    }

    if (!formData.region) {
      newErrors.region = 'Seleccione una región.';
    }

    if (!formData.commune) {
      newErrors.commune = 'Seleccione una comuna.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext?.(formData);
    }
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
            <label className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${formData.practiceType === 'presencial' ? 'border-[#d22864] bg-[#ffe7f0]' : errors.practiceType ? 'border-red-500 bg-[#fff1f2]' : 'border-gray-300 hover:bg-gray-50'}`}>
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
          
            <label className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${formData.practiceType === 'remoto' ? 'border-[#d22864] bg-[#ffe7f0]' : errors.practiceType ? 'border-red-500 bg-[#fff1f2]' : 'border-gray-300 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="practiceType" 
                value="remoto" 
                checked={formData.practiceType === 'remoto'}
                onChange={handleChange}
                className="w-6 h-6 accent-[#d22864]"
              />
              <span className="text-xl text-gray-700">Remoto</span>
            </label>
            <label className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${formData.practiceType === 'híbrido' ? 'border-[#d22864] bg-[#ffe7f0]' : errors.practiceType ? 'border-red-500 bg-[#fff1f2]' : 'border-gray-300 hover:bg-gray-50'}`}>
              <input 
                type="radio" 
                name="practiceType" 
                value="híbrido" 
                checked={formData.practiceType === 'híbrido'}
                onChange={handleChange}
                className="w-6 h-6 accent-[#d22864]"
              />
              <span className="text-xl text-gray-700">Híbrido</span>
            </label>

          </div>
          {errors.practiceType && <p className="text-sm text-red-600">{errors.practiceType}</p>}
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
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.startDate ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.startDate && <p className="text-sm text-red-600">{errors.startDate}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-xl font-bold text-black">Fecha de término</label>
            <input 
              type="date" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.endDate ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.endDate && <p className="text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        {/* Días de la semana */}
        <div className="space-y-4">
          <label className="block text-xl font-bold text-black">Seleccione los días regulares de la semana en que realizará su práctica</label>
          <div className="space-y-2">
            {dayOptions.map((day) => (
              <label key={day.id} className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${formData.days.includes(day.id) ? 'border-[#d22864] bg-[#ffe7f0]' : 'border-gray-300 hover:bg-gray-50'}`}>
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
          {errors.days && <p className="text-sm text-red-600">{errors.days}</p>}
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
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.startTime ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.startTime && <p className="text-sm text-red-600">{errors.startTime}</p>}
          </div>
          <div className="space-y-3">
            <label className="block text-xl font-bold text-black">Hora de término</label>
            <input 
              type="time" 
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.endTime ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.endTime && <p className="text-sm text-red-600">{errors.endTime}</p>}
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Ingrese la dirección donde realizará su Práctica</label>
          <input 
            type="text" 
            name="internshipAddress"
            value={formData.internshipAddress}
            onChange={handleChange}
            placeholder="Calle y número. Ej. Av. francia 01145"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.internshipAddress ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.internshipAddress && <p className="text-sm text-red-600">{errors.internshipAddress}</p>}
        </div>

        {/* Región y Comuna */}
        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Seleccione la región donde realizará su Práctica</label>
          <div className="relative">
            <select 
              name="region" 
              value={formData.region} 
              onChange={handleChange}
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none ${errors.region ? 'border border-red-500' : 'border border-gray-300'}`}
            >
              <option value="">Seleccione una región</option>
              <option value="araucania">La Araucanía</option>
              <option value="arica-parinacota">Arica y Parinacota</option>
              <option value="tarapaca">Tarapacá</option>
              <option value="antofagasta">Antofagasta</option>
              <option value="atacama">Atacama</option>  
              <option value="coquimbo">Coquimbo</option>
              <option value="valparaiso">Valparaíso</option>
              <option value="metropolitana">Región Metropolitana</option>
              <option value="ohiggins">O'Higgins</option>
              <option value="maule">Maule</option>
              <option value="nuble">Ñuble</option>
              <option value="biobio">Biobío</option>
              <option value="los-rios">Los Ríos</option>
              <option value="los-lagos">Los Lagos</option>
              <option value="aysen">Aysén</option>
              <option value="magallanes">Magallanes</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
          {errors.region && <p className="text-sm text-red-600">{errors.region}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-xl font-bold text-black">Comuna donde realizará su Práctica</label>
          <input
            type="text"
            name="commune"
            value={formData.commune}
            onChange={handleChange}
            placeholder="Ej: Temuco"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.commune ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.commune && <p className="text-sm text-red-600">{errors.commune}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-16 bg-white text-[#d22864] border border-[#d22864] text-2xl font-bold rounded-[20px] hover:bg-[#f9f4f7] transition-all shadow-sm cursor-pointer"
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
