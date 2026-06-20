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
    { value: 'initial_interview', label: 'Entrevista inicial' },
    { value: 'final_presentation', label: 'Presentación final' },
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
const RESULT_LABELS = {
    Aprobada: 'Resultado aprobado',
    Reprobado: 'Resultado reprobado',
};
const DEFAULT_OUTCOME_FORM = {
    attendance_status: 'completed',
    result: 'Aprobada',
    comments: '',
};

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

const purposeLabel = (purpose) =>
    PURPOSE_OPTIONS.find((option) => option.value === purpose)?.label || purpose;

const getStatusBadgeClasses = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-700';
    if (status === 'no_show') return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
};

const getResultBadgeClasses = (result) => {
    if (result === 'Aprobada') return 'bg-green-600 text-white';
    if (result === 'Reprobado') return 'bg-red-600 text-white';
    return 'bg-slate-200 text-slate-700';
};

const shouldShowOutcomeComments = (outcome) =>
    outcome?.attendance_status === 'no_show' || outcome?.result === 'Reprobado';

const groupSlotsByPurpose = (slots) =>
    PURPOSE_OPTIONS
        .map((purpose) => ({
            ...purpose,
            slots: slots.filter((slot) => slot.purpose === purpose.value),
        }))
        .filter((group) => group.slots.length > 0);

const SlotButton = ({ slot, disabled, label, onClick }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={[
            'min-h-[112px] w-full rounded-xl border p-4 text-left transition',
            disabled
                ? 'border-gray-200 bg-gray-50 text-gray-400'
                : 'border-gray-200 bg-white shadow-sm hover:border-brand-medium hover:bg-brand-medium/5 hover:shadow-md',
        ].join(' ')}
    >
        <div className="flex h-full flex-col justify-between gap-3">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-lg font-black leading-none text-slate-900">
                        {formatSlotTime(slot)}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase text-slate-400">
                        {slot.modality}
                    </p>
                </div>
                <span className="rounded-lg bg-brand-medium px-3 py-1 text-xs font-bold text-white">
                    {label}
                </span>
            </div>
            <div>
                {slot.location && (
                    <p className="flex min-w-0 items-center gap-1 truncate text-xs text-slate-500">
                        <MapPin size={13} /> {slot.location}
                    </p>
                )}
            </div>
        </div>
    </button>
);

const SlotActions = ({
    slot,
    submitting,
    onEdit,
    onClose,
    onDelete,
}) => (
    <div className="grid grid-cols-3 gap-2">
        <button
            type="button"
            disabled={submitting}
            onClick={() => onEdit(slot)}
            className="flex min-h-10 items-center justify-center rounded-lg bg-white px-2 text-xs font-bold text-brand-medium ring-1 ring-brand-medium/20 transition hover:bg-brand-medium/5 disabled:opacity-60"
        >
            <Pencil size={15} />
            <span className="sr-only">Editar</span>
        </button>
        <button
            type="button"
            disabled={submitting}
            onClick={() => onClose(slot.id)}
            className="min-h-10 rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
        >
            Cerrar
        </button>
        <button
            type="button"
            disabled={submitting}
            onClick={() => onDelete(slot)}
            className="flex min-h-10 items-center justify-center rounded-lg bg-red-50 px-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
        >
            <Trash2 size={15} />
            <span className="sr-only">Eliminar</span>
        </button>
    </div>
);

const SlotGroup = ({
    group,
    isAdmin,
    submitting,
    reschedulingAppointmentId,
    onReserve,
    onEdit,
    onClose,
    onDelete,
}) => (
    <section className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
        <div className="mb-3 flex items-center justify-between gap-3">
            <div>
                <h4 className="text-sm font-black text-slate-900">{group.label}</h4>
                <p className="text-xs text-slate-500">
                    {group.slots.length} horario{group.slots.length === 1 ? '' : 's'} disponible{group.slots.length === 1 ? '' : 's'}
                </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-medium ring-1 ring-brand-medium/15">
                {group.slots.length}
            </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {group.slots.map((slot) => (
                <div key={slot.id} className="space-y-2">
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
                        onClick={() => onReserve(slot.id)}
                    />
                    {isAdmin && (
                        <SlotActions
                            slot={slot}
                            submitting={submitting}
                            onEdit={onEdit}
                            onClose={onClose}
                            onDelete={onDelete}
                        />
                    )}
                </div>
            ))}
        </div>
    </section>
);

