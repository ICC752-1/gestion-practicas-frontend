import { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { ActionModal } from './ActionModal';
import { internshipService } from '../../services/internshipService';
import { Check, XCircle, FileInput, AlertCircle } from 'lucide-react';

export const ActionButtons = ({ practice, onActionSuccess }) => {
  const { user } = useAuth();
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    actionType: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Normalize status title
  const currentStatus = practice?.is_cancelled
    ? 'Anulada'
    : practice?.status?.title || practice?.status || 'Pendiente';
  const terminalStates = ['Anulada', 'Aprobada', 'Rechazada', 'Reprobada'];

  // Return null if status is terminal
  if (terminalStates.includes(currentStatus)) {
    return null;
  }

  // Determine allowed actions based on user roles and current state (matching backend rules).
  // NOTE: 'Encargado de practica' and 'Director de carrera' are treated as equivalent.
  // There is NO forced sequential chain — either role can approve/reject directly
  // from 'Pendiente' without requiring the other role to act first.
  const userRoles = user?.roles || [];
  const isEncargadoOrDirector = userRoles.some(role =>
    role === 'Encargado de practica' || role === 'Director de carrera'
  );
  const isDirector = userRoles.includes('Director de carrera');
  const isSecretaria = userRoles.some(role => role === 'Secretaria de Carrera');
  const approveStartsReview = currentStatus === 'Pendiente' && !isDirector;

  // Can approve/reject from Pendiente, En revisión, En revisión DIRAE
  const canApproveReject = isEncargadoOrDirector && [
    'Pendiente',
    'En revisión',
    'En revisión DIRAE'
  ].includes(currentStatus);

  // Can derive to DIRAE only from Pendiente or En revisión
  const canDerive = isSecretaria && [
    'Pendiente',
    'En revisión'
  ].includes(currentStatus);

  if (!canApproveReject && !canDerive) {
    return null;
  }

  const handleOpenModal = (actionType) => {
    setActionError(null);
    setModalConfig({ isOpen: true, actionType });
  };

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, actionType: null });
  };

  const handleConfirmAction = async (comment) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const { actionType } = modalConfig;
      const internshipId = practice.id;

      if (actionType === 'approve') {
        await internshipService.approveInternship(internshipId, comment);
      } else if (actionType === 'reject') {
        await internshipService.rejectInternship(internshipId, comment);
      } else if (actionType === 'derive') {
        await internshipService.deriveInternship(internshipId, comment);
      }

      handleCloseModal();
      if (onActionSuccess) {
        onActionSuccess();
      }
    } catch (error) {
      console.error('Error performing action:', error);
      let msg;
      const status = error.response?.status;
      if (status === 403) {
        msg = 'No tiene permisos para realizar esta acción.';
      } else if (status === 404) {
        msg = 'La solicitud no fue encontrada o ya no existe.';
      } else {
        msg = error.response?.data?.detail?.message ||
              error.response?.data?.detail ||
              error.response?.data?.message ||
              'Ocurrió un error al procesar la acción. Por favor, intente nuevamente.';
      }
      setActionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-base font-black text-gray-900">Acciones administrativas</h3>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Revisa la solicitud y registra la decisión correspondiente.
          </p>
        </div>
        {actionError && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm text-red-600 shadow-inner animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">No se pudo completar la acción:</span>
              <p className="mt-0.5 text-red-500 font-medium">{actionError}</p>
            </div>
          </div>
        )}
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          {canApproveReject && (
            <>
              <button
                onClick={() => handleOpenModal('approve')}
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Check size={18} strokeWidth={2.5} />
                {approveStartsReview ? 'Enviar a revisión' : 'Aprobar solicitud'}
              </button>
              <button
                onClick={() => handleOpenModal('reject')}
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-bold text-white shadow-md transition-all hover:bg-red-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <XCircle size={18} strokeWidth={2.5} />
                Rechazar solicitud
              </button>
            </>
          )}
          {canDerive && (
            <button
              onClick={() => handleOpenModal('derive')}
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <FileInput size={18} strokeWidth={2.5} />
              Derivar a DIRAE
            </button>
          )}
        </div>
      </section>

      <ActionModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
        actionType={modalConfig.actionType}
        isLoading={isSubmitting}
        approveStartsReview={approveStartsReview}
      />
    </>
  );
};
