import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ArrowLeft,
    Calendar as CalendarIcon,
    CalendarCheck,
    CheckCircle2,
    Clock,
    MapPin,
    RefreshCw,
    Send,
    XCircle,
    Check,
    X,
    MessageSquare,
    Info,
    CalendarPlus,
    Upload,
    FileText,
    Download,
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { CalendarView } from '../../components/InterviewScheduling/CalendarView';
import { StatsCard } from '../../components/InterviewScheduling/StatsCard';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import { internshipService } from '../../services/internshipService';
import { documentService } from '../../services/documentService';
import { schedulingService } from '../../services/schedulingService';
import { getRedirectPathForRoles } from '../../services/roleRouting';

const ENTRY_CONTAINER_VARIANTS = {
    hidden: {},
    visible: {
        transition: {
            delayChildren: 0.06,
            staggerChildren: 0.11,
        },
    },
};
const ENTRY_ITEM_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.34, ease: 'easeOut' },
    },
};

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ADMIN_ROLES = new Set([
    'Encargado de practica',
    'Director de carrera',
]);

const PURPOSE_OPTIONS = [
    { value: 'general_consultation', label: 'Consulta general presencial' },
    { value: 'final_presentation', label: 'Entrevista / Presentación final' },
];

const MODALITY_OPTIONS = ['Presencial', 'Remoto', 'Híbrido'];
const APPOINTMENT_STATUS_OPTIONS = [
    { value: 'completed', label: 'Asistió' },
    { value: 'no_show', label: 'No asistió' },
];
const RESULT_OPTIONS = [
    { value: 'Aprobada', label: 'Aprobada' },
    { value: 'Reprobado', label: 'Reprobada' },
];
const STATUS_LABELS = {
    scheduled: 'Agendada',
    completed: 'Realizada',
    no_show: 'No asistió',
    cancelled: 'Cancelada',
};
const REQUEST_STATUS_LABELS = {
    pending: 'Pendiente',
    scheduled: 'Agendada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
};
const RESULT_LABELS = {
    Aprobada: 'Resultado aprobado',
    Reprobado: 'Resultado reprobado',
};
const DEFAULT_OUTCOME_FORM = {
    attendance_status: 'completed',
    result: 'Aprobada',
    comments: '',
};

const toDateKey = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const dateToCalendarValue = (date) => ({
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
});

const formatDisplayDate = (dateValue) => {
    if (!dateValue) return '';

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${dateValue}T00:00:00`));
};

const formatSlotTime = (slot) => {
    if (!slot.start_time || !slot.end_time) return '';
    return `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;
};

const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    const translations = {
        'Document type not found': 'No se encontró el tipo de documento.',
        'Document file not found': 'No se encontró el archivo del documento.',
        'Insufficient permissions': 'No tienes permisos para realizar esta acción.',
        'Cannot upload documents for an internship in terminal state: Aprobada':
            'No se pudo subir el archivo porque la práctica está aprobada y el tipo documental no permite nuevas cargas.',
        'Cannot upload documents for an internship in terminal state: Rechazada':
            'No se pueden subir documentos para una práctica rechazada.',
        'Cannot upload documents for an internship in terminal state: Reprobada':
            'No se pueden subir documentos para una práctica reprobada.',
    };

    if (typeof detail === 'string') return translations[detail] || detail;
    if (Array.isArray(detail?.pending_requirements) && detail.pending_requirements.length > 0) {
        return `${detail.message} ${detail.pending_requirements.join('. ')}.`;
    }
    if (detail?.message) return detail.message;

    return 'No se pudo completar la operación. Intenta nuevamente.';
};

const InlineMessage = ({ message, className = '' }) => {
    if (!message) return null;

    const isSuccess = message.type === 'success';

    return (
        <div
            className={[
                'flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold',
                isSuccess
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800',
                className,
            ].join(' ')}
            role={isSuccess ? 'status' : 'alert'}
        >
            {isSuccess ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
            ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            )}
            <span className="min-w-0 break-words">{message.text}</span>
        </div>
    );
};

const normalizeText = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const findSlidesDocumentType = (documentTypes) => {
    const normalizedTarget = 'diapositivas de presentacion';
    return documentTypes.find((type) => normalizeText(type.name) === normalizedTarget)
        || documentTypes.find((type) => {
            const name = normalizeText(type.name);
            return name.includes('diapositiva') || name.includes('presentacion');
        });
};

const getRoleNames = (user) => {
    if (!Array.isArray(user?.roles)) return [];

    return user.roles
        .map((role) => (typeof role === 'string' ? role : role?.role?.name))
        .filter(Boolean);
};

const purposeLabel = (purpose) => {
    if (purpose === 'initial_interview') return 'Entrevista inicial';
    return PURPOSE_OPTIONS.find((option) => option.value === purpose)?.label || purpose;
};

const getStatusBadgeClasses = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'no_show') return 'bg-amber-100 text-amber-700';
    if (status === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
};

const getRequestStatusBadgeClasses = (status) => {
    if (status === 'scheduled') return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'rejected') return 'bg-red-100 text-red-700 border border-red-200';
    if (status === 'cancelled') return 'bg-gray-100 text-gray-600 border border-gray-200';
    return 'bg-amber-100 text-amber-700 border border-amber-200';
};

const getResultBadgeClasses = (result) => {
    if (result === 'Aprobada') return 'bg-green-600 text-white';
    if (result === 'Reprobado') return 'bg-red-600 text-white';
    return 'bg-slate-200 text-slate-700';
};

const shouldShowOutcomeComments = (outcome) =>
    outcome?.attendance_status === 'no_show' || outcome?.result === 'Reprobado';

const parsePreferredDates = (dates) => {
    if (Array.isArray(dates)) return dates;
    if (typeof dates === 'string') {
        try {
            return JSON.parse(dates);
        } catch {
            return [];
        }
    }
    return [];
};

