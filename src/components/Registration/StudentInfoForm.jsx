import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from "../../context/useAuth";
import { internshipService } from "../../services/internshipService";

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
  });

  const [errors, setErrors] = useState({});
  const [eligibilityError, setEligibilityError] = useState(null);
  const [duplicateBlock, setDuplicateBlock] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

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
    setEligibilityError(null);
    setDuplicateBlock(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setCheckingEligibility(true);
    setEligibilityError(null);
    setDuplicateBlock(null);

    try {
      const eligibility = await internshipService.getRegistrationEligibility({
        internship_period: formData.internship_period,
        internship_type: formData.internship_type,
      });

      if (eligibility.can_create_request === false) {
        setDuplicateBlock(eligibility);
        return;
      }
    } catch (error) {
      const detail = error.response?.data?.detail;
      if (typeof detail === 'string') {
        setEligibilityError(detail);
      } else if (detail?.message) {
        setEligibilityError(detail.message);
      } else {
        setEligibilityError('No se pudo validar si ya existe una solicitud para este tipo de práctica.');
      }
      return;
    } finally {
      setCheckingEligibility(false);
    }

    onNext?.(formData);
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
              <option value="Práctica Controlada">Práctica Controlada</option>
              <option value="Tesis">Tesis</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-black pointer-events-none" size={28} />
          </div>
          {errors.internship_type && <p className="text-sm text-red-600">{errors.internship_type}</p>}
        </div>

        {duplicateBlock && (
          <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 flex-shrink-0" size={22} />
              <div>
                <p className="font-bold">Ya existe una solicitud vigente para este tipo de práctica.</p>
                <p className="mt-1 text-sm">
                  Estado actual: {duplicateBlock.blocking_internship_status || 'Pendiente'}.
                </p>
                {duplicateBlock.blocking_internship_id && (
                  <button
                    type="button"
                    onClick={() => navigate(`/seguimiento/${duplicateBlock.blocking_internship_id}`)}
                    className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700"
                  >
                    Ver solicitud existente
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {eligibilityError && (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 flex-shrink-0" size={22} />
              <p className="text-sm font-semibold">{eligibilityError}</p>
            </div>
          </div>
        )}

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
            disabled={checkingEligibility}
            className="flex-1 h-16 bg-[#d22864] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
          >
            {checkingEligibility ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={24} />
                Validando
              </span>
            ) : (
              'Siguiente'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
