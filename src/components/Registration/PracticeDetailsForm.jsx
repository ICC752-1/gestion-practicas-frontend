import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const PracticeDetailsForm = ({ onNext, onBack, initialData = {} }) => {
  const defaultWeekdays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const [formData, setFormData] = useState({
    practiceType: initialData.practiceType || 'Presencial',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    days: Array.isArray(initialData.days) && initialData.days.length > 0
      ? initialData.days
      : defaultWeekdays,
    startTime: initialData.startTime || '08:00',
    endTime: initialData.endTime || '18:00',
    internship_address: initialData.internship_address || '',
    region: initialData.region || '',
    commune: initialData.commune || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'days') {
      const currentDays = Array.isArray(formData.days) ? formData.days : [];
      const newDays = checked
        ? [...currentDays, value]
        : currentDays.filter((d) => d !== value);
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

    if (!formData.internship_address.trim()) {
      newErrors.internship_address = 'La dirección de la práctica es obligatoria.';
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
    <div className="bg-white rounded-3xl shadow-[0px_4px_26px_#00000012] p-8 md:p-10 w-full max-w-[580px] mx-auto border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Información de la práctica</h2>
      
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Tipo de práctica */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Tipo de práctica que realizará</label>
          <div className="space-y-2">
            {['Presencial', 'Híbrido', 'Remoto'].map((type) => {
              const isSelected = formData.practiceType === type;
              return (
                <label 
                  key={type}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-colors border ${
                    isSelected 
                      ? 'border-[#d22864] bg-[#ffe7f0]/40' 
                      : errors.practiceType ? 'border-red-500 bg-[#fff1f2]' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {/* Círculo indicador visual perfectamente centrado */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected ? 'border-[#d22864] bg-white' : 'border-gray-400 bg-white'
                  }`}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#d22864] transition-all" />
                    )}
                  </div>

                  <input 
                    type="radio" 
                    name="practiceType" 
                    value={type} 
                    checked={isSelected}
                    onChange={handleChange}
                    className="sr-only" 
                  />
                  <span className="text-base text-gray-700">{type}</span>
                </label>
              );
            })}
          </div>
          {errors.practiceType && <p className="text-xs text-red-600">{errors.practiceType}</p>}
        </div>
        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-base font-bold text-gray-800">Fecha de inicio</label>
            <input 
              type="date" 
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`w-full h-13 px-4 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.startDate ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.startDate && <p className="text-xs text-red-600">{errors.startDate}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-base font-bold text-gray-800">Fecha de término</label>
            <input 
              type="date" 
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={`w-full h-13 px-4 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.endDate ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.endDate && <p className="text-xs text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        {/* Días de la semana - SIN SCROLLBAR Y COMPLETOS */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Días regulares de práctica</label>
          <div className="space-y-2">
            {dayOptions.map((day) => {
              const isChecked = formData.days.includes(day.id);
              return (
                <div
                  key={day.id}
                  onClick={() => {
                    const currentDays = Array.isArray(formData.days) ? formData.days : [];
                    const newDays = isChecked
                      ? currentDays.filter((d) => d !== day.id)
                      : [...currentDays, day.id];
                    setFormData((prev) => ({ ...prev, days: newDays }));
                    setErrors((prev) => ({ ...prev, days: '' }));
                  }}
                  className={`flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-colors border bg-white ${
                    isChecked ? 'border-[#d22864] bg-[#ffe7f0]/20' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    isChecked ? 'bg-[#d22864] border-[#d22864]' : 'bg-white border-gray-400'
                  }`}>
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-base text-gray-700">{day.label}</span>
                </div>
              );
            })}
          </div>
          {errors.days && <p className="text-xs text-red-600">{errors.days}</p>}
        </div>

        {/* Horarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-base font-bold text-gray-800">Hora de inicio</label>
            <input 
              type="time" 
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={`w-full h-13 px-4 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.startTime ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.startTime && <p className="text-xs text-red-600">{errors.startTime}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-base font-bold text-gray-800">Hora de término</label>
            <input 
              type="time" 
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`w-full h-13 px-4 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.endTime ? 'border border-red-500' : 'border border-gray-300'}`}
            />
            {errors.endTime && <p className="text-xs text-red-600">{errors.endTime}</p>}
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Dirección donde realizará la práctica</label>
          <input 
            type="text" 
            name="internship_address"
            value={formData.internship_address}
            onChange={handleChange}
            placeholder="Calle y número. Ej. Av. Alemania 01145"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.internship_address ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.internship_address && <p className="text-xs text-red-600">{errors.internship_address}</p>}
        </div>

        {/* Región y Comuna */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Región</label>
          <div className="relative">
            <select 
              name="region" 
              value={formData.region} 
              onChange={handleChange}
              className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none ${errors.region ? 'border border-red-500' : 'border border-gray-300'}`}
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
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={20} />
          </div>
          {errors.region && <p className="text-xs text-red-600">{errors.region}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-base font-bold text-gray-800">Comuna</label>
          <input
            type="text"
            name="commune"
            value={formData.commune}
            onChange={handleChange}
            placeholder="Ej: Temuco"
            className={`w-full h-13 px-5 bg-white rounded-2xl text-base text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.commune ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.commune && <p className="text-xs text-red-600">{errors.commune}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onBack}
            className="flex-1 h-13 bg-white text-[#d22864] border border-[#d22864] text-lg font-bold rounded-2xl hover:bg-[#f9f4f7] transition-all cursor-pointer"
          >
            Anterior
          </button>
          <button 
            type="submit"
            className="flex-1 h-13 bg-[#d22864] text-white text-lg font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            Siguiente
          </button>
        </div>
      </form>
    </div>
  );
};