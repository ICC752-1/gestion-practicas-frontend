import React from 'react';
import { motion } from 'framer-motion';

export const StatsCard = ({ title, value, icon: Icon }) => (
    <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex justify-between items-center"
    >
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-brand-medium/10 p-3 rounded-xl">
            <Icon className="text-brand-medium w-6 h-6" />
        </div>
    </motion.div>
);
