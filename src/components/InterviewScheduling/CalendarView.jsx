import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAYS_OF_WEEK = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const toDateKey = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const getMonthMatrix = (year, month) => {
    const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
    const offset = firstWeekday === 0 ? 6 : firstWeekday - 1; // Mon-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { offset, daysInMonth };
};

export const CalendarView = ({ selectedDate, onSelectDate, savedDates }) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const { offset, daysInMonth } = getMonthMatrix(viewYear, viewMonth);

    const prevMonth = () => {
        setViewMonth((m) => {
            if (m === 0) { setViewYear((y) => y - 1); return 11; }
            return m - 1;
        });
    };

    const nextMonth = () => {
        setViewMonth((m) => {
            if (m === 11) { setViewYear((y) => y + 1); return 0; }
            return m + 1;
        });
    };

    const isPast = (day) =>
        new Date(viewYear, viewMonth, day) <
        new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const isToday = (day) =>
        day === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear();

    const isSelected = (day) =>
        selectedDate?.day === day &&
        selectedDate?.month === viewMonth &&
        selectedDate?.year === viewYear;

    const hasSlots = (day) => {
        const key = toDateKey(viewYear, viewMonth, day);
        return Boolean(savedDates[key]?.length);
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                    aria-label="Mes anterior"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>

                <h3 className="font-bold text-base">
                    {MONTHS[viewMonth]} {viewYear}
                </h3>

                <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl hover:bg-gray-100 transition"
                    aria-label="Mes siguiente"
                >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_OF_WEEK.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-semibold text-gray-400 py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty offset cells */}
                {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const past = isPast(day);
                    const selected = isSelected(day);
                    const slots = hasSlots(day);

                    return (
                        <button
                            key={day}
                            disabled={past}
                            onClick={() =>
                                onSelectDate({ year: viewYear, month: viewMonth, day })
                            }
                            className={[
                                'relative aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition',
                                past
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : selected
                                        ? 'bg-brand-medium text-white'
                                        : isToday(day)
                                            ? 'text-brand-medium ring-1 ring-brand-medium hover:bg-brand-medium/10'
                                            : 'hover:bg-gray-100',
                            ].join(' ')}
                        >
                            {day}
                            {slots && (
                                <span
                                    className={[
                                        'absolute bottom-1 left-1/2 -translate-x-1/2',
                                        'w-1 h-1 rounded-full',
                                        selected ? 'bg-white/70' : 'bg-green-500',
                                    ].join(' ')}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                Día con horarios guardados
            </p>
        </div>
    );
};
