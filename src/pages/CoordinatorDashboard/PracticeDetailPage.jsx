import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { usePractice } from '../../hooks/usePractice';
import { useAuth } from '../../context/useAuth';

export const PracticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { practice, loading, error } = usePractice(id);

  const userName = user ? `${user.first_name} ${user.last_name}` : "Coordinador";
  const userRole = "Coordinador";

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <button 
          onClick={() => navigate('/coordinador')}
          className="flex items-center text-ufro-primary hover:underline mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Volver al Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detalle de Práctica Administrativa</h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
              <Loader2 className="w-12 h-12 text-ufro-primary animate-spin" />
              <p className="text-gray-500 font-medium">Cargando detalles de la práctica...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-gray-500 text-center max-w-md">{error}</p>
            </div>
          ) : practice ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Estudiante</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {practice.student ? `${practice.student.first_name} ${practice.student.last_name}` : 'No disponible'}
                  </p>
                  <p className="text-gray-500">{practice.student?.email}</p>
                  <p className="text-gray-500">{practice.student?.degree}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Empresa / Organización</h3>
                  <p className="text-lg font-medium text-gray-800">{practice.org_name || 'No disponible'}</p>
                  <p className="text-gray-500">{practice.city ? `${practice.city}, ${practice.region}` : ''}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Estado</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {practice.status?.title || practice.status || 'Pendiente'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipo / Modalidad</h3>
                  <p className="text-lg font-medium text-gray-800">
                    {practice.modality || practice.practice_type || 'No especificado'}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-6 mt-6">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Fechas</h3>
                 <p className="text-gray-800">
                    <span className="font-medium">Inicio:</span> {practice.start_date || 'No definida'} <br/>
                    <span className="font-medium">Término:</span> {practice.end_date || 'No definida'}
                 </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No se encontraron datos para esta práctica.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
