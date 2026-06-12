import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, User, Building, MapPin, FileText } from 'lucide-react';
import { UserHeader } from '../../components/Header/UserHeader';
import { Footer } from '../../components/Footer/Footer';
import { usePractice } from '../../hooks/usePractice';
import { useAuth } from '../../context/useAuth';
import { documentService } from '../../services/documentService';
import { AdminDocumentList } from '../../components/CoordinatorDashboard/AdminDocumentList';

// Componente para mostrar un detalle con ícono
const DetailItem = ({ icon: Icon, label, value, subValue }) => (
  <div>
    <div className="flex items-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
      <Icon className="w-4 h-4 mr-2" />
      <span>{label}</span>
    </div>
    <p className="text-lg font-medium text-gray-800">{value || 'No disponible'}</p>
    {subValue && <p className="text-gray-500">{subValue}</p>}
  </div>
);

export const PracticeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { practice, loading, error } = usePractice(id);
  
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [docsError, setDocsError] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      setDocsError(null);
      const data = await documentService.getInternshipDocuments(id);
      setDocuments(data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocsError("No se pudieron cargar los documentos del servidor.");
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDocuments();
    }
  }, [id]);

  const handleDownload = async (doc) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename || `${doc.document_type?.name || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading document:", err);
    }
  };

  const userName = user ? `${user.first_name} ${user.last_name}` : "Coordinador";
  const userRole = "Coordinador";

  // Usamos el estudiante que pasamos en la navegación desde StudentTable como fuente principal.
  // Si no está (ej. si el usuario entra directo a la URL), intentamos buscarlo en el practice.
  const studentFromState = location.state?.student;
  const studentData = studentFromState || practice?.student || practice?.user || practice;

  const studentName = studentData ? `${studentData.first_name || ''} ${studentData.last_name || ''}`.trim() : 'No disponible';
  const studentEmail = studentData?.email;
  const studentDegree = studentData?.degree;

  const companyAddress = [practice?.address, practice?.city, practice?.region].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen flex flex-col bg-ufro-bg">
      <UserHeader userName={userName} userRole={userRole} />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <button 
          onClick={() => navigate('/coordinador')}
          className="flex items-center text-ufro-primary hover:underline mb-6 font-medium"
        >
          <ArrowLeft className="mr-2" size={20} />
          Volver al Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Detalle de Práctica Administrativa</h2>

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
            <div className="space-y-8">
              {/* Sección de Estudiante */}
              <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={User} label="Estudiante" value={studentName} subValue={studentEmail} />
                  <DetailItem icon={Building} label="Carrera" value={studentDegree} />
                </div>
              </div>

              {/* Sección de Empresa */}
              <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={Building} label="Empresa / Organización" value={practice.org_name} />
                  <DetailItem icon={MapPin} label="Ubicación" value={companyAddress} />
                </div>
              </div>

              {/* Sección de Práctica */}
              <div className="border-t border-gray-100 pt-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div>
                   <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Fechas</h3>
                   <p className="text-gray-800">
                      <span className="font-medium">Inicio:</span> {practice.start_date || 'No definida'} <br/>
                      <span className="font-medium">Término:</span> {practice.end_date || 'No definida'}
                   </p>
                </div>
              </div>

              {/* Sección de Documentos */}
              <div className="border-t border-gray-100 pt-8 mt-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="text-ufro-primary" size={24} />
                  <h3 className="text-xl font-bold text-gray-800">Revisión de Documentos</h3>
                </div>
                <AdminDocumentList 
                  documents={documents}
                  loading={loadingDocs}
                  error={docsError}
                  onStatusUpdated={fetchDocuments}
                  onDownload={handleDownload}
                />
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
