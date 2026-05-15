import React from 'react';
import { motion } from 'framer-motion';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { ActionCard } from '../../components/coordinador/ActionCard';
import { StatCard } from '../../components/coordinador/StatCard';
import { StudentTable } from '../../components/coordinador/StudentTable';
import { useCoordinatorData } from '../../hooks/useCoordinatorData';

export const CoordinatorDashboardPage = () => {
  const { stats, actions, students } = useCoordinatorData();

    return (
      <div className="min-h-screen flex flex-col bg-ufro-bg">
        <UserHeader userName="Coordinador FICA" userRole="Coordinador" />
        
        <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-ufro-primary mb-1">Panel Coordinador</h2>
            <p className="text-xl text-ufro-secondary font-medium tracking-tight">Bienvenido al sistema de gestión de prácticas profesionales.</p>
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <StatCard 
                label={stat.label} 
                value={stat.value} 
                Icon={stat.Icon} 
                variant={stat.variant}
              />
            </motion.div>
          ))}
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {actions.map((action, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: index === 0 ? -20 : 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.5 + (index * 0.1) }}
            >
              <ActionCard 
                title={action.title} 
                description={action.description} 
                Icon={action.Icon} 
              />
            </motion.div>
          ))}
        </div>

        {/* Students Table */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.7 }}
        >
          <StudentTable students={students} />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CoordinatorDashboardPage;
