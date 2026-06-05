import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from "../../context/useAuth";
import { InsuranceRequirementModal } from './InsuranceRequirementModal';

export const StudentInfoForm = ({ onNext, initialData = {} }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const careerOptions = {
    '3095': 'Ingeniería Civil en Informática',
    '30086': 'Ingeniería en Informática',
  };

  const [formData, setFormData] = useState({
    enrollment: initialData.enrollment || '',
    careerCode: initialData.careerCode || '3095',
    careerName: initialData.careerName || careerOptions[initialData.careerCode || '3095'] || '',
    internship_period: initialData.internship_period || 'Semestre',
    internship_type: initialData.internship_type || 'Práctica de Estudio I',
    has_school_insurance: initialData.has_school_insurance ?? false,
  });

  const [errors, setErrors] = useState({});
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'careerCode') {
      setFormData((prev) => ({
        ...prev,
        careerCode: value,
        careerName: careerOptions[value] || '',
      }));
      setErrors((prev) => ({ ...prev, careerCode: '', careerName: '' }));
      return;
    }

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
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

    if (!formData.internship_period) {
      newErrors.internship_period = 'Seleccione un período.';
    }

    if (!formData.internship_type) {
      newErrors.internship_type = 'Seleccione un tipo de práctica.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Primero validar campos básicos
    if (!validateForm()) return;

    // Validación de seguro escolar para períodos estivales
    const isSummerPeriod = formData.internship_period === 'Verano' || formData.internship_period === 'Invierno';
    
    if (isSummerPeriod && !formData.has_school_insurance) {
      // Mostrar modal de advertencia y NO continuar
      setShowInsuranceModal(true);
      return;
    }

    // Si todo está correcto (o es Semestre), continuar
    onNext?.(formData);
  };

  const handleModalConfirm = () => {
    // Usuario aceptó los requisitos, pero NO avanzamos
    // Solo cerramos el modal para que pueda marcar el checkbox
    setShowInsuranceModal(false);
    // NO llamamos a onNext, el usuario debe marcar el checkbox primero
  };

  const handleModalClose = () => {
    // Usuario canceló, cerrar modal
    setShowInsuranceModal(false);
  };

  return (
    <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[650px]">
      <h2 className="text-3xl font-bold text-black mb-10">Información del estudiante</h2>

      <div className="mb-6 p-4 bg-[#f9f4f7] rounded-[20px] border border-[#d22864]">
        <p className="text-lg text-gray-700">
          <span className="font-bold">Estudiante:</span> {user?.first_name} {user?.last_name}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-bold">Correo:</span> {user?.email}
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Matrícula</label>
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
              <option value="30086">30086</option>
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
          <label className="block text-2xl font-bold text-black">Período académico</label>
          <div className="relative">
            <select
              name="internship_period"
              value={formData.internship_period}
              onChange={handleChange}
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none ${errors.internship_period ? 'border border-red-500' : 'border border-gray-300'}`}
            >
              <option value="Semestre">Semestre</option>
              <option value="Verano">Verano</option>
              <option value="Invierno">Invierno</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
          {errors.internship_period && <p className="text-sm text-red-600">{errors.internship_period}</p>}
        </div>

        {formData.internship_period === 'Verano' || formData.internship_period === 'Invierno' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="has_school_insurance"
                role="checkbox"
                aria-checked={formData.has_school_insurance}
                onClick={() => {
                  console.log('Checkbox clicked:', !formData.has_school_insurance);
                  setFormData((prev) => ({ 
                    ...prev, 
                    has_school_insurance: !prev.has_school_insurance 
                  }));
                  setErrors((prev) => ({ ...prev, has_school_insurance: '' }));
                }}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                  formData.has_school_insurance 
                    ? 'bg-[#d22864] border-[#d22864]' 
                    : 'bg-white border-[#d22864] hover:bg-gray-50'
                }`}
              >
                {formData.has_school_insurance && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <label htmlFor="has_school_insurance" className="text-xl text-gray-700 cursor-pointer select-none">
                ¿Cuentas con seguro escolar?
              </label>
            </div>
            {errors.has_school_insurance && <p className="text-sm text-red-600">{errors.has_school_insurance}</p>}
          </div>
        ) : null}

        <div className="space-y-3">
          <label className="block text-2xl font-bold text-black">Tipo de práctica</label>
          <div className="relative">
            <select
              name="internship_type"
              value={formData.internship_type}
              onChange={handleChange}
              className={`w-full h-16 px-6 bg-white rounded-[20px] text-xl text-gray-700 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition-all appearance-none ${errors.internship_type ? 'border border-red-500' : 'border border-gray-300'}`}
            >
              <option value="Práctica de Estudio I">Práctica de Estudio I</option>
              <option value="Práctica de Estudio II">Práctica de Estudio II</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
          {errors.internship_type && <p className="text-sm text-red-600">{errors.internship_type}</p>}
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

      {/* Modal de requisito de seguro escolar */}
      <InsuranceRequirementModal
        isOpen={showInsuranceModal}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
};