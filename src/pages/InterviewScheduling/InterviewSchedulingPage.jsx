import React, { useState, useCallback } from 'react';
import { Calendar as CalendarIcon, Clock, Send } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { CalendarView } from '../../components/InterviewScheduling/CalendarView';
import { SlotManager } from '../../components/InterviewScheduling/SlotManager';
import { AppointmentCard } from '../../components/InterviewScheduling/AppointmentCard';
import { StatsCard } from '../../components/InterviewScheduling/StatsCard';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const INITIAL_APPOINTMENTS = [
    { id: 1, name: 'Pedro Morales', date: '07 Mayo', time: '10:30', status: 'confirmed' },
    { id: 2, name: 'Ana Silva',     date: '07 Mayo', time: '12:30', status: 'confirmed' },
    { id: 3, name: 'Luis Campos',   date: '14 Mayo', time: '09:00', status: 'pending'   },
];

const DEFAULT_SLOTS = ['09:00 - 09:30', '09:30 - 10:00', '10:30 - 11:00'];

const toDateKey = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const InterviewSchedulingPage = () => {
    const today = new Date();

    const [selectedDate, setSelectedDate] = useState({
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
    });

    // savedDates: { 'YYYY-MM-DD': string[] }
    const [savedDates, setSavedDates] = useState({});

    // currentSlots: the slots being edited for the selected date
    const [currentSlots, setCurrentSlots] = useState(DEFAULT_SLOTS);

    const [justSaved, setJustSaved] = useState(false);

    const handleSelectDate = useCallback((dateObj) => {
        setSelectedDate(dateObj);
        const key = toDateKey(dateObj.year, dateObj.month, dateObj.day);
        setCurrentSlots(savedDates[key] ? [...savedDates[key]] : [...DEFAULT_SLOTS]);
        setJustSaved(false);
    }, [savedDates]);

    const handleSave = useCallback(() => {
        if (!selectedDate) return;
        const key = toDateKey(selectedDate.year, selectedDate.month, selectedDate.day);
        setSavedDates((prev) => ({ ...prev, [key]: [...currentSlots] }));
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
    }, [selectedDate, currentSlots]);

    const totalSlots = Object.values(savedDates).reduce(
        (acc, slots) => acc + slots.length,
        0
    );

    return (
        <div className="min-h-screen bg-ufro-bg flex flex-col">
            <UserHeader userName="Coordinador FICA" userRole="Coordinador" />

            <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-10">
                <h2 className="text-4xl font-bold text-brand-medium mb-8">
                    Gestión de horarios de entrevistas
                </h2>

                {/* Stats */}
                <section className="grid md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Fechas configuradas"
                        value={Object.keys(savedDates).length}
                        icon={CalendarIcon}
                    />
                    <StatsCard
                        title="Horarios disponibles"
                        value={totalSlots}
                        icon={Clock}
                    />
                    <StatsCard
                        title="Entrevistas agendadas"
                        value={INITIAL_APPOINTMENTS.length}
                        icon={Send}
                    />
                </section>

                {/* Main grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    <CalendarView
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        savedDates={savedDates}
                    />

                    <div className="space-y-8">
                        <SlotManager
                            slots={currentSlots}
                            selectedDate={selectedDate}
                            onSlotsChange={setCurrentSlots}
                            onSave={handleSave}
                            justSaved={justSaved}
                            months={MONTHS}
                        />

                        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                            <h3 className="font-bold text-lg mb-5">Próximas entrevistas</h3>
                            <div className="space-y-3">
                                {INITIAL_APPOINTMENTS.map((appt) => (
                                    <AppointmentCard key={appt.id} {...appt} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
