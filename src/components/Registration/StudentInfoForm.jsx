import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export const StudentInfoForm = ({ onNext, initialData = {} }) => {
  const navigate = useNavigate();
  const careerOptions = {
    '3095': 'Ingeniería Civil Informática'
  };

  const [formData, setFormData] = useState({
    enrollment: initialData.enrollment || '',
    careerCode: initialData.careerCode || '3095',
    careerName: initialData.careerName || careerOptions[initialData.careerCode || '3095'] || '',
    fullName: initialData.fullName || '',
    gender: initialData.gender || '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'careerCode') {
      setFormData((prev) => ({
        ...prev,
        careerCode: value,
        careerName: careerOptions[value] || '',
      }));
      setErrors((prev) => ({ ...prev, careerCode: '', careerName: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const enrollment = formData.enrollment.trim();
    const validEnrollmentPattern = /^[0-9]*[kK]?[0-9]*$/;

    if (!enrollment) {
      newErrors.enrollment = 'La matrícula es obligatoria.';
    } else if (enrollment.length < 9) {
      newErrors.enrollment = 'La matrícula está incompleta.';
    } else if (!validEnrollmentPattern.test(enrollment)) {
      newErrors.enrollment = 'La matrícula solo puede contener números y una sola K.';
    }


    if (!formData.careerName) {
      newErrors.careerName = 'Seleccione una carrera.';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nombre y apellido obligatorios.';
    }

    if (!formData.gender) {
      newErrors.gender = 'Seleccione un género.';
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

  return (
    <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[650px]">
      <h2 className="text-3xl font-bold text-black mb-10">Información del estudiante</h2>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Matricula</label>
          <input 
            type="text" 
            name="enrollment"
            value={formData.enrollment}
            onChange={handleChange}
            placeholder="Ej: 123456789YY"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.enrollment ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.enrollment && <p className="text-sm text-red-600">{errors.enrollment}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Código de la carrera</label>
          <div className="relative">
            <select
              name="careerCode"
              value={formData.careerCode}
              onChange={handleChange}
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none ${errors.careerCode ? 'border border-red-500' : 'border border-gray-300'}`}
            >
              <option value="">Seleccione una opción</option>
              <option value="3095">3095</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
          {errors.careerCode && <p className="text-sm text-red-600">{errors.careerCode}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Nombre de la carrera</label>
          <input
            type="text"
            name="careerName"
            value={formData.careerName}
            disabled
            className="w-full h-16 px-6 bg-[#eeeeee] border border-gray-300 rounded-[20px] text-xl text-gray-600 cursor-not-allowed"
          />
          {errors.careerName && <p className="text-sm text-red-600">{errors.careerName}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Nombre y apellido</label>
          <input 
            type="text" 
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Ej: Juan Perez"
            className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all ${errors.fullName ? 'border border-red-500' : 'border border-gray-300'}`}
          />
          {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Género con el que se identifica</label>
          <div className="relative">
            <select 
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none ${errors.gender ? 'border border-red-500' : 'border border-gray-300'}`}
            >
              <option value="">Seleccione una opción</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="prefer_not_to_say">Prefiero no decirlo</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
          {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 h-16 bg-white text-[#d22864] border border-[#d22864] text-2xl font-bold rounded-[20px] hover:bg-[#f9f4f7] transition-all shadow-sm cursor-pointer"
          >
            Volver
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