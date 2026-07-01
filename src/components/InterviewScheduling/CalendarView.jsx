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
    const firstWeekday = new Date(year, month, 1).getDay();
    const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { offset, daysInMonth };
};

export const CalendarView = ({
    selectedDate,
    onSelectDate,
    savedDates,
}) => {
    const today = new Date();

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const { offset, daysInMonth } = getMonthMatrix(viewYear, viewMonth);

    const prevMonth = () => {
        setViewMonth((m) => {
            if (m === 0) {
                setViewYear((y) => y - 1);
                return 11;
            }
            return m - 1;
        });
    };

    const nextMonth = () => {
        setViewMonth((m) => {
            if (m === 11) {
                setViewYear((y) => y + 1);
                return 0;
            }
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
        <div className="w-full max-w-[380px] mx-auto">

            {/* Navegación */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>

                <h3 className="text-lg font-bold text-slate-900">
                    {MONTHS[viewMonth]} {viewYear}
                </h3>

                <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* Días */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-400 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendario */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, i) => (
                    <div key={i}></div>
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;

                    const past = isPast(day);
                    const selected = isSelected(day);
                    const slots = hasSlots(day);
                    const selectable = !past || slots;

                    return (
                        <button
                            key={day}
                            type="button"
                            disabled={!selectable}
                            onClick={() =>
                                onSelectDate({
                                    year: viewYear,
                                    month: viewMonth,
                                    day,
                                })
                            }
                            className={[
                                "relative",
                                "h-10 sm:h-11",
                                "w-full",
                                "rounded-xl",
                                "flex items-center justify-center",
                                "text-sm",
                                "font-medium",
                                "transition-all",
                                !selectable
                                    ? "text-gray-300 cursor-not-allowed"
                                    : selected
                                        ? "bg-brand-medium text-white"
                                        : isToday(day)
                                            ? "ring-2 ring-brand-medium text-brand-medium hover:bg-brand-medium/10"
                                            : past
                                                ? "text-gray-500 hover:bg-gray-100"
                                                : "hover:bg-gray-100",
                            ].join(" ")}
                        >
                            {day}

                            {slots && (
                                <span
                                    className={[
                                        "absolute",
                                        "bottom-1",
                                        "left-1/2",
                                        "-translate-x-1/2",
                                        "w-1.5",
                                        "h-1.5",
                                        "rounded-full",
                                        selected
                                            ? "bg-white"
                                            : "bg-green-500",
                                    ].join(" ")}
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Día con citas registradas
            </div>

        </div>
    );
};