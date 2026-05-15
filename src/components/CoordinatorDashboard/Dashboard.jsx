import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCoordinatorState } from '../../hooks/useCoordinatorState';
import { StatCard } from '../coordinador/StatCard';
import Management from './Management';
import { Users, FileText, CheckCircle, Clock, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { stats, loading, error } = useCoordinatorState();
  const navigate = useNavigate();

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Students" 
          value={stats?.totalStudents || 0} 
          Icon={Users} 
        />
        <StatCard 
          label="Pending Reviews" 
          value={stats?.pendingReviews || 0} 
          Icon={Clock} 
        />
        <StatCard 
          label="Approved Practices" 
          value={stats?.approvedPractices || 0} 
          Icon={CheckCircle} 
        />
        <StatCard 
          label="Total Applications" 
          value={stats?.totalApplications || 0} 
          Icon={FileText} 
        />
       </div>
       
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/entrevistas')}
          className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-center gap-6 text-left group"
        >
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:bg-[#B5305F] transition-colors">
            <Calendar className="w-7 h-7 text-[#B5305F] group-hover:text-white transition-colors" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Configurar Horarios</h3>
            <p className="text-sm text-gray-400">Gestiona tus horarios disponibles para las entrevistas</p>
          </div>
        </motion.button>
       
       <Management />
    </div>
  );
};

export default Dashboard;
