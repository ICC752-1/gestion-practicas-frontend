import { useNavigate } from 'react-router-dom';
export const InternshipSummaryCard = ({ internshipData, onClose }) => {
  const navigate = useNavigate();
  if (!internshipData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-[40px] shadow-[0px_4px_30px_#00000015] p-10 w-full max-w-[750px] max-h-[85vh] overflow-y-auto space-y-8">
        
        {/* Header con botón cerrar */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-black">Detalle de inscripción</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer text-gray-600 font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Datos generales */}
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-[#d22864]">Datos generales</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
            <span className="text-gray-500">Tipo de práctica</span>
            <span className="font-semibold">{internshipData.internship_type}</span>
            <span className="text-gray-500">Modalidad</span>
            <span className="font-semibold">{internshipData.modality}</span>
            <span className="text-gray-500">Fecha inicio</span>
            <span className="font-semibold">{internshipData.start_date}</span>
            <span className="text-gray-500">Fecha término</span>
            <span className="font-semibold">{internshipData.end_date}</span>
            <span className="text-gray-500">Horario</span>
            <span className="font-semibold">{internshipData.schedule}</span>
            <span className="text-gray-500">Días</span>
            <span className="font-semibold">{internshipData.days}</span>
            <span className="text-gray-500">Dirección práctica</span>
            <span className="font-semibold">{internshipData.internship_address}</span>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Organización */}
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-[#d22864]">Organización</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
            <span className="text-gray-500">Nombre</span>
            <span className="font-semibold">{internshipData.org_name}</span>
            <span className="text-gray-500">Sector</span>
            <span className="font-semibold">{internshipData.sector}</span>
            <span className="text-gray-500">Dirección</span>
            <span className="font-semibold">{internshipData.address}</span>
            <span className="text-gray-500">Ciudad</span>
            <span className="font-semibold">{internshipData.city}</span>
            <span className="text-gray-500">Teléfono</span>
            <span className="font-semibold">{internshipData.org_phone}</span>
            <span className="text-gray-500">Sitio web</span>
            <span className="font-semibold">{internshipData.web || '—'}</span>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Supervisor */}
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-[#d22864]">Supervisor/a</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
            <span className="text-gray-500">Nombre</span>
            <span className="font-semibold">{internshipData.supervisor_name}</span>
            <span className="text-gray-500">Profesión</span>
            <span className="font-semibold">{internshipData.supervisor_profession}</span>
            <span className="text-gray-500">Cargo</span>
            <span className="font-semibold">{internshipData.supervisor_position}</span>
            <span className="text-gray-500">Departamento</span>
            <span className="font-semibold">{internshipData.supervisor_department}</span>
            <span className="text-gray-500">Email</span>
            <span className="font-semibold">{internshipData.supervisor_email}</span>
            <span className="text-gray-500">Teléfono</span>
            <span className="font-semibold">{internshipData.supervisor_phone}</span>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Actividades */}
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-[#d22864]">Actividades y beneficios</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
            <span className="text-gray-500">Actividades</span>
            <span className="font-semibold">{internshipData.act_description}</span>
            <span className="text-gray-500">Beneficios</span>
            <span className="font-semibold">{internshipData.ben_description || '—'}</span>
            <span className="text-gray-500">Apoyo económico</span>
            <span className="font-semibold">
              ${internshipData.amount?.toLocaleString('es-CL') || 0}
            </span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => {/* pendiente */}}
            className="flex-1 h-14 bg-white text-[#d22864] border border-[#d22864] text-lg font-bold rounded-[20px] hover:bg-[#f9f4f7] transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            Editar registro
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 h-14 bg-[#d22864] text-white text-lg font-bold rounded-[20px] hover:opacity-90 transition-opacity shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            Confirmar registro
          </button>
        </div>

      </div>
    </div>
  );
};