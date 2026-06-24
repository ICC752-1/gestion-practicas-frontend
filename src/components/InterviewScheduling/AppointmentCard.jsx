import React from 'react';

const StatusBadge = ({ status }) =>
    status === 'confirmed' ? (
        <span className="bg-brand-medium text-white px-3 py-1 rounded-xl text-xs font-semibold">
            Confirmada
        </span>
    ) : (
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-xl text-xs font-semibold">
            Pendiente
        </span>
    );

export const AppointmentCard = ({ name, date, time, status }) => (
    <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center">
        <div>
            <h4 className="font-semibold text-sm">{name}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{date} · {time}</p>
        </div>
        <StatusBadge status={status} />
    </div>
);
