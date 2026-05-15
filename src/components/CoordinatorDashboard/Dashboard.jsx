import React from 'react';
import { useCoordinatorState } from '../../hooks/useCoordinatorState';
import { StatCard } from '../coordinador/StatCard';
import Management from './Management';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const Dashboard = () => {
  const { stats, loading, error } = useCoordinatorState();

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
      
      <Management />
    </div>
  );
};

export default Dashboard;