const EmptyScheduleState = ({ isStudent, upcomingSlots, reschedulingAppointmentId, submitting, onReserve, onSelectDate }) => (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm font-semibold text-slate-700">
            No hay horarios disponibles para esta fecha.
        </p>
        {isStudent && upcomingSlots.length > 0 && (
            <div className="mt-4">
                <p className="mb-3 text-xs font-black uppercase text-slate-400">
                    Próximos horarios disponibles
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    {upcomingSlots.slice(0, 4).map((slot) => (
                        <div key={slot.id} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                            <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                                {formatDisplayDate(slot.date)}
                            </p>
                            <SlotButton
                                slot={slot}
                                disabled={submitting}
                                label={reschedulingAppointmentId ? 'Usar' : 'Reservar'}
                                onClick={() => onReserve(slot.id)}
                            />
                            <button
                                type="button"
                                onClick={() => onSelectDate(dateKeyToCalendarValue(slot.date))}
                                className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-brand-medium hover:text-white"
                            >
                                Ver día
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const AppointmentItem = ({
    appointment,
    isAdmin,
    isHighlighted,
    outcome,
    onOutcomeChange,
    onCancel,
    onRegisterOutcome,
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
                    <span
                        className={[
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                            getStatusBadgeClasses(appointment.status),
                        ].join(' ')}
                    >
                        {STATUS_LABELS[appointment.status] || appointment.status}
                    </span>
                    {isHighlighted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                            <CheckCircle2 size={13} /> Confirmada
                        </span>
                    )}
                    {appointment.result && (
                        <span
                            className={[
                                'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                                getResultBadgeClasses(appointment.result),
                            ].join(' ')}
                        >
                            {RESULT_LABELS[appointment.result] || appointment.result}
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
                {appointment.comments && (
                    <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {appointment.comments}
                    </p>
                )}
            </div>

            <div className="flex w-full flex-col gap-2 md:w-64">
                {isAdmin && appointment.status === 'scheduled' && (
                    <>
                        <select
                            value={outcome?.attendance_status || DEFAULT_OUTCOME_FORM.attendance_status}
                            onChange={(event) =>
                                onOutcomeChange(
                                    appointment.id,
                                    'attendance_status',
                                    event.target.value,
                                )
                            }
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-medium"
                        >
                            {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {outcome?.attendance_status !== 'no_show' && (
                            <select
                                value={outcome?.result || DEFAULT_OUTCOME_FORM.result}
                                onChange={(event) =>
                                    onOutcomeChange(
                                        appointment.id,
                                        'result',
                                        event.target.value,
                                    )
                                }
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-medium"
                            >
                                {RESULT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        {shouldShowOutcomeComments(outcome) && (
                            <textarea
                                rows={3}
                                value={outcome?.comments || ''}
                                onChange={(event) =>
                                    onOutcomeChange(
                                        appointment.id,
                                        'comments',
                                        event.target.value,
                                    )
                                }
                                placeholder={
                                    outcome?.attendance_status === 'no_show'
                                        ? 'Observaciones de inasistencia'
                                        : 'Observaciones de reprobación'
                                }
                                className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-medium"
                            />
                        )}
                    </>
                )}

                <div className="flex gap-2">
                    {!isAdmin && appointment.status === 'scheduled' && (
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
                    {appointment.status === 'scheduled' && (
                        <button
                            type="button"
                            onClick={() => onCancel(appointment)}
                            className="flex-1 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                        >
                            Cancelar
                        </button>
                    )}
                </div>

                {isAdmin && appointment.status === 'scheduled' && (
                    <button
                        type="button"
                        onClick={() => onRegisterOutcome(appointment.id)}
                        className="rounded-xl bg-brand-medium px-3 py-2 text-sm font-bold text-white transition hover:bg-brand-dark"
                    >
                        Registrar resultado
                    </button>
                )}

                {!isAdmin && appointment.status !== 'scheduled' && (
                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
                        {appointment.status === 'completed'
                            ? 'El encargado ya registró el resultado de esta instancia.'
                            : 'La cita quedó registrada como no asistida.'}
                    </div>
                )}
                {isAdmin && appointment.status !== 'scheduled' && (
                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
                        Resultado ya registrado para esta cita.
                    </div>
                )}
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

const DeleteAvailabilityDialog = ({
    slot,
    submitting,
    onCancel,
    onConfirm,
}) => {
    if (!slot) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
            <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <Trash2 size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-red-600">
                            Eliminar disponibilidad
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-900">
                            ¿Eliminar este horario?
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Se eliminará el bloque del {formatDisplayDate(slot.date)} · {formatSlotTime(slot)}.
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-700">
                            Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onCancel}
                        className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onConfirm}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        <Trash2 size={16} />
                        Eliminar horario
                    </button>
                </div>
            </section>
        </div>
    );
};

const CancelAppointmentDialog = ({
    appointment,
    reason,
    submitting,
    onReasonChange,
    onCancel,
    onConfirm,
}) => {
    if (!appointment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-6">
            <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <XCircle size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase text-red-600">
                            Cancelar cita
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-900">
                            ¿Cancelar esta cita?
                        </h3>
                        <p className="mt-2 text-sm text-slate-500">
                            {purposeLabel(appointment.purpose)} · {formatDisplayDate(appointment.date)} · {formatSlotTime(appointment)}
                        </p>
                    </div>
                </div>

                <label className="mt-5 block text-sm font-semibold text-slate-700">
                    Motivo de cancelación
                    <textarea
                        rows={3}
                        value={reason}
                        onChange={(event) => onReasonChange(event.target.value)}
                        placeholder="Indica el motivo de la cancelación"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-medium"
                    />
                </label>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onCancel}
                        className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                    >
                        Volver
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={onConfirm}
                        className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        Confirmar cancelación
                    </button>
                </div>
            </section>
        </div>
    );
};

export const InterviewSchedulingPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
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
    const [slotPendingDeletion, setSlotPendingDeletion] = useState(null);
    const [appointmentPendingCancellation, setAppointmentPendingCancellation] = useState(null);
    const [cancelReasons, setCancelReasons] = useState({});
    const [outcomeForms, setOutcomeForms] = useState({});
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

    const groupedVisibleSlots = useMemo(
        () => groupSlotsByPurpose(visibleSlots),
        [visibleSlots],
    );

    const orderedAppointments = useMemo(
        () => [...appointments].sort((first, second) => {
            const firstDate = `${first.date}T${first.start_time}`;
            const secondDate = `${second.date}T${second.start_time}`;

            return firstDate.localeCompare(secondDate);
        }),
        [appointments],
    );

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

    const handleRequestCancelAppointment = (appointment) => {
        setAppointmentPendingCancellation(appointment);
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
            setAppointmentPendingCancellation(null);
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

    const handleRequestDeleteAvailability = (slot) => {
        setSlotPendingDeletion(slot);
    };

    const handleConfirmDeleteAvailability = async () => {
        if (!slotPendingDeletion) return;

        setSubmitting(true);
        setMessage(null);

        try {
            await schedulingService.deleteAvailability(slotPendingDeletion.id);
            if (editingSlotId === slotPendingDeletion.id) {
                resetAvailabilityForm();
            }
            setSlotPendingDeletion(null);
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
            setMessage({ type: 'success', text: 'Resultado registrado correctamente.' });
            await loadSchedulingData({ clearMessage: false });
        } catch (error) {
            const errorMessage = getErrorMessage(error);
            const hasPendingRequirements = Array.isArray(
                error?.response?.data?.detail?.pending_requirements,
            );

            setMessage({ type: 'error', text: errorMessage });
            showToast({
                type: hasPendingRequirements ? 'warning' : 'error',
                title: hasPendingRequirements
                    ? 'No se puede cerrar la presentación final'
                    : 'No se pudo registrar el resultado',
                message: errorMessage,
                duration: 8000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-ufro-bg flex flex-col">
            <UserHeader />

            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 py-8 sm:px-8">
                <div className="mb-6 flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-brand-medium sm:text-4xl">
                        Gestión de horarios de entrevistas
                    </h2>
                    <p className="text-sm text-slate-500">
                        {isAdmin
                            ? 'Publica disponibilidad y revisa tus citas agendadas.'
                            : 'Reserva o reprograma horarios disponibles para tus prácticas.'}
                    </p>
                </div>

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

                <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
                    <aside className="space-y-4 xl:sticky xl:top-24">
                        <CalendarView
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                            savedDates={calendarMarkers}
                        />

                        {isAdmin && (
                            <form
                                onSubmit={handleCreateAvailability}
                                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md"
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
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
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

                        <section className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
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
                    </aside>

                    <div className="min-w-0 space-y-5">

                        {confirmedAppointment && (
                            <BookingConfirmation
                                appointment={confirmedAppointment}
                                onDismiss={() => setConfirmedAppointment(null)}
                            />
                        )}

                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md sm:p-6">
                            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">
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
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div
                                            key={`slot-loading-${index}`}
                                            className="h-28 animate-pulse rounded-xl bg-slate-100"
                                        />
                                    ))}
                                </div>
                            ) : groupedVisibleSlots.length === 0 ? (
                                <EmptyScheduleState
                                    isStudent={isStudent}
                                    upcomingSlots={upcomingSlots}
                                    reschedulingAppointmentId={reschedulingAppointmentId}
                                    submitting={submitting}
                                    onReserve={handleReserveSlot}
                                    onSelectDate={setSelectedDate}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {groupedVisibleSlots.map((group) => (
                                        <SlotGroup
                                            key={group.value}
                                            group={group}
                                            isAdmin={isAdmin}
                                            submitting={submitting}
                                            reschedulingAppointmentId={reschedulingAppointmentId}
                                            onReserve={handleReserveSlot}
                                            onEdit={handleStartEditAvailability}
                                            onClose={handleCloseAvailability}
                                            onDelete={handleRequestDeleteAvailability}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="font-bold text-lg">Citas y resultados</h3>
                                <RefreshCw
                                    size={18}
                                    className="text-slate-400"
                                    aria-hidden="true"
                                />
                            </div>

                            {orderedAppointments.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No tienes citas agendadas.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {orderedAppointments.map((appointment) => (
                                        <AppointmentItem
                                            key={appointment.id}
                                            appointment={appointment}
                                            isAdmin={isAdmin}
                                            isHighlighted={
                                                confirmedAppointment?.id ===
                                                appointment.id
                                            }
                                            outcome={
                                                outcomeForms[appointment.id]
                                                || DEFAULT_OUTCOME_FORM
                                            }
                                            onOutcomeChange={setOutcomeField}
                                            onCancel={handleRequestCancelAppointment}
                                            onRegisterOutcome={handleRegisterOutcome}
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

            <DeleteAvailabilityDialog
                slot={slotPendingDeletion}
                submitting={submitting}
                onCancel={() => setSlotPendingDeletion(null)}
                onConfirm={handleConfirmDeleteAvailability}
            />

            <CancelAppointmentDialog
                appointment={appointmentPendingCancellation}
                reason={
                    appointmentPendingCancellation
                        ? cancelReasons[appointmentPendingCancellation.id] || ''
                        : ''
                }
                submitting={submitting}
                onReasonChange={(reason) =>
                    appointmentPendingCancellation
                        && setCancelReason(appointmentPendingCancellation.id, reason)
                }
                onCancel={() => setAppointmentPendingCancellation(null)}
                onConfirm={() =>
                    appointmentPendingCancellation
                    && handleCancelAppointment(appointmentPendingCancellation.id)
                }
            />

            <Footer />
        </div>
    );
};
