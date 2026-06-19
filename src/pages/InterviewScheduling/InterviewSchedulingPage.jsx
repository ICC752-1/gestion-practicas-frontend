import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    Calendar as CalendarIcon,
    CalendarCheck,
    CheckCircle2,
    Clock,
    MapPin,
    Pencil,
    RefreshCw,
    Send,
    Trash2,
    XCircle,
} from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { CalendarView } from '../../components/InterviewScheduling/CalendarView';
import { StatsCard } from '../../components/InterviewScheduling/StatsCard';
import { useAuth } from '../../context/useAuth';
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
    { value: 'initial_interview', label: 'Entrevista inicial' },
    { value: 'final_presentation', label: 'Presentación final' },
];

const MODALITY_OPTIONS = ['Presencial', 'Remoto', 'Híbrido'];

const DEFAULT_AVAILABILITY_FORM = {
    start_time: '09:00',
    end_time: '12:00',
    duration_minutes: 30,
    modality: 'Presencial',
    purpose: 'initial_interview',
    location: '',
    comments: '',
};

const toDateKey = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const dateToCalendarValue = (date) => ({
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
});

const dateKeyToCalendarValue = (dateKey) => {
    const [year, month, day] = dateKey.split('-').map(Number);

    return {
        year,
        month: month - 1,
        day,
    };
};

const formatDisplayDate = (dateValue) => {
    if (!dateValue) return '';

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${dateValue}T00:00:00`));
};

const formatSlotTime = (slot) =>
    `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;

const getDurationMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
};

const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (typeof detail === 'string') return detail;
    if (detail?.message) return detail.message;

    return 'No se pudo completar la operación. Intenta nuevamente.';
};

const getRoleNames = (user) => {
    if (!Array.isArray(user?.roles)) return [];

    return user.roles
        .map((role) => (typeof role === 'string' ? role : role?.role?.name))
        .filter(Boolean);
};

const purposeLabel = (purpose) =>
    PURPOSE_OPTIONS.find((option) => option.value === purpose)?.label || purpose;

const SlotButton = ({ slot, disabled, label, onClick }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={[
            'w-full rounded-xl border p-4 text-left transition',
            disabled
                ? 'border-gray-200 bg-gray-50 text-gray-400'
                : 'border-gray-200 bg-white hover:border-brand-medium hover:bg-brand-medium/5',
        ].join(' ')}
    >
        <div className="flex items-start justify-between gap-3">
            <div>
                <p className="font-bold text-slate-900">{formatSlotTime(slot)}</p>
                <p className="mt-1 text-sm text-slate-500">
                    {purposeLabel(slot.purpose)} · {slot.modality}
                </p>
                {slot.location && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} /> {slot.location}
                    </p>
                )}
            </div>
            <span className="rounded-lg bg-brand-medium px-3 py-1 text-xs font-bold text-white">
                {label}
            </span>
        </div>
    </button>
);