export const InterviewSchedulingPage = ({ embedded = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const today = useMemo(() => new Date(), []);
    const roleNames = useMemo(() => getRoleNames(user), [user]);
    const isAdmin = roleNames.some((role) => ADMIN_ROLES.has(role));
    const isStudent = roleNames.includes('Estudiante');

    const [selectedDate, setSelectedDate] = useState(dateToCalendarValue(today));
    const [appointmentsDateFilter, setAppointmentsDateFilter] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [internships, setInternships] = useState([]);
    const [generalConfig, setGeneralConfig] = useState({ general_consultations_enabled: false });

    // UI States
    const [activeTab, setActiveTab] = useState(isStudent ? 'request' : 'requests');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pageMessage, setPageMessage] = useState(null);
    const [requestMessage, setRequestMessage] = useState(null);
    const [appointmentMessage, setAppointmentMessage] = useState(null);

    // Student Form State
    const [formPurpose, setFormPurpose] = useState('general_consultation');
    const [formInternshipId, setFormInternshipId] = useState('');
    const [formTargetCoordinatorId, setFormTargetCoordinatorId] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [formPreferredDates, setFormPreferredDates] = useState(['', '', '']);
    const [slidesFile, setSlidesFile] = useState(null);

    // Coordinator Response State
    const [respondingRequest, setRespondingRequest] = useState(null);
    const [responseForm, setResponseForm] = useState({
        date: '',
        start_time: '09:00',
        end_time: '09:30',
        modality: 'Presencial',
        location: '',
        comments: '',
    });
    const [rejectingRequest, setRejectingRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [outcomeForms, setOutcomeForms] = useState({});

    // Direct scheduling modal states
    const [showDirectScheduleModal, setShowDirectScheduleModal] = useState(false);
    const [directForm, setDirectForm] = useState({
        internshipId: '',
        date: '',
        start_time: '09:00',
        end_time: '09:30',
        modality: 'Presencial',
        location: '',
        comments: '',
    });
    const [directFormErrors, setDirectFormErrors] = useState({});

    // Cancel / Reschedule modal state
    const [cancellingAppointment, setCancellingAppointment] = useState(null);
    const [cancelMode, setCancelMode] = useState('cancel');
    const [cancelReason, setCancelReason] = useState('');

    const selectedDateKey = toDateKey(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
    );

    // Load data from endpoints
    const loadData = useCallback(async ({ clearPageMessage = true } = {}) => {
        setLoading(true);
        if (clearPageMessage) {
            setPageMessage(null);
        }

        try {
            // Config
            const configData = await schedulingService.getSchedulingConfig();
            setGeneralConfig(configData);

            // Appointments
            const appointmentsData = await schedulingService.getAppointments();
            setAppointments(appointmentsData);

            if (isStudent) {
                // Requests me
                const requestsData = await schedulingService.getMyRequests();
                setMyRequests(requestsData);

                // Internships (with lifecycle tracking)
                const internshipsData = await internshipService.getMyInternships();
                const withLifecycle = await Promise.all(
                    internshipsData.map(async (internship) => {
                        try {
                            const lifecycle = await internshipService.getInternshipLifecycle(internship.id);
                            return { ...internship, lifecycle };
                        } catch {
                            return { ...internship, lifecycle: null };
                        }
                    })
                );
                setInternships(withLifecycle);
            }

            if (isAdmin) {
                // Pending requests
                const pendingData = await schedulingService.getPendingRequests();
                setPendingRequests(pendingData);

                // Load all internships for direct scheduling
                try {
                    const internshipsData = await internshipService.getInternships();
                    const activeInternships = internshipsData.filter(
                        (i) => i.status === 'approved' && i.completion_status !== 'finalized' && !i.is_cancelled
                    );
                    setInternships(activeInternships);
                } catch (err) {
                    console.error("Error loading internships for direct scheduling", err);
                }
            }
        } catch (error) {
            setPageMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setLoading(false);
        }
    }, [isStudent, isAdmin]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle Query Params
    useEffect(() => {
        if (internships.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const internshipId = params.get('internshipId');
            const purpose = params.get('purpose');
            
            if (purpose) setFormPurpose(purpose);
            if (internshipId) {
                setFormInternshipId(internshipId);
            } else {
                setFormInternshipId(String(internships[0].id));
            }
        }
    }, [internships]);

    // Calendar Marker Logic
    const calendarMarkers = useMemo(() => {
        const markers = {};
        appointments.forEach((appt) => {
            markers[appt.date] = markers[appt.date] || [];
            markers[appt.date].push(appt.id);
        });
        return markers;
    }, [appointments]);

    // Filtered Appointments on Selected Date
    const selectedDayAppointments = useMemo(
        () => appointments.filter((appt) => appt.date === selectedDateKey),
        [appointments, selectedDateKey]
    );

    const scheduledAppointmentsCount = useMemo(
        () => appointments.filter((appointment) => appointment.status === 'scheduled').length,
        [appointments]
    );

    // Sort appointments chronologically and apply the selected calendar day when needed.
    const orderedAppointments = useMemo(() => {
        const visibleAppointments = appointmentsDateFilter
            ? appointments.filter((appointment) => appointment.date === appointmentsDateFilter)
            : appointments;

        return [...visibleAppointments].sort((a, b) => {
            const cmp = a.date.localeCompare(b.date);
            if (cmp !== 0) return cmp;
            return a.start_time.localeCompare(b.start_time);
        });
    }, [appointments, appointmentsDateFilter]);

    const visibleMyRequests = useMemo(
        () => myRequests.filter(req => req.status !== 'scheduled'),
        [myRequests]
    );

    const handleCalendarDateSelect = (date) => {
        setSelectedDate(date);
        const dateKey = toDateKey(date.year, date.month, date.day);

        if (calendarMarkers[dateKey]?.length) {
            setAppointmentsDateFilter(dateKey);
            setAppointmentMessage(null);
            setActiveTab('appointments');
        }
    };

    const showAllAppointments = () => {
        setAppointmentsDateFilter(null);
        setActiveTab('appointments');
    };

    // Check if the student meets presentation requirements
    const selectedInternship = useMemo(() => {
        return internships.find(i => String(i.id) === String(formInternshipId));
    }, [internships, formInternshipId]);

    const qualifiesForPresentation = useMemo(() => {
        if (!selectedInternship) return false;
        
        const isCancelled = selectedInternship.is_cancelled;
        const isFinalized = selectedInternship.completion_status === 'finalized';
        const hasSelf = selectedInternship.lifecycle?.self_evaluation_submitted;
        const hasSupervisor = selectedInternship.lifecycle?.supervisor_evaluation_submitted;

        return !isCancelled && !isFinalized && hasSelf && hasSupervisor;
    }, [selectedInternship]);

    // Coordinadores activos para consultas generales (R6)
    const activeCoordinators = Array.isArray(generalConfig?.active_coordinators)
        ? generalConfig.active_coordinators
        : [];
    const noActiveCoordinators = isStudent && formPurpose === 'general_consultation' && activeCoordinators.length === 0;

    // Submit Scheduling Request (Student)
    const handleCreateRequest = async (event) => {
        event.preventDefault();
        setRequestMessage(null);
        setSubmitting(true);

        const filteredDates = formPreferredDates.filter(Boolean);
        if (filteredDates.length === 0) {
            setRequestMessage({ type: 'error', text: 'Debes seleccionar al menos una fecha preferida.' });
            setSubmitting(false);
            return;
        }

        try {
            let documentId = null;
            if (formPurpose === 'final_presentation' && slidesFile) {
                // 1. Obtener tipos de documentos
                const docTypes = await documentService.getDocumentTypes();
                const slidesType = findSlidesDocumentType(docTypes);
                if (!slidesType) {
                    throw new Error('No existe un tipo documental para diapositivas de presentación.');
                }
                
                // 2. Subir el documento
                const uploadedDoc = await documentService.uploadDocument(
                    Number(formInternshipId),
                    slidesType.id,
                    slidesFile
                );
                documentId = uploadedDoc.id;
            }

            await schedulingService.createSchedulingRequest({
                purpose: formPurpose,
                internship_id: formPurpose === 'final_presentation' ? Number(formInternshipId) : null,
                target_coordinator_id: formPurpose === 'general_consultation' ? Number(formTargetCoordinatorId) : null,
                message: formMessage || null,
                preferred_dates: filteredDates,
                document_id: documentId,
            });

            showToast({
                type: 'success',
                title: 'Solicitud enviada',
                message: 'Tu solicitud de agendamiento ha sido registrada y está pendiente de respuesta.',
            });

            // Reset form
            setFormMessage('');
            setFormTargetCoordinatorId('');
            setFormPreferredDates(['', '', '']);
            setSlidesFile(null);
            setActiveTab('requests');
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setRequestMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Cancel Request (Student)
    const handleCancelRequest = async (requestId) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) return;
        setSubmitting(true);
        setRequestMessage(null);

        try {
            await schedulingService.cancelRequest(requestId);
            showToast({
                type: 'success',
                title: 'Solicitud cancelada',
                message: 'La solicitud ha sido cancelada correctamente.',
            });
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setRequestMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Cancel Appointment (Student/Coordinator)
    const handleCancelAppointment = async (appointmentId, reason) => {
    setSubmitting(true);
    setAppointmentMessage(null);

    try {
        await schedulingService.cancelAppointment(appointmentId, reason);
        showToast({
            type: 'success',
            title: 'Cita cancelada',
            message: 'La cita agendada ha sido cancelada.',
        });
        // Forzar recarga completa desde cero
        await loadData({ clearPageMessage: false });
        setActiveTab('appointments');
    } catch (error) {
        setAppointmentMessage({ type: 'error', text: getErrorMessage(error) });
    } finally {
        setSubmitting(false);
    }
    };

    const handleConfirmAppointment = async (appointmentId) => {
        setSubmitting(true);
        setAppointmentMessage(null);
        try {
            await schedulingService.confirmAppointment(appointmentId);
            showToast({
                type: 'success',
                title: 'Asistencia confirmada',
                message: 'Tu asistencia a la cita ha sido confirmada exitosamente.',
            });
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setAppointmentMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUploadSlides = async (appointment, file) => {
        if (!file) return;
        setSubmitting(true);
        setAppointmentMessage(null);
        try {
            const docTypes = await documentService.getDocumentTypes();
            const slidesType = findSlidesDocumentType(docTypes);
            if (!slidesType) {
                throw new Error('No existe un tipo documental para diapositivas de presentación.');
            }

            const uploadedDoc = await documentService.uploadDocument(
                appointment.internship_id,
                slidesType.id,
                file
            );

            await schedulingService.updateAppointmentDocument(appointment.id, uploadedDoc.id);

            showToast({
                type: 'success',
                title: 'Diapositivas subidas',
                message: 'Tus diapositivas han sido cargadas y vinculadas exitosamente.',
            });
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setAppointmentMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadDocument = async (doc) => {
        if (!doc?.id) return;
        setSubmitting(true);
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.file_name || doc.name || `${doc.document_type?.name || 'documento'}.${doc.extension || 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            showToast({
                type: 'error',
                title: 'Error de descarga',
                message: 'No se pudo descargar el documento.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Open Cancel/Reschedule modal (reemplaza window.prompt - R7)
    const startCancelAppointment = (appointment) => {
        setCancellingAppointment(appointment);
        setCancelMode('cancel');
        setCancelReason('');
        setAppointmentMessage(null);
    };

    const closeCancelModal = () => {
        setCancellingAppointment(null);
        setCancelReason('');
        setCancelMode('cancel');
    };

    const handleConfirmCancel = async (event) => {
        event.preventDefault();
        if (!cancellingAppointment) return;

        const trimmedReason = cancelReason.trim();
        if (!trimmedReason) {
            setAppointmentMessage({ type: 'error', text: 'Debes indicar una justificación.' });
            return;
        }

        const prefix = cancelMode === 'reschedule'
            ? 'Solicitud de reprogramación:'
            : 'Solicitud de cancelación:';
        const fullReason = `${prefix} ${trimmedReason}`;

        const targetId = cancellingAppointment.id;
        closeCancelModal();
        await handleCancelAppointment(targetId, fullReason);
    };

    // Open Responding dialog (Coordinator)
    const startResponse = (request) => {
        const dates = parsePreferredDates(request.preferred_dates);
        const defaultDate = dates[0] || '';
        
        setRespondingRequest(request);
        setResponseForm({
            date: defaultDate,
            start_time: '09:00',
            end_time: '09:30',
            modality: 'Presencial',
            location: '',
            comments: '',
        });
        setRequestMessage(null);
    };

    // Submit Response (Coordinator)
    const handleSendResponse = async (event) => {
        event.preventDefault();
        if (!respondingRequest) return;

        const trimmedLocation = (responseForm.location || '').trim();
        if (!trimmedLocation) {
            setRequestMessage({ type: 'error', text: 'La ubicación o enlace de reunión es obligatorio.' });
            return;
        }

        setSubmitting(true);
        setRequestMessage(null);

        try {
            await schedulingService.respondToRequest(respondingRequest.id, {
                date: responseForm.date,
                start_time: `${responseForm.start_time}:00`,
                end_time: `${responseForm.end_time}:00`,
                modality: responseForm.modality,
                location: trimmedLocation,
                comments: responseForm.comments || null,
            });

            showToast({
                type: 'success',
                title: 'Cita agendada',
                message: 'Se ha agendado la cita y notificado al estudiante.',
            });

            setRespondingRequest(null);
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setRequestMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Open Rejection dialog (Coordinator)
    const startRejection = (request) => {
        setRejectingRequest(request);
        setRejectionReason('');
        setRequestMessage(null);
    };

    // Submit Rejection (Coordinator)
    const handleSendRejection = async (event) => {
        event.preventDefault();
        if (!rejectingRequest) return;
        if (!rejectionReason.trim()) {
            setRequestMessage({ type: 'error', text: 'Debes indicar un motivo de rechazo.' });
            return;
        }

        setSubmitting(true);
        setRequestMessage(null);

        try {
            await schedulingService.rejectRequest(rejectingRequest.id, rejectionReason);
            showToast({
                type: 'success',
                title: 'Solicitud rechazada',
                message: 'Se ha rechazado la solicitud de agendamiento.',
            });
            setRejectingRequest(null);
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setRequestMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Set Outcome fields
    const setOutcomeField = (appointmentId, field, value) => {
        setOutcomeForms((current) => {
            const currentForm = current[appointmentId] || DEFAULT_OUTCOME_FORM;
            const nextForm = {
                ...currentForm,
                [field]: value,
            };

            if (field === 'attendance_status' && value === 'no_show') {
                nextForm.result = null;
            }

            if (field === 'attendance_status' && value === 'completed' && !nextForm.result) {
                nextForm.result = DEFAULT_OUTCOME_FORM.result;
            }

            if (field !== 'comments' && !shouldShowOutcomeComments(nextForm)) {
                nextForm.comments = '';
            }

            return {
                ...current,
                [appointmentId]: nextForm,
            };
        });
    };

    // Submit Outcome (Coordinator)
    const handleRegisterOutcome = async (appointmentId) => {
        const outcome = outcomeForms[appointmentId] || DEFAULT_OUTCOME_FORM;
        setSubmitting(true);
        setAppointmentMessage(null);

        try {
            await schedulingService.registerAppointmentOutcome(appointmentId, {
                attendance_status: outcome.attendance_status,
                result: outcome.attendance_status === 'no_show' ? null : outcome.result,
                comments: shouldShowOutcomeComments(outcome)
                    ? outcome.comments?.trim() || null
                    : null,
            });
            
            setOutcomeForms((current) => {
                const next = { ...current };
                delete next[appointmentId];
                return next;
            });
            
            showToast({
                type: 'success',
                title: 'Resultado registrado',
                message: 'Se ha registrado el resultado de la cita correctamente.',
            });
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setAppointmentMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const setDirectFormField = (field, value) => {
        setDirectForm((prev) => ({ ...prev, [field]: value }));
        setDirectFormErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    };

    const validateDirectScheduleForm = () => {
        const errors = {};

        if (!directForm.internshipId) {
            errors.internshipId = 'Selecciona la práctica del estudiante.';
        }
        if (!directForm.date) {
            errors.date = 'Selecciona la fecha de la cita.';
        }
        if (!directForm.start_time) {
            errors.start_time = 'Ingresa la hora de inicio.';
        }
        if (!directForm.end_time) {
            errors.end_time = 'Ingresa la hora de término.';
        }
        if (!directForm.location.trim()) {
            errors.location = 'Ingresa la ubicación o enlace de reunión.';
        }

        return errors;
    };

    const handleDirectSchedule = async (event) => {
        event.preventDefault();
        const validationErrors = validateDirectScheduleForm();

        if (Object.keys(validationErrors).length > 0) {
            setDirectFormErrors(validationErrors);
            return;
        }

        setDirectFormErrors({});
        const trimmedLocation = (directForm.location || '').trim();
        if (!trimmedLocation) {
            setDirectFormErrors((current) => ({
                ...current,
                location: 'La ubicación o enlace de reunión es obligatorio.',
            }));
            return;
        }

        setSubmitting(true);
        setAppointmentMessage(null);

        try {
            await schedulingService.scheduleDirectAppointment({
                internship_id: Number(directForm.internshipId),
                date: directForm.date,
                start_time: `${directForm.start_time}:00`,
                end_time: `${directForm.end_time}:00`,
                modality: directForm.modality,
                location: trimmedLocation,
                comments: directForm.comments || null,
            });

            showToast({
                type: 'success',
                title: 'Cita agendada',
                message: 'Se ha agendado la presentación final directamente.',
            });

            setShowDirectScheduleModal(false);
            setDirectFormErrors({});
            setDirectForm({
                internshipId: '',
                date: '',
                start_time: '09:00',
                end_time: '09:30',
                modality: 'Presencial',
                location: '',
                comments: '',
            });
            setActiveTab('appointments');
            setAppointmentsDateFilter(directForm.date);
            await loadData({ clearPageMessage: false });
        } catch (error) {
            setDirectFormErrors((current) => ({
                ...current,
                form: getErrorMessage(error),
            }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={embedded ? 'font-sans' : 'min-h-screen bg-ufro-bg flex flex-col font-sans'}>
            {!embedded && <UserHeader />}

            <motion.main
                className={embedded ? 'flex w-full flex-col' : 'mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-8 sm:px-8'}
                aria-busy={loading}
                variants={ENTRY_CONTAINER_VARIANTS}
                initial="hidden"
                animate="visible"
            >
                {!embedded && (
                    <button
                        onClick={() => navigate(getRedirectPathForRoles(user?.roles))}
                        className="mb-6 flex w-fit items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition"
                    >
                        <ArrowLeft size={16} />
                        Volver al Dashboard
                    </button>
                )}
                {/* Headers */}
                <motion.div
                    className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                    variants={ENTRY_ITEM_VARIANTS}
                >
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
                            Agendar horas y consultas
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {isAdmin
                                ? 'Responde solicitudes de agendamiento y califica resultados de presentaciones.'
                                : 'Solicita horas para consultas generales o presentaciones finales de tus prácticas.'}
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setDirectFormErrors({});
                                setShowDirectScheduleModal(true);
                            }}
                            className="flex items-center gap-2 rounded-2xl bg-[#d22864] hover:bg-[#b01e50] px-5 py-3 font-bold text-white shadow-md shadow-[#d22864]/10 transition"
                        >
                            <CalendarPlus size={18} />
                            Agendar Presentación Directa
                        </button>
                    )}
                </motion.div>

                <motion.div variants={ENTRY_ITEM_VARIANTS}>
                    <InlineMessage message={pageMessage} className="mb-6 shadow-sm" />
                </motion.div>

                <motion.div
                    className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]"
                    variants={ENTRY_CONTAINER_VARIANTS}
                >
                    {/* Agenda mensual independiente de las vistas tabuladas */}
                    <motion.aside
                        className="w-full space-y-4 xl:sticky xl:top-24"
                        variants={ENTRY_ITEM_VARIANTS}
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-[#fff0f6] p-3 text-[#d22864]">
                                <CalendarIcon size={22} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Agenda mensual</h3>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    {formatDisplayDate(selectedDateKey)}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-md sm:p-6">
                            <CalendarView
                                selectedDate={selectedDate}
                                onSelectDate={handleCalendarDateSelect}
                                savedDates={calendarMarkers}
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <StatsCard
                                title="Citas del día"
                                value={selectedDayAppointments.length}
                                icon={Clock}
                            />
                            <StatsCard
                                title="Citas agendadas"
                                value={scheduledAppointmentsCount}
                                icon={CalendarCheck}
                            />
                            <StatsCard
                                title="Días con actividad"
                                value={Object.keys(calendarMarkers).length}
                                icon={CalendarIcon}
                            />
                        </div>
                    </motion.aside>

                    <motion.section
                        className="min-w-0"
                        variants={ENTRY_ITEM_VARIANTS}
                    >
                        {/* Navigation Tabs */}
                        <div className="mb-6 flex overflow-x-auto border-b border-slate-200">
                            {isStudent && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('request')}
                                        className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'request' ? 'border-[#d22864] text-[#d22864]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Solicitar Hora
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('requests')}
                                        className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'requests' ? 'border-[#d22864] text-[#d22864]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Mis Solicitudes ({visibleMyRequests.length})
                                    </button>
                                </>
                            )}
                            {isAdmin && (
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'requests' ? 'border-[#d22864] text-[#d22864]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Solicitudes Pendientes ({pendingRequests.length})
                                </button>
                            )}
                            <button
                                onClick={showAllAppointments}
                                className={`whitespace-nowrap px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'appointments' ? 'border-[#d22864] text-[#d22864]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Citas y resultados ({appointments.length})
                            </button>
                        </div>

                        {/* Main Content Area */}
                        <motion.div
                            className="min-w-0 space-y-6"
                            variants={ENTRY_ITEM_VARIANTS}
                        >
                        {/* TAB 1: Request Scheduling Form (Student only) */}
                        {isStudent && activeTab === 'request' && (
                            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-md">
                                <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
                                    <CalendarPlus className="text-[#d22864]" />
                                    Nueva Solicitud de Agendamiento
                                </h3>
                                <p className="text-sm text-slate-500 mb-6">
                                    Completa la información para proponer tu disponibilidad. El coordinador asignará una hora oficial en base a tus sugerencias.
                                </p>

                                <InlineMessage message={requestMessage} className="mb-5" />

                                <form onSubmit={handleCreateRequest} className="space-y-5">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Propósito del Agendamiento
                                            </label>
                                            <select
                                                value={formPurpose}
                                                onChange={(e) => setFormPurpose(e.target.value)}
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition"
                                            >
                                                <option value="general_consultation">Consulta general presencial</option>
                                                <option value="final_presentation">Entrevista / Presentación final</option>
                                            </select>
                                        </div>

                                        {formPurpose === 'general_consultation' && (
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    Coordinador destinatario
                                                </label>
                                                {activeCoordinators.length === 0 ? (
                                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-semibold p-4 flex gap-2">
                                                        <Info className="h-4 w-4 flex-shrink-0" />
                                                        <span>
                                                            No hay coordinadores con consultas generales habilitadas en este
                                                            momento. Vuelve más tarde o solicita una presentación final.
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={formTargetCoordinatorId}
                                                        onChange={(e) => setFormTargetCoordinatorId(e.target.value)}
                                                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition"
                                                        required
                                                    >
                                                        <option value="" disabled>Selecciona un coordinador</option>
                                                        {activeCoordinators.map((coord) => (
                                                            <option key={coord.id} value={coord.id}>
                                                                {coord.first_name} {coord.last_name} ({coord.role_name || 'Coordinador'})
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        )}
                                        </div>

                                        {formPurpose === 'final_presentation' && (
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                                    Selecciona tu Práctica
                                                </label>
                                                <select
                                                    value={formInternshipId}
                                                    onChange={(e) => setFormInternshipId(e.target.value)}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition"
                                                    required
                                                >
                                                    <option value="" disabled>Selecciona una opción</option>
                                                    {internships.map((internship) => (
                                                        <option key={internship.id} value={internship.id}>
                                                            #{internship.id} · {internship.org_name} ({internship.internship_type})
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                                {/* Requisites feedback */}
                                                {formInternshipId && (
                                                    <div className={`mt-3 p-4 rounded-2xl border text-xs font-semibold ${qualifiesForPresentation ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                                                        <div className="flex gap-2">
                                                            <Info className="h-4 w-4 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-sm">Estado de Requisitos:</p>
                                                                <ul className="mt-2 space-y-1 list-disc list-inside">
                                                                    <li>Autoevaluación del Estudiante: {selectedInternship?.lifecycle?.self_evaluation_submitted ? '✅ Enviada' : '❌ Falta completar'}</li>
                                                                    <li>Evaluación del supervisor a estudiante: {selectedInternship?.lifecycle?.supervisor_evaluation_submitted ? '✅ Enviada' : '❌ Falta completar'}</li>
                                                                    <li>Práctica no cancelada ni finalizada: {selectedInternship && !selectedInternship.is_cancelled && selectedInternship.completion_status !== 'finalized' ? '✅ Sí' : '❌ No'}</li>
                                                                </ul>
                                                                {!qualifiesForPresentation && (
                                                                    <p className="mt-3 font-black text-red-600">
                                                                        ⚠️ No cumples con los prerrequisitos necesarios para agendar la entrevista final.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Fechas Preferidas (Selecciona hasta 3 fechas)
                                        </label>
                                        <div className="grid gap-3 sm:grid-cols-3">
                                        {formPreferredDates.map((dateValue, index) => (
                                            <div 
                                                key={index} 
                                                className="flex items-center w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-[#d22864] focus-within:ring-1 focus-within:ring-[#d22864] transition"
                                            >
                                                {/* El número indicativo */}
                                                <span className="text-sm text-slate-400 font-bold pr-2 select-none flex-shrink-0 leading-none">
                                                    {index + 1}°
                                                </span>
                                                
                                                {/* El input con corrección de altura de línea interna */}
                                                <input
                                                    type="date"
                                                    value={dateValue}
                                                    onChange={(e) => {
                                                        const updated = [...formPreferredDates];
                                                        updated[index] = e.target.value;
                                                        setFormPreferredDates(updated);
                                                    }}
                                                    min={today.toISOString().split('T')[0]}
                                                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none outline-none transition cursor-pointer leading-none h-auto p-0 m-0"
                                                    required={index === 0}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                        <div className="sm:col-span-2 mt-4">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Mensaje u Observaciones (Opcional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formMessage}
                                                onChange={(e) => setFormMessage(e.target.value)}
                                                placeholder="Ej. Prefiero horario de tarde, o consultas específicas sobre mi portafolio."
                                                 className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition"
                                             />
                                         </div>

                                         {formPurpose === 'final_presentation' && (
                                             <div className="sm:col-span-2">
                                                 <label className="block text-sm font-bold text-slate-700 mb-2">
                                                     Diapositivas de Presentación (Opcional)
                                                 </label>
                                                 <div className="mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-6 py-6 transition hover:border-[#d22864] bg-slate-50/50">
                                                     <Upload className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                                                     <div className="flex text-sm text-slate-600 justify-center items-center">
                                                         <label className="relative cursor-pointer rounded-md font-bold text-[#d22864] hover:text-[#b01e50] focus-within:outline-none">
                                                             <span>Subir un archivo</span>
                                                             <input
                                                                 type="file"
                                                                 accept=".ppt,.pptx,.pdf,.doc,.docx"
                                                                 className="sr-only"
                                                                 onChange={(e) => setSlidesFile(e.target.files[0])}
                                                             />
                                                         </label>
                                                         <p className="pl-1">o arrastrar y soltar</p>
                                                     </div>
                                                     <p className="text-xs text-slate-400 mt-1">
                                                         Formatos admitidos: PPT, PPTX, PDF, DOC, DOCX
                                                     </p>
                                                     {slidesFile && (
                                                         <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                                             <FileText size={14} className="text-[#d22864]" />
                                                             <span>{slidesFile.name}</span>
                                                             <button
                                                                 type="button"
                                                                 onClick={() => setSlidesFile(null)}
                                                                 className="text-red-500 hover:text-red-700 font-bold ml-1"
                                                             >
                                                                 ✕
                                                             </button>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         )}
                                     </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || (formPurpose === 'final_presentation' && !qualifiesForPresentation) || noActiveCoordinators}
                                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#d22864] hover:bg-[#b01e50] px-6 py-4 font-bold text-white shadow-md shadow-[#d22864]/10 transition disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <>
                                                <RefreshCw size={18} className="animate-spin" />
                                                Enviando Solicitud...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Enviar Solicitud de Agendamiento
                                            </>
                                        )}
                                    </button>
                                </form>
                            </section>
                        )}

                        {/* TAB 2: List of requests (My requests for Student; Pending requests for Coordinator) */}
                        {activeTab === 'requests' && (
                            <section className="space-y-4">
                                <h3 className="text-xl font-black text-slate-900">
                                    {isAdmin ? 'Solicitudes Pendientes de Estudiantes' : 'Mis Solicitudes de Agendamiento'}
                                </h3>

                                <InlineMessage message={requestMessage} />

                                {isAdmin && pendingRequests.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500 text-sm">
                                        No hay solicitudes pendientes en este momento.
                                    </div>
                                )}

                                {isStudent && myRequests.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500 text-sm">
                                        No has realizado solicitudes de agendamiento.
                                    </div>
                                )}

                                {isStudent && visibleMyRequests.map((req) => {
                                    const preferredDatesList = parsePreferredDates(req.preferred_dates);
                                    return (
                                        <div key={req.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">
                                                        {purposeLabel(req.purpose)}
                                                    </h4>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Creada el: {req.created_at ? formatDisplayDate(req.created_at.split('T')[0]) : ''}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRequestStatusBadgeClasses(req.status)}`}>
                                                    {REQUEST_STATUS_LABELS[req.status] || req.status}
                                                </span>
                                            </div>

                                            {req.internship_id && (
                                                <p className="text-sm text-slate-600 font-semibold">
                                                    Asociada a Práctica ID #{req.internship_id}
                                                </p>
                                            )}

                                            <div className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fechas sugeridas:</p>
                                                <p className="text-slate-700 font-medium">
                                                    {preferredDatesList.map(d => formatDisplayDate(d)).join('  |  ')}
                                                </p>
                                            </div>

                                            {req.message && (
                                                <div className="text-sm">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mi mensaje:</p>
                                                    <p className="text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 italic">
                                                        "{req.message}"
                                                    </p>
                                                </div>
                                            )}

                                            {req.coordinator_response && (
                                                <div className={`text-sm p-4 rounded-xl border ${req.status === 'rejected' ? 'bg-red-50/50 border-red-100 text-red-900' : 'bg-green-50/50 border-green-100 text-green-900'}`}>
                                                    <p className="text-xs font-black uppercase tracking-wider mb-1">
                                                        Respuesta del {req.resolved_by_role === 'Director' ? 'Director' : 'Coordinador'}:
                                                    </p>
                                                    <p className="italic">"{req.coordinator_response}"</p>
                                                </div>
                                            )}

                                            {req.status === 'pending' && (
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleCancelRequest(req.id)}
                                                        disabled={submitting}
                                                        className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl px-4 py-2 transition"
                                                    >
                                                        Cancelar Solicitud
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Coordinator Request Cards */}
                                {isAdmin && pendingRequests.map((req) => {
                                    const preferredDatesList = parsePreferredDates(req.preferred_dates);
                                    return (
                                        <div key={req.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">
                                                        {purposeLabel(req.purpose)}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 font-semibold mt-1">
                                                        Estudiante: {req.student?.first_name} {req.student?.last_name} ({req.student?.email})
                                                    </p>
                                                    {req.internship && (
                                                        <p className="text-xs text-[#d22864] font-bold mt-1">
                                                            Empresa: {req.internship.org_name} · Práctica #{req.internship_id}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                                                    Pendiente
                                                </span>
                                            </div>

                                            <div className="text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fechas preferidas propuestas:</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {preferredDatesList.map((d, i) => (
                                                        <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 shadow-xs">
                                                            {formatDisplayDate(d)}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {req.message && (
                                                <div className="text-sm">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mensaje del estudiante:</p>
                                                    <p className="text-slate-600 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 italic">
                                                        "{req.message}"
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => startResponse(req)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl px-4 py-2.5 transition shadow-sm"
                                                >
                                                    <Check size={14} /> Agendar Cita
                                                </button>
                                                <button
                                                    onClick={() => startRejection(req)}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl px-4 py-2.5 transition"
                                                >
                                                    <X size={14} /> Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        )}

                        {/* TAB 3: Confirmed Appointments (Citas agendadas) */}
                        {activeTab === 'appointments' && (
                            <section className="space-y-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">
                                            Citas confirmadas y resultados
                                        </h3>
                                        {appointmentsDateFilter && (
                                            <p className="mt-1 text-sm font-semibold text-slate-500">
                                                {formatDisplayDate(appointmentsDateFilter)}
                                            </p>
                                        )}
                                    </div>
                                    {appointmentsDateFilter && (
                                        <button
                                            type="button"
                                            onClick={showAllAppointments}
                                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-[#d22864] hover:text-[#d22864] sm:w-auto"
                                        >
                                            Ver todas las citas
                                        </button>
                                    )}
                                </div>

                                <InlineMessage message={appointmentMessage} />

                                {orderedAppointments.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500 text-sm">
                                        {appointmentsDateFilter
                                            ? 'No hay citas registradas para el día seleccionado.'
                                            : 'No tienes citas confirmadas ni resultados registrados.'}
                                    </div>
                                )}

                                {orderedAppointments.map((appointment) => (
                                    <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">
                                                    {purposeLabel(appointment.purpose)}
                                                </h4>
                                                <p className="text-sm font-semibold text-slate-600 mt-1">
                                                    {formatDisplayDate(appointment.date)} · {formatSlotTime(appointment)}
                                                </p>
                                                {isAdmin && appointment.student && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Estudiante: {appointment.student.first_name} {appointment.student.last_name} ({appointment.student.email})
                                                    </p>
                                                )}
                                                {isStudent && appointment.owner && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        Organizado por: {appointment.owner.first_name} {appointment.owner.last_name}
                                                        {appointment.owner.role_name ? ` (${appointment.owner.role_name})` : ''}
                                                    </p>
                                                )}
                                                {appointment.internship_id && (
                                                    <p className="text-xs text-[#d22864] font-bold mt-1">
                                                        Práctica ID #{appointment.internship_id}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClasses(appointment.status)}`}>
                                                    {STATUS_LABELS[appointment.status] || appointment.status}
                                                </span>
                                                {appointment.result && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getResultBadgeClasses(appointment.result)}`}>
                                                        {RESULT_LABELS[appointment.result] || appointment.result}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {appointment.location && (
                                            <p className="text-sm flex items-center gap-1.5 text-slate-500">
                                                <MapPin size={14} className="text-slate-400" />
                                                <span>Ubicación: {appointment.location}</span>
                                            </p>
                                        )}

                                        {appointment.comments && (
                                            <div className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Notas / Comentarios:</p>
                                                <p className="text-slate-600 italic">"{appointment.comments}"</p>
                                             </div>
                                         )}

                                         {/* Material y Confirmación de Asistencia */}
                                         {appointment.purpose === 'final_presentation' && (
                                             <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                                                 {/* Documento (Diapositivas) */}
                                                 <div className="flex flex-col gap-1">
                                                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diapositivas de Presentación</span>
                                                     {appointment.document ? (
                                                         <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-fit">
                                                             <FileText size={15} className="text-[#d22864] flex-shrink-0" />
                                                             <span className="text-xs font-semibold text-slate-700 max-w-[200px] truncate">{appointment.document.name || 'diapositivas'}</span>
                                                             <button
                                                                 type="button"
                                                                 onClick={() => handleDownloadDocument(appointment.document)}
                                                                 className="text-slate-400 hover:text-[#d22864] transition p-1"
                                                                 title="Descargar diapositivas"
                                                             >
                                                                 <Download size={14} />
                                                             </button>
                                                         </div>
                                                     ) : (
                                                         <div className="flex items-center gap-2">
                                                             {isStudent && appointment.status === 'scheduled' ? (
                                                                 <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#d22864] bg-[#d22864]/5 hover:bg-[#d22864]/10 border border-[#d22864]/20 rounded-xl px-3 py-2 transition">
                                                                     <Upload size={13} />
                                                                     <span>Subir Diapositivas</span>
                                                                     <input
                                                                         type="file"
                                                                         accept=".ppt,.pptx,.pdf,.doc,.docx"
                                                                         className="sr-only"
                                                                         onChange={(e) => handleUploadSlides(appointment, e.target.files[0])}
                                                                     />
                                                                 </label>
                                                             ) : (
                                                                 <span className="text-xs text-slate-400 italic">No se han subido diapositivas</span>
                                                             )}
                                                         </div>
                                                     )}
                                                 </div>

                                                 {/* Confirmación de Asistencia */}
                                                 <div className="flex flex-col gap-1 items-end">
                                                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmación de Asistencia</span>
                                                     {appointment.is_confirmed ? (
                                                         <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                                                             <CheckCircle2 size={13} className="text-emerald-600" />
                                                             Asistencia Confirmada
                                                         </span>
                                                     ) : (
                                                         <div className="flex items-center gap-2">
                                                             {isStudent && appointment.status === 'scheduled' ? (
                                                                 <button
                                                                     onClick={() => handleConfirmAppointment(appointment.id)}
                                                                     disabled={submitting}
                                                                     className="flex items-center justify-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl px-3 py-2 transition shadow-sm"
                                                                 >
                                                                     {submitting ? (
                                                                         <>
                                                                             <RefreshCw size={13} className="animate-spin" />
                                                                             Confirmando...
                                                                         </>
                                                                     ) : (
                                                                         <>
                                                                             <Check size={13} /> Confirmar Asistencia
                                                                         </>
                                                                     )}
                                                                 </button>
                                                             ) : (
                                                                 <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                                                     Pendiente de Confirmación
                                                                 </span>
                                                             )}
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         )}

                                        {/* Coordinator Registers Outcome */}
                                        {isAdmin && appointment.status === 'scheduled' && (
                                            <div className="mt-4 p-4 border border-slate-100 bg-slate-50 rounded-2xl space-y-4">
                                                <p className="text-sm font-bold text-slate-800">Registrar Asistencia y Calificación:</p>
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Asistencia</label>
                                                        <select
                                                            value={outcomeForms[appointment.id]?.attendance_status || DEFAULT_OUTCOME_FORM.attendance_status}
                                                            onChange={(e) => setOutcomeField(appointment.id, 'attendance_status', e.target.value)}
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#d22864]"
                                                        >
                                                            {APPOINTMENT_STATUS_OPTIONS.map(opt => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {outcomeForms[appointment.id]?.attendance_status !== 'no_show' && (
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Calificación</label>
                                                            <select
                                                                value={outcomeForms[appointment.id]?.result || DEFAULT_OUTCOME_FORM.result}
                                                                onChange={(e) => setOutcomeField(appointment.id, 'result', e.target.value)}
                                                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#d22864]"
                                                            >
                                                                {RESULT_OPTIONS.map(opt => (
                                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Observaciones</label>
                                                        <textarea
                                                            rows={2}
                                                            value={outcomeForms[appointment.id]?.comments || ''}
                                                            onChange={(e) => setOutcomeField(appointment.id, 'comments', e.target.value)}
                                                            placeholder={outcomeForms[appointment.id]?.attendance_status === 'no_show' ? 'Indica detalles de la inasistencia...' : 'Observaciones de la evaluación...'}
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#d22864]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleRegisterOutcome(appointment.id)}
                                                        disabled={submitting}
                                                        className="text-xs font-bold text-white bg-[#d22864] hover:bg-[#b01e50] rounded-xl px-4 py-2 transition flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        {submitting ? (
                                                            <>
                                                                <RefreshCw size={13} className="animate-spin" />
                                                                Guardando...
                                                            </>
                                                        ) : (
                                                            'Confirmar Resultado'
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => startCancelAppointment(appointment)}
                                                        disabled={submitting}
                                                        className="text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl px-4 py-2 border border-transparent transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                    >
                                                        Cancelar Cita
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Student cancels appointment */}
                                        {isStudent && appointment.status === 'scheduled' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => startCancelAppointment(appointment)}
                                                    disabled={submitting}
                                                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl px-4 py-2 transition"
                                                >
                                                    Solicitar Cancelación o Modificación
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}
                        </motion.div>
                    </motion.section>
                </motion.div>
            </motion.main>

            {/* DIALOGS AND MODALS */}

            {/* Modal: Agendar / Responder Solicitud */}
            {respondingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
                    <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xl font-black text-slate-900">
                                Agendar Cita
                            </h3>
                            <button onClick={() => setRespondingRequest(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-sm bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                            <p className="font-bold text-slate-800">Solicitud: {purposeLabel(respondingRequest.purpose)}</p>
                            <p className="text-slate-500">Estudiante: {respondingRequest.student?.first_name} {respondingRequest.student?.last_name}</p>
                            <p className="text-slate-500 text-xs">
                                Fechas sugeridas: {parsePreferredDates(respondingRequest.preferred_dates).map(d => formatDisplayDate(d)).join(', ')}
                            </p>
                        </div>

                        <InlineMessage message={requestMessage} />

                        <form onSubmit={handleSendResponse} className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Fecha Asignada</label>
                                    <input
                                        type="date"
                                        value={responseForm.date}
                                        onChange={(e) => setResponseForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Hora Inicio</label>
                                    <input
                                        type="time"
                                        value={responseForm.start_time}
                                        onChange={(e) => setResponseForm(prev => ({ ...prev, start_time: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Hora Término</label>
                                    <input
                                        type="time"
                                        value={responseForm.end_time}
                                        onChange={(e) => setResponseForm(prev => ({ ...prev, end_time: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Modalidad</label>
                                    <select
                                        value={responseForm.modality}
                                        onChange={(e) => setResponseForm(prev => ({ ...prev, modality: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
                                    >
                                        {MODALITY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Ubicación / Enlace de Reunión</label>
                                    <input
                                        type="text"
                                        value={responseForm.location}
                                        onChange={(e) => setResponseForm(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="Ej. Oficina 302, o link de Teams / Meet"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-[#d22864] outline-none transition"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Comentarios o Instrucciones</label>
                                    <textarea
                                        rows={2}
                                        value={responseForm.comments}
                                        onChange={(e) => setResponseForm(prev => ({ ...prev, comments: e.target.value }))}
                                        placeholder="Mensaje aclaratorio para el estudiante..."
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => setRespondingRequest(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Agendando...
                                        </>
                                    ) : (
                                        'Confirmar y Agendar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Modal: Rechazar Solicitud */}
            {rejectingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
                    <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xl font-black text-slate-900">
                                Rechazar Solicitud
                            </h3>
                            <button onClick={() => setRejectingRequest(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-sm text-slate-600">
                            Estás por rechazar la solicitud de consulta/presentación de <strong>{rejectingRequest.student?.first_name} {rejectingRequest.student?.last_name}</strong>.
                        </div>

                        <InlineMessage message={requestMessage} />

                        <form onSubmit={handleSendRejection} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Motivo de Rechazo</label>
                                <textarea
                                    rows={3}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explica detalladamente por qué se rechaza la solicitud (ej. no cumple con el informe final, proponer otras fechas por correo, etc.)"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-[#d22864] outline-none transition"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setRejectingRequest(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-bold text-white transition shadow-sm"
                                >
                                    Rechazar Solicitud
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Modal: Solicitar cancelación o modificación (R7) */}
            {cancellingAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
                    <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xl font-black text-slate-900">
                                Solicitar cancelación o modificación
                            </h3>
                            <button onClick={closeCancelModal} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-sm text-slate-600">
                            Indica qué acción solicitas sobre tu cita del{' '}
                            <strong>{formatDisplayDate(cancellingAppointment.date)}</strong> a las{' '}
                            <strong>{formatSlotTime(cancellingAppointment)}</strong>. La coordinación revisará tu solicitud.
                        </div>

                        <InlineMessage message={appointmentMessage} />

                        <form onSubmit={handleConfirmCancel} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCancelMode('cancel')}
                                    className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition text-left ${
                                        cancelMode === 'cancel'
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <XCircle className="h-5 w-5 mb-1" />
                                    Cancelar Cita
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCancelMode('reschedule')}
                                    className={`rounded-2xl border-2 px-4 py-3 text-sm font-bold transition text-left ${
                                        cancelMode === 'reschedule'
                                            ? 'border-[#d22864] bg-[#fff0f6] text-[#d22864]'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    <Clock className="h-5 w-5 mb-1" />
                                    Solicitar Reprogramación
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">
                                    Justificación
                                </label>
                                <textarea
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder={
                                        cancelMode === 'reschedule'
                                            ? 'Explica por qué necesitas reprogramar y, si lo sabes, fechas alternativas.'
                                            : 'Explica el motivo de la cancelación de la cita.'
                                    }
                                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition"
                                    required
                                />
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    type="button"
                                    onClick={closeCancelModal}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition shadow-sm disabled:opacity-60 flex items-center justify-center gap-1.5 ${
                                        cancelMode === 'reschedule'
                                            ? 'bg-[#d22864] hover:bg-[#b01e50]'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        cancelMode === 'reschedule' ? 'Enviar Solicitud' : 'Confirmar Cancelación'
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {/* Modal: Agendar Presentación Directamente (Coordinador/Director) */}
            {showDirectScheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
                    <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xl font-black text-slate-900">
                                Agendar Presentación Directa
                            </h3>
                            <button
                                onClick={() => {
                                    setDirectFormErrors({});
                                    setShowDirectScheduleModal(false);
                                }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleDirectSchedule} noValidate className="space-y-4">
                            {directFormErrors.form && (
                                <InlineMessage message={{ type: 'error', text: directFormErrors.form }} />
                            )}

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Selecciona la Práctica del Estudiante
                                    </label>
                                    <select
                                        value={directForm.internshipId}
                                        onChange={(e) => setDirectFormField('internshipId', e.target.value)}
                                        aria-invalid={Boolean(directFormErrors.internshipId)}
                                        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition ${directFormErrors.internshipId ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                    >
                                        <option value="" disabled>Selecciona una práctica</option>
                                        {internships.map((internship) => (
                                            <option key={internship.id} value={internship.id}>
                                                #{internship.id} · {internship.student?.first_name} {internship.student?.last_name} · {internship.org_name} ({internship.internship_type})
                                            </option>
                                        ))}
                                    </select>
                                    {directFormErrors.internshipId && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">{directFormErrors.internshipId}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Fecha de la Cita</label>
                                    <input
                                        type="date"
                                        value={directForm.date}
                                        onChange={(e) => setDirectFormField('date', e.target.value)}
                                        min={today.toISOString().split('T')[0]}
                                        aria-invalid={Boolean(directFormErrors.date)}
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition ${directFormErrors.date ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                    />
                                    {directFormErrors.date && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">{directFormErrors.date}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Hora Inicio</label>
                                    <input
                                        type="time"
                                        value={directForm.start_time}
                                        onChange={(e) => setDirectFormField('start_time', e.target.value)}
                                        aria-invalid={Boolean(directFormErrors.start_time)}
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition ${directFormErrors.start_time ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                    />
                                    {directFormErrors.start_time && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">{directFormErrors.start_time}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Hora Término</label>
                                    <input
                                        type="time"
                                        value={directForm.end_time}
                                        onChange={(e) => setDirectFormField('end_time', e.target.value)}
                                        aria-invalid={Boolean(directFormErrors.end_time)}
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition ${directFormErrors.end_time ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                    />
                                    {directFormErrors.end_time && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">{directFormErrors.end_time}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Modalidad</label>
                                    <select
                                        value={directForm.modality}
                                        onChange={(e) => setDirectFormField('modality', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
                                    >
                                        {MODALITY_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Ubicación / Enlace de Reunión</label>
                                    <input
                                        type="text"
                                        value={directForm.location}
                                        onChange={(e) => setDirectFormField('location', e.target.value)}
                                        placeholder="Ej. Oficina 302, o link de Teams / Meet"
                                        aria-invalid={Boolean(directFormErrors.location)}
                                        className={`w-full rounded-xl border px-3 py-2.5 text-sm text-slate-800 focus:border-[#d22864] outline-none transition ${directFormErrors.location ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                    />
                                    {directFormErrors.location && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">{directFormErrors.location}</p>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Comentarios o Notas</label>
                                    <textarea
                                        rows={2}
                                        value={directForm.comments}
                                        onChange={(e) => setDirectFormField('comments', e.target.value)}
                                        placeholder="Comentarios adicionales sobre la presentación..."
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:border-[#d22864] outline-none transition"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDirectFormErrors({});
                                        setShowDirectScheduleModal(false);
                                    }}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-[#d22864] hover:bg-[#b01e50] text-sm font-bold text-white transition shadow-sm flex items-center justify-center gap-1.5"
                                >
                                    {submitting ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Agendando...
                                        </>
                                    ) : (
                                        'Agendar Cita'
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {!embedded && <Footer />}
        </div>
    );
};
