import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, AlertCircle, Save, Check } from 'lucide-react';

const SLOT_REGEX = /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/;

const validateSlot = (value, existingSlots) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Ingresa un horario.';
    if (!SLOT_REGEX.test(trimmed)) return 'Formato inválido. Usa HH:MM - HH:MM.';
    if (existingSlots.includes(trimmed)) return 'Ese horario ya existe.';
    return null;
};

export const SlotManager = ({ slots, selectedDate, onSlotsChange, onSave, justSaved, months }) => {
    const [newSlot, setNewSlot] = useState('');
    const [error, setError]     = useState('');

    const handleAdd = useCallback(() => {
        const err = validateSlot(newSlot, slots);
        if (err) { setError(err); return; }
        onSlotsChange([...slots, newSlot.trim()]);
        setNewSlot('');
        setError('');
    }, [newSlot, slots, onSlotsChange]);

    const handleRemove = (index) =>
        onSlotsChange(slots.filter((_, i) => i !== index));

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAdd();
    };

    const dateLabel = selectedDate
        ? `${selectedDate.day} de ${months[selectedDate.month]}`
        : null;

    return (
        <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
            <h3 className="font-bold text-lg mb-1">Horarios disponibles</h3>
            {dateLabel && (
                <p className="text-sm text-gray-400 mb-5">{dateLabel}</p>
            )}
            {!dateLabel && <div className="mb-5" />}

            {/* Input row */}
            <div className="flex gap-3 mb-1">
                <input
                    type="text"
                    placeholder="Ej: 14:00 - 14:30"
                    value={newSlot}
                    onChange={(e) => { setNewSlot(e.target.value); setError(''); }}
                    onKeyDown={handleKeyDown}
                    className={[
                        'flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition',
                        error
                            ? 'border-red-400 focus:ring-1 focus:ring-red-300'
                            : 'border-gray-200 focus:border-brand-medium focus:ring-1 focus:ring-brand-medium/30',
                    ].join(' ')}
                />
                <button
                    onClick={handleAdd}
                    className="bg-brand-medium text-white px-4 rounded-xl hover:bg-brand-dark transition"
                    aria-label="Agregar horario"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Validation error */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-500 flex items-center gap-1 mt-1 mb-3"
                    >
                        <AlertCircle size={12} /> {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Slots list */}
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                    {slots.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">
                            Sin horarios. Agrega uno arriba.
                        </p>
                    ) : (
                        slots.map((slot, index) => (
                            <motion.div
                                key={slot}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"
                            >
                                <span className="text-sm font-medium">{slot}</span>
                                <button
                                    onClick={() => handleRemove(index)}
                                    className="text-red-400 hover:text-red-600 transition"
                                    aria-label={`Eliminar ${slot}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Save button */}
            <motion.button
                onClick={onSave}
                whileTap={{ scale: 0.97 }}
                className={[
                    'mt-6 w-full py-4 rounded-2xl font-bold flex justify-center items-center gap-2 transition',
                    justSaved
                        ? 'bg-green-600 text-white'
                        : 'bg-brand-medium text-white hover:bg-brand-dark',
                ].join(' ')}
            >
                {justSaved ? <Check size={18} /> : <Save size={18} />}
                {justSaved ? 'Guardado' : 'Guardar horarios'}
            </motion.button>
        </div>
    );
};