const AppointmentItem = ({
    appointment,
    isAdmin,
    isHighlighted,
    cancelReason,
    onCancelReasonChange,
    onCancel,
    onStartReschedule,
    isRescheduling,
}) => (
    <div
        className={[
            'rounded-xl border p-4 transition',
            isHighlighted
                ? 'border-green-300 bg-green-50/80 shadow-md shadow-green-100'
                : 'border-gray-200 bg-white',
        ].join(' ')}
    >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900">
                        {purposeLabel(appointment.purpose)}
                    </p>
                    {isHighlighted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                            <CheckCircle2 size={13} /> Confirmada
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                    {formatDisplayDate(appointment.date)} · {formatSlotTime(appointment)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Práctica #{appointment.internship_id || 'sin asignar'}
                </p>
                {appointment.location && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={13} /> {appointment.location}
                    </p>
                )}
            </div>

            <div className="flex w-full flex-col gap-2 md:w-64">
                {isAdmin && (
                    <input
                        type="text"
                        value={cancelReason}
                        onChange={(event) =>
                            onCancelReasonChange(appointment.id, event.target.value)
                        }
                        placeholder="Motivo de cancelación"
                        className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-medium"
                    />
                )}

                <div className="flex gap-2">
                    {!isAdmin && (
                        <button
                            type="button"
                            onClick={() => onStartReschedule(appointment.id)}
                            className={[
                                'flex-1 rounded-xl px-3 py-2 text-sm font-bold transition',
                                isRescheduling
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-gray-100 text-slate-700 hover:bg-gray-200',
                            ].join(' ')}
                        >
                            Reprogramar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onCancel(appointment.id)}
                        className="flex-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    </div>
);

const BookingConfirmation = ({ appointment, onDismiss }) => (
    <section className="rounded-2xl border border-green-200 bg-white p-5 shadow-md ring-1 ring-green-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                    <CalendarCheck size={24} />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-wider text-green-700">
                        Cita confirmada
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-900">
                        {purposeLabel(appointment.purpose)}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                        {formatDisplayDate(appointment.date)} · {formatSlotTime(appointment)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Práctica #{appointment.internship_id} · {appointment.modality}
                    </p>
                    {appointment.location && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-slate-500">
                            <MapPin size={14} /> {appointment.location}
                        </p>
                    )}
                </div>
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className="self-start rounded-xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700 transition hover:bg-green-100"
            >
                Ocultar
            </button>
        </div>
    </section>
);

export const InterviewSchedulingPage = () => {
    const { user } = useAuth();
    const today = useMemo(() => new Date(), []);
    const roleNames = useMemo(() => getRoleNames(user), [user]);
    const isAdmin = roleNames.some((role) => ADMIN_ROLES.has(role));
    const isStudent = roleNames.includes('Estudiante');

    const [selectedDate, setSelectedDate] = useState(dateToCalendarValue(today));
    const [availableSlots, setAvailableSlots] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [internships, setInternships] = useState([]);
    const [selectedInternshipId, setSelectedInternshipId] = useState('');
    const [hasAutoSelectedDate, setHasAutoSelectedDate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [confirmedAppointment, setConfirmedAppointment] = useState(null);
    const [reschedulingAppointmentId, setReschedulingAppointmentId] = useState(null);
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [cancelReasons, setCancelReasons] = useState({});
    const [availabilityForm, setAvailabilityForm] = useState({
        ...DEFAULT_AVAILABILITY_FORM,
    });

    const selectedDateKey = toDateKey(
        selectedDate.year,
        selectedDate.month,
        selectedDate.day,
    );

    const loadSchedulingData = useCallback(async ({ clearMessage = true } = {}) => {
        setLoading(true);
        if (clearMessage) {
            setMessage(null);
        }

        try {
            const [slotsData, appointmentsData, internshipsData] = await Promise.all([
                schedulingService.getAvailableSlots({
                    date_from: toDateKey(
                        today.getFullYear(),
                        today.getMonth(),
                        today.getDate(),
                    ),
                }),
                schedulingService.getAppointments(),
                isStudent
                    ? internshipService.getMyInternships()
                    : Promise.resolve([]),
            ]);

            setAvailableSlots(slotsData);
            setAppointments(appointmentsData);
            setInternships(internshipsData);
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setLoading(false);
        }
    }, [isStudent, today]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadSchedulingData();
    }, [loadSchedulingData]);

    useEffect(() => {
        if (!selectedInternshipId && internships.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedInternshipId(String(internships[0].id));
        }
    }, [internships, selectedInternshipId]);

    const calendarMarkers = useMemo(() => {
        const markers = {};

        [...availableSlots, ...appointments].forEach((slot) => {
            markers[slot.date] = markers[slot.date] || [];
            markers[slot.date].push(slot.id);
        });

        return markers;
    }, [availableSlots, appointments]);

    const upcomingSlots = useMemo(
        () => [...availableSlots].sort((first, second) => {
            const firstDate = `${first.date}T${first.start_time}`;
            const secondDate = `${second.date}T${second.start_time}`;

            return firstDate.localeCompare(secondDate);
        }),
        [availableSlots],
    );

    const selectedDaySlots = useMemo(
        () => availableSlots.filter((slot) => slot.date === selectedDateKey),
        [availableSlots, selectedDateKey],
    );

    const selectedAppointment = useMemo(
        () =>
            appointments.find(
                (appointment) => appointment.id === reschedulingAppointmentId,
            ),
        [appointments, reschedulingAppointmentId],
    );

    const visibleSlots = useMemo(() => {
        if (!selectedAppointment) return selectedDaySlots;

        return selectedDaySlots.filter(
            (slot) => slot.purpose === selectedAppointment.purpose,
        );
    }, [selectedAppointment, selectedDaySlots]);

    useEffect(() => {
        if (hasAutoSelectedDate || upcomingSlots.length === 0) return;

        const hasSlotsOnSelectedDate = upcomingSlots.some(
            (slot) => slot.date === selectedDateKey,
        );

        if (!hasSlotsOnSelectedDate) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedDate(dateKeyToCalendarValue(upcomingSlots[0].date));
        }

        setHasAutoSelectedDate(true);
    }, [hasAutoSelectedDate, selectedDateKey, upcomingSlots]);

    const handleAvailabilityChange = (field, value) => {
        setAvailabilityForm((current) => {
            const next = { ...current, [field]: value };

            if (
                editingSlotId &&
                (field === 'start_time' || field === 'end_time') &&
                next.start_time &&
                next.end_time
            ) {
                next.duration_minutes = getDurationMinutes(
                    next.start_time,
                    next.end_time,
                );
            }

            return next;
        });
    };

    const resetAvailabilityForm = useCallback(() => {
        setEditingSlotId(null);
        setAvailabilityForm({ ...DEFAULT_AVAILABILITY_FORM });
    }, []);

    const handleCreateAvailability = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage(null);

        try {
            const payload = {
                ...availabilityForm,
                date: selectedDateKey,
                duration_minutes: Number(availabilityForm.duration_minutes),
                location: availabilityForm.location || null,
                comments: availabilityForm.comments || null,
            };

            if (editingSlotId) {
                await schedulingService.updateAvailability(editingSlotId, {
                    date: payload.date,
                    start_time: payload.start_time,
                    end_time: payload.end_time,
                    modality: payload.modality,
                    purpose: payload.purpose,
                    location: payload.location,
                    timezone: 'America/Santiago',
                    comments: payload.comments,
                });
                setMessage({
                    type: 'success',
                    text: 'Horario actualizado correctamente.',
                });
                resetAvailabilityForm();
            } else {
                await schedulingService.createAvailability(payload);
                setMessage({
                    type: 'success',
                    text: 'Disponibilidad publicada correctamente.',
                });
            }
            await loadSchedulingData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleReserveSlot = async (slotId) => {
        if (!selectedInternshipId) {
            setMessage({
                type: 'error',
                text: 'Selecciona una práctica antes de reservar.',
            });
            return;
        }

        setSubmitting(true);
        setMessage(null);
        setConfirmedAppointment(null);

        try {
            let bookedAppointment;

            if (reschedulingAppointmentId) {
                bookedAppointment = await schedulingService.rescheduleAppointment(
                    reschedulingAppointmentId,
                    slotId,
                );
                setReschedulingAppointmentId(null);
                setMessage({ type: 'success', text: 'Cita reprogramada.' });
            } else {
                bookedAppointment = await schedulingService.reserveSlot(
                    slotId,
                    selectedInternshipId,
                );
                setMessage({ type: 'success', text: 'Horario reservado.' });
            }

            setConfirmedAppointment(bookedAppointment);
            setSelectedDate(dateKeyToCalendarValue(bookedAppointment.date));
            await loadSchedulingData({ clearMessage: false });
        } catch (error) {
            const isConflict = error?.response?.status === 409;
            setMessage({
                type: 'error',
                text: isConflict
                    ? `${getErrorMessage(error)} La agenda fue actualizada.`
                    : getErrorMessage(error),
            });

            if (isConflict) {
                await loadSchedulingData({ clearMessage: false });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.cancelAppointment(
                appointmentId,
                cancelReasons[appointmentId] || null,
            );
            setCancelReasons((current) => ({ ...current, [appointmentId]: '' }));
            setReschedulingAppointmentId((current) =>
                current === appointmentId ? null : current,
            );
            setConfirmedAppointment((current) =>
                current?.id === appointmentId ? null : current,
            );
            setMessage({ type: 'success', text: 'Cita cancelada.' });
            await loadSchedulingData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseAvailability = async (slotId) => {
        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.closeAvailability(slotId, null);
            setMessage({ type: 'success', text: 'Horario cerrado.' });
            await loadSchedulingData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartEditAvailability = (slot) => {
        setEditingSlotId(slot.id);
        setSelectedDate(dateKeyToCalendarValue(slot.date));
        setAvailabilityForm({
            start_time: slot.start_time.slice(0, 5),
            end_time: slot.end_time.slice(0, 5),
            duration_minutes: slot.duration_minutes,
            modality: slot.modality,
            purpose: slot.purpose,
            location: slot.location || '',
            comments: slot.comments || '',
        });
        setMessage(null);
    };

    const handleDeleteAvailability = async (slotId) => {
        const confirmed = window.confirm(
            '¿Eliminar este horario disponible? Esta acción no se puede deshacer.',
        );
        if (!confirmed) return;

        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.deleteAvailability(slotId);
            if (editingSlotId === slotId) {
                resetAvailabilityForm();
            }
            setMessage({ type: 'success', text: 'Horario eliminado.' });
            await loadSchedulingData({ clearMessage: false });
        } catch (error) {
            setMessage({ type: 'error', text: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    const setCancelReason = (appointmentId, reason) => {
        setCancelReasons((current) => ({ ...current, [appointmentId]: reason }));
    };

    return (
        <div className="min-h-screen bg-ufro-bg flex flex-col">
            <UserHeader />

            <main className="flex-1 mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
                <div className="mb-8 flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-brand-medium sm:text-4xl">
                        Gestión de horarios de entrevistas
                    </h2>
                    <p className="text-sm text-slate-500">
                        {isAdmin
                            ? 'Publica disponibilidad y revisa tus citas agendadas.'
                            : 'Reserva o reprograma horarios disponibles para tus prácticas.'}
                    </p>
                </div>

                <section className="mb-8 grid gap-4 md:grid-cols-3">
                    <StatsCard
                        title="Horarios disponibles"
                        value={availableSlots.length}
                        icon={Clock}
                    />
                    <StatsCard
                        title="Citas agendadas"
                        value={appointments.length}
                        icon={Send}
                    />
                    <StatsCard
                        title="Días con agenda"
                        value={Object.keys(calendarMarkers).length}
                        icon={CalendarIcon}
                    />
                </section>

                {message && (
                    <div
                        className={[
                            'mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold',
                            message.type === 'success'
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-red-200 bg-red-50 text-red-700',
                        ].join(' ')}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle2 size={18} />
                        ) : (
                            <AlertCircle size={18} />
                        )}
                        {message.text}
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr]">
                    <CalendarView
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        savedDates={calendarMarkers}
                    />

                    <div className="space-y-6">
                        {isAdmin && (
                            <form
                                onSubmit={handleCreateAvailability}
                                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md"
                            >
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-lg">
                                            {editingSlotId
                                                ? 'Editar disponibilidad'
                                                : 'Publicar disponibilidad'}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {selectedDate.day} de {MONTHS[selectedDate.month]}
                                        </p>
                                    </div>
                                    <CalendarCheck className="text-brand-medium" />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Inicio
                                        <input
                                            type="time"
                                            value={availabilityForm.start_time}
                                            onChange={(event) =>
                                                handleAvailabilityChange(
                                                    'start_time',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-brand-medium"
                                            required
                                        />
                                    </label>

                                    <label className="text-sm font-semibold text-slate-700">
                                        Término
                                        <input
                                            type="time"
                                            value={availabilityForm.end_time}
                                            onChange={(event) =>
                                                handleAvailabilityChange(
                                                    'end_time',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-brand-medium"
                                            required
                                        />
                                    </label>

                                    <label className="text-sm font-semibold text-slate-700">
                                        Duración
                                        <input
                                            type="number"
                                            min="15"
                                            max="240"
                                            step="15"
                                            value={availabilityForm.duration_minutes}
                                            onChange={(event) =>
                                                handleAvailabilityChange(
                                                    'duration_minutes',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-brand-medium"
                                            required
                                            disabled={Boolean(editingSlotId)}
                                        />
                                    </label>

                                    <label className="text-sm font-semibold text-slate-700">
                                        Modalidad
                                        <select
                                            value={availabilityForm.modality}
                                            onChange={(event) =>
                                                handleAvailabilityChange(
                                                    'modality',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-brand-medium"
                                        >
                                            {MODALITY_OPTIONS.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                                        Propósito
                                        <select
                                            value={availabilityForm.purpose}
                                            onChange={(event) =>
                                                handleAvailabilityChange(
                                                    'purpose',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-brand-medium"
                                        >
                                            {PURPOSE_OPTIONS.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                                        Ubicación o enlace
                                        <input
                                            type="text"
                                            value={availabilityForm.location}
                                            onChange={(event) =>
                                                handleAvailabilityChange(
                                                    'location',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-brand-medium"
                                        />
                                    </label>

                                    <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                                        Comentarios
                                        <textarea
                                            rows={3}
                                            value={availabilityForm.comments}
                                            onChange={(event) =>
                                                handleAvailabilityChange(
                                                    'comments',
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:border-brand-medium"
                                        />
                                    </label>
                                </div>

                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-medium px-4 py-3 font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
                                    >
                                        <CalendarCheck size={18} />
                                        {editingSlotId ? 'Guardar cambios' : 'Publicar bloques'}
                                    </button>
                                    {editingSlotId && (
                                        <button
                                            type="button"
                                            onClick={resetAvailabilityForm}
                                            className="rounded-xl bg-slate-100 px-4 py-3 font-bold text-slate-700 transition hover:bg-slate-200"
                                        >
                                            Cancelar edición
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}

                        {isStudent && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
                                <h3 className="font-bold text-lg">
                                    Práctica para la reserva
                                </h3>
                                <select
                                    value={selectedInternshipId}
                                    onChange={(event) =>
                                        setSelectedInternshipId(event.target.value)
                                    }
                                    className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-brand-medium"
                                >
                                    {internships.map((internship) => (
                                        <option key={internship.id} value={internship.id}>
                                            #{internship.id} · {internship.org_name}
                                        </option>
                                    ))}
                                </select>
                                {internships.length === 0 && (
                                    <p className="mt-3 text-sm text-slate-500">
                                        No tienes prácticas disponibles para agendar.
                                    </p>
                                )}
                            </div>
                        )}

                        {confirmedAppointment && (
                            <BookingConfirmation
                                appointment={confirmedAppointment}
                                onDismiss={() => setConfirmedAppointment(null)}
                            />
                        )}

                        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-lg">
                                        Horarios del día seleccionado
                                    </h3>
                                    <p className="text-sm text-slate-500">
                                        {formatDisplayDate(selectedDateKey)}
                                    </p>
                                </div>
                                {reschedulingAppointmentId && (
                                    <button
                                        type="button"
                                        onClick={() => setReschedulingAppointmentId(null)}
                                        className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-slate-600"
                                    >
                                        <XCircle size={16} /> Cancelar cambio
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <p className="text-sm text-slate-500">Cargando agenda...</p>
                            ) : visibleSlots.length === 0 ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-500">
                                        No hay horarios disponibles para esta fecha.
                                    </p>
                                    {isStudent && upcomingSlots.length > 0 && (
                                        <div className="rounded-xl border border-brand-medium/20 bg-brand-medium/5 p-4">
                                            <p className="mb-3 text-sm font-bold text-slate-800">
                                                Próximos horarios disponibles
                                            </p>
                                            <div className="grid gap-3">
                                                {upcomingSlots.slice(0, 4).map((slot) => (
                                                    <div
                                                        key={slot.id}
                                                        className="flex flex-col gap-2 md:flex-row"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                                                                {formatDisplayDate(slot.date)}
                                                            </p>
                                                            <SlotButton
                                                                slot={slot}
                                                                disabled={submitting}
                                                                label={
                                                                    reschedulingAppointmentId
                                                                        ? 'Usar'
                                                                        : 'Reservar'
                                                                }
                                                                onClick={() =>
                                                                    handleReserveSlot(slot.id)
                                                                }
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedDate(
                                                                    dateKeyToCalendarValue(
                                                                        slot.date,
                                                                    ),
                                                                )
                                                            }
                                                            className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-medium shadow-sm transition hover:bg-brand-medium hover:text-white md:self-end"
                                                        >
                                                            Ver día
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {visibleSlots.map((slot) => (
                                        <div
                                            key={slot.id}
                                            className="flex flex-col gap-2 md:flex-row"
                                        >
                                            <SlotButton
                                                slot={slot}
                                                disabled={submitting || isAdmin}
                                                label={
                                                    isAdmin
                                                        ? 'Disponible'
                                                        : reschedulingAppointmentId
                                                            ? 'Usar'
                                                            : 'Reservar'
                                                }
                                                onClick={() => handleReserveSlot(slot.id)}
                                            />
                                            {isAdmin && (
                                                <div className="grid grid-cols-3 gap-2 md:w-[320px]">
                                                    <button
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() =>
                                                            handleStartEditAvailability(slot)
                                                        }
                                                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-medium shadow-sm ring-1 ring-brand-medium/20 transition hover:bg-brand-medium/5 disabled:opacity-60"
                                                    >
                                                        <Pencil size={16} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() =>
                                                            handleCloseAvailability(slot.id)
                                                        }
                                                        className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                                                    >
                                                        Cerrar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={submitting}
                                                        onClick={() =>
                                                            handleDeleteAvailability(slot.id)
                                                        }
                                                        className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                                                    >
                                                        <Trash2 size={16} />
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="font-bold text-lg">Próximas citas</h3>
                                <RefreshCw
                                    size={18}
                                    className="text-slate-400"
                                    aria-hidden="true"
                                />
                            </div>

                            {appointments.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No tienes citas agendadas.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {appointments.map((appointment) => (
                                        <AppointmentItem
                                            key={appointment.id}
                                            appointment={appointment}
                                            isAdmin={isAdmin}
                                            isHighlighted={
                                                confirmedAppointment?.id ===
                                                appointment.id
                                            }
                                            cancelReason={
                                                cancelReasons[appointment.id] || ''
                                            }
                                            onCancelReasonChange={setCancelReason}
                                            onCancel={handleCancelAppointment}
                                            onStartReschedule={
                                                setReschedulingAppointmentId
                                            }
                                            isRescheduling={
                                                reschedulingAppointmentId ===
                                                appointment.id
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
