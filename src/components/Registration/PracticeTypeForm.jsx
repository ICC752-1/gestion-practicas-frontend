import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PracticeTypeForm = ({ onNext, onBack, initialData = {} }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    internship_type: initialData.internship_type || '',
    internship_period: initialData.internship_period || '',
  });

  const [errors, setErrors] = useState({});
  const [showRequirementModal, setShowRequirementModal] = useState(false);

  // Valor temporal para las pruebas de frontend - se asume que el estudiante tiene seguro escolar. En la integración real, este dato vendrá del backend.
  const hasSchoolInsurance = false;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.internship_type) {
      newErrors.internship_type = 'Seleccione un tipo de práctica.';
    }

    if (!formData.internship_period) {
      newErrors.internship_period = 'Seleccione un período.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const requiresInsurance =
      formData.internship_period === 'Verano' ||
      formData.internship_period === 'Invierno';

    // Caso 2:
    // Verano o Invierno + no tiene seguro
    if (requiresInsurance && !hasSchoolInsurance) {
      setShowRequirementModal(true);
      return;
    }

    // Caso 1 y 3
    onNext?.(formData);
  };

  return (
    <>
      <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-12 w-full max-w-[650px]">
        <h2 className="text-3xl font-bold text-black mb-10">
          Tipo y período de práctica
        </h2>

        <form className="space-y-10" onSubmit={handleSubmit}>

          {/* Tipo de práctica */}
          <div className="space-y-4">
            <label className="block text-2xl font-bold text-black">
              Seleccione el tipo de práctica
            </label>

            <div className="space-y-3">
              {['Práctica de Estudio I', 'Práctica de Estudio II', 'Práctica Controlada', 'Tesis'].map((type) => (
                <label
                  key={type}
                  className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${
                    formData.internship_type === type
                      ? 'border-[#d22864] bg-[#ffe7f0]'
                      : errors.internship_type
                      ? 'border-red-500 bg-[#fff1f2]'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="internship_type"
                    value={type}
                    checked={formData.internship_type === type}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        internship_type: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        internship_type: '',
                      }));
                    }}
                    className="w-6 h-6 accent-[#d22864]"
                  />

                  <span className="text-xl text-gray-700">{type}</span>
                </label>
              ))}
            </div>

            {errors.internship_type && (
              <p className="text-sm text-red-600">
                {errors.internship_type}
              </p>
            )}
          </div>

          {/* Período */}
          <div className="space-y-4">
            <label className="block text-2xl font-bold text-black">
              Seleccione el período de práctica
            </label>

            <div className="space-y-3">
              {['Semestre', 'Verano', 'Invierno'].map((period) => (
                <label
                  key={period}
                  className={`flex items-center gap-3 p-4 rounded-[20px] cursor-pointer transition-colors border ${
                    formData.internship_period === period
                      ? 'border-[#d22864] bg-[#ffe7f0]'
                      : errors.internship_period
                      ? 'border-red-500 bg-[#fff1f2]'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="internship_period"
                    value={period}
                    checked={formData.internship_period === period}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        internship_period: e.target.value,
                      }));

                      setErrors((prev) => ({
                        ...prev,
                        internship_period: '',
                      }));
                    }}
                    className="w-6 h-6 accent-[#d22864]"
                  />

                  <span className="text-xl text-gray-700">{period}</span>
                </label>
              ))}
            </div>

            {errors.internship_period && (
              <p className="text-sm text-red-600">
                {errors.internship_period}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-8">

            {onBack && (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 h-16 bg-white text-[#d22864] border border-[#d22864] text-2xl font-bold rounded-[20px] hover:bg-[#f9f4f7] transition-all shadow-sm cursor-pointer"
              >
                Volver
              </button>
            )}

            <button
              type="submit"
              className="flex-1 h-16 bg-[#d22864] text-white text-2xl font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer"
            >
              Siguiente
            </button>

          </div>
        </form>
      </div>

      {/* Modal */}
      {showRequirementModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white rounded-[30px] p-8 w-full max-w-[550px] shadow-xl">

            <h3 className="text-2xl font-bold text-[#d22864] mb-4">
              Requisitos pendientes
            </h3>

            <p className="text-gray-700 text-lg mb-8">
              Para registrar una práctica de verano o invierno debe completar
              previamente la inducción y validación del seguro escolar.
            </p>

            <div className="flex gap-4">

              <button
                onClick={() => setShowRequirementModal(false)}
                className="flex-1 h-14 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cerrar
              </button>

              <button
                onClick={() => navigate('/requirements')}
                className="flex-1 h-14 bg-[#d22864] text-white rounded-xl font-semibold hover:opacity-90"
              >
                Ir a requisitos
              </button>

            </div>

          </div>

        </div>
      )}
    </>
  );
};