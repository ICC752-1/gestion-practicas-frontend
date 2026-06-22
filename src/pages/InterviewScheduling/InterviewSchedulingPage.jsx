import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
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
    Sliders,
    Settings,
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { CalendarView } from '../../components/InterviewScheduling/CalendarView';
import { StatsCard } from '../../components/InterviewScheduling/StatsCard';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import { internshipService } from '../../services/internshipService';
import { schedulingService } from '../../services/schedulingService';

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

    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail?.pending_requirements) && detail.pending_requirements.length > 0) {
        return `${detail.message} ${detail.pending_requirements.join('. ')}.`;
    }
    if (detail?.message) return detail.message;

    return 'No se pudo completar la operación. Intenta nuevamente.';
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
        } catch (e) {
            return [];
        }
    }
    return [];
};

export const InterviewSchedulingPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const today = useMemo(() => new Date(), []);
    const roleNames = useMemo(() => getRoleNames(user), [user]);
    const isAdmin = roleNames.some((role) => ADMIN_ROLES.has(role));
    const isStudent = roleNames.includes('Estudiante');

    const [selectedDate, setSelectedDate] = useState(dateToCalendarValue(today));
    const [appointments, setAppointments] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [internships, setInternships] = useState([]);
    const [generalConfig, setGeneralConfig] = useState({ general_consultations_enabled: false });

    // UI States
    const [activeTab, setActiveTab] = useState(isStudent ? 'request' : 'requests');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // Student Form State
    const [formPurpose, setFormPurpose] = useState('general_consultation');
    const [formInternshipId, setFormInternshipId] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [formPreferredDates, setFormPreferredDates] = useState(['', '', '']);

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

    const selectedDateKey = toDateKey(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
    );

    // Load data from endpoints
    const loadData = useCallback(async ({ clearMessage = true } = {}) => {
        setLoading(true);
        if (clearMessage) {
            setMessage(null);
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
                        } catch (e) {
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
            }
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
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

    // Sort appointments chronologically
    const orderedAppointments = useMemo(() => {
        return [...appointments].sort((a, b) => {
            const cmp = a.date.localeCompare(b.date);
            if (cmp !== 0) return cmp;
            return a.start_time.localeCompare(b.start_time);
        });
    }, [appointments]);

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

    // Submit Scheduling Request (Student)
    const handleCreateRequest = async (event) => {
        event.preventDefault();
        setMessage(null);
        setSubmitting(true);

        const filteredDates = formPreferredDates.filter(Boolean);
        if (filteredDates.length === 0) {
            setMessage({ type: 'error', text: 'Debes seleccionar al menos una fecha preferida.' });
            setSubmitting(false);
            return;
        }

        try {
            await schedulingService.createSchedulingRequest({
                purpose: formPurpose,
                internship_id: formPurpose === 'final_presentation' ? Number(formInternshipId) : null,
                message: formMessage || null,
                preferred_dates: filteredDates,
            });

            showToast({
                type: 'success',
                title: 'Solicitud enviada',
                message: 'Tu solicitud de agendamiento ha sido registrada y está pendiente de respuesta.',
            });

            // Reset form
            setFormMessage('');
            setFormPreferredDates(['', '', '']);
            setActiveTab('requests');
            await loadData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Cancel Request (Student)
    const handleCancelRequest = async (requestId) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) return;
        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.cancelRequest(requestId);
            showToast({
                type: 'success',
                title: 'Solicitud cancelada',
                message: 'La solicitud ha sido cancelada correctamente.',
            });
            await loadData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Cancel Appointment (Student/Coordinator)
    const handleCancelAppointment = async (appointmentId) => {
        const reason = window.prompt('Indica el motivo de cancelación de la cita:');
        if (reason === null) return; // user cancelled prompt

        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.cancelAppointment(appointmentId, reason);
            showToast({
                type: 'success',
                title: 'Cita cancelada',
                message: 'La cita agendada ha sido cancelada.',
            });
            await loadData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle General Consultations (Coordinator)
    const handleToggleConsultations = async (enabled) => {
        setMessage(null);
        try {
            await schedulingService.updateSchedulingConfig({ general_consultations_enabled: enabled });
            setGeneralConfig(prev => ({ ...prev, general_consultations_enabled: enabled }));
            showToast({
                type: 'success',
                title: 'Configuración actualizada',
                message: enabled 
                    ? 'Has habilitado las consultas generales en tu agenda.' 
                    : 'Has deshabilitado las consultas generales en tu agenda.',
            });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        }
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
        setMessage(null);
    };

    // Submit Response (Coordinator)
    const handleSendResponse = async (event) => {
        event.preventDefault();
        if (!respondingRequest) return;
        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.respondToRequest(respondingRequest.id, {
                date: responseForm.date,
                start_time: `${responseForm.start_time}:00`,
                end_time: `${responseForm.end_time}:00`,
                modality: responseForm.modality,
                location: responseForm.location || null,
                comments: responseForm.comments || null,
            });

            showToast({
                type: 'success',
                title: 'Cita agendada',
                message: 'Se ha agendado la cita y notificado al estudiante.',
            });

            setRespondingRequest(null);
            await loadData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    // Open Rejection dialog (Coordinator)
    const startRejection = (request) => {
        setRejectingRequest(request);
        setRejectionReason('');
        setMessage(null);
    };

    // Submit Rejection (Coordinator)
    const handleSendRejection = async (event) => {
        event.preventDefault();
        if (!rejectingRequest) return;
        if (!rejectionReason.trim()) {
            setMessage({ type: 'error', text: 'Debes indicar un motivo de rechazo.' });
            return;
        }

        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.rejectRequest(rejectingRequest.id, rejectionReason);
            showToast({
                type: 'success',
                title: 'Solicitud rechazada',
                message: 'Se ha rechazado la solicitud de agendamiento.',
            });
            setRejectingRequest(null);
            await loadData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
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

            if (!shouldShowOutcomeComments(nextForm)) {
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
        setMessage(null);

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
            await loadData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-ufro-bg flex flex-col font-sans">
            <UserHeader />

            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-8 sm:px-8">
                {/* Headers */}
                <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
                            Agendamiento de Citas
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {isAdmin
                                ? 'Responde solicitudes de agendamiento y califica resultados de presentaciones.'
                                : 'Solicita horas para consultas generales o presentaciones finales de tus prácticas.'}
                        </p>
                    </div>
                    {/* Quick Stats / Controls */}
                    {isAdmin && (
                        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <Settings className="text-[#d22864] h-5 w-5" />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultas Generales</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`h-2.5 w-2.5 rounded-full ${generalConfig.general_consultations_enabled ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                    <button 
                                        onClick={() => handleToggleConsultations(!generalConfig.general_consultations_enabled)}
                                        className="text-sm font-bold text-slate-700 hover:text-[#d22864] transition"
                                    >
                                        {generalConfig.general_consultations_enabled ? 'Habilitadas (Desactivar)' : 'Deshabilitadas (Activar)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notifications Panel */}
                {message && (
                    <div
                        className={[
                            'mb-6 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold shadow-sm',
                            message.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-800'
                                : 'border-red-200 bg-red-50 text-red-800',
                        ].join(' ')}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle2 className="text-green-600 h-5 w-5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="text-red-600 h-5 w-5 flex-shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Navigation Tabs */}
                <div className="mb-6 flex border-b border-slate-200">
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
                                Mis Solicitudes ({myRequests.length})
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
                        onClick={() => setActiveTab('appointments')}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'appointments' ? 'border-[#d22864] text-[#d22864]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Citas Agendadas ({appointments.length})
                    </button>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    
                    {/* Sidebar: Calendar & Stats */}
                    <aside className="space-y-4 xl:sticky xl:top-24">
                        <CalendarView
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            savedDates={calendarMarkers}
                        />

                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                            <StatsCard
                                title="Citas del Día"
                                value={selectedDayAppointments.length}
                                icon={Clock}
                            />
                            <StatsCard
                                title="Días con Actividad"
                                value={Object.keys(calendarMarkers).length}
                                icon={CalendarIcon}
                            />
                        </section>
                    </aside>

                    {/* Main Content Area */}
                    <div className="min-w-0 space-y-6">

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
                                                                    <li>Evaluación del Supervisor: {selectedInternship?.lifecycle?.supervisor_evaluation_submitted ? '✅ Enviada' : '❌ Falta completar'}</li>
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
                                                    <div key={index} className="relative">
                                                        <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">{index + 1}°</span>
                                                        <input
                                                            type="date"
                                                            value={dateValue}
                                                            onChange={(e) => {
                                                                const updated = [...formPreferredDates];
                                                                updated[index] = e.target.value;
                                                                setFormPreferredDates(updated);
                                                            }}
                                                            min={today.toISOString().split('T')[0]}
                                                            className="w-full rounded-2xl border border-slate-200 bg-white pl-8 pr-3 py-3 text-sm focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition"
                                                            required={index === 0}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Mensaje u Observaciones (Opcional)
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formMessage}
                                                onChange={(e) => setFormMessage(e.target.value)}
                                                placeholder="Ej. Prefiero horario de tarde, o consultas específicas sobre mi portafolio."
                                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[#d22864] focus:ring-1 focus:ring-[#d22864] outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || (formPurpose === 'final_presentation' && !qualifiesForPresentation)}
                                        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#d22864] hover:bg-[#b01e50] px-6 py-4 font-bold text-white shadow-md shadow-[#d22864]/10 transition disabled:opacity-60"
                                    >
                                        <Send size={18} />
                                        Enviar Solicitud de Agendamiento
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

                                {isStudent && myRequests.map((req) => {
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
                                                    <p className="text-xs font-black uppercase tracking-wider mb-1">Respuesta del Coordinador:</p>
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
                                <h3 className="text-xl font-black text-slate-900">
                                    Citas Confirmadas en el Sistema
                                </h3>

                                {appointments.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500 text-sm">
                                        No tienes citas confirmadas registradas.
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
                                                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#d22864]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleRegisterOutcome(appointment.id)}
                                                        disabled={submitting}
                                                        className="text-xs font-bold text-white bg-[#d22864] hover:bg-[#b01e50] rounded-xl px-4 py-2 transition"
                                                    >
                                                        Confirmar Resultado
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                        disabled={submitting}
                                                        className="text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl px-4 py-2 border border-transparent transition"
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
                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                    disabled={submitting}
                                                    className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl px-4 py-2 transition"
                                                >
                                                    Solicitar Cancelación
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        )}
                    </div>
                </div>
            </main>

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
                                Fechas sugeridas: {JSON.parse(respondingRequest.preferred_dates || '[]').map(d => formatDisplayDate(d)).join(', ')}
                            </p>
                        </div>

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
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
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
                                    className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-sm font-bold text-white transition shadow-sm"
                                >
                                    Confirmar y Agendar
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

                        <form onSubmit={handleSendRejection} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Motivo de Rechazo</label>
                                <textarea
                                    rows={3}
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explica detalladamente por qué se rechaza la solicitud (ej. no cumple con el informe final, proponer otras fechas por correo, etc.)"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#d22864] outline-none transition"
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

            <Footer />
        </div>
    );
};
