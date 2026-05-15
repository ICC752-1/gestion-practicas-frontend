import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar 
} from 'lucide-react';

export const useCoordinatorData = () => {
  const stats = [
    { label: 'Total', value: '10', Icon: Users, variant: 'default' },
    { label: 'En progreso', value: '10', Icon: Clock, variant: 'progress' },
    { label: 'Pendientes', value: '10', Icon: AlertTriangle, variant: 'alert' },
    { label: 'Completadas', value: '10', Icon: CheckCircle, variant: 'success' },
  ];

  const actions = [
    { title: 'Gestión de Prácticas', description: 'Aprobar o rechazar solicitudes', Icon: FileText },
    { title: 'Configurar Horarios', description: 'Gestionar horario disponibles para entrevistas', Icon: Calendar },
  ];

  const students = [
    { id: '1', name: 'Camila Rojas', email: 'c.rojas01@ufromail.cl', career: 'Ingeniería Civil', company: 'Empresa A', status: 'En proceso' },
    { id: '2', name: 'Diego Valenzuela', email: 'd.valenzuela02@ufromail.cl', career: 'Ingeniería Informática', company: 'Empresa B', status: 'Pendiente' },
    { id: '3', name: 'Valentina Soto', email: 'v.soto03@ufromail.cl', career: 'Ingeniería Civil', company: 'Empresa C', status: 'Completada' },
    { id: '4', name: 'Sebastián Muñoz', email: 's.munoz04@ufromail.cl', career: 'Ingeniería Informática', company: 'Empresa D', status: 'En proceso' },
    { id: '5', name: 'Francisca Morales', email: 'f.morales05@ufromail.cl', career: 'Ingeniería Civil', company: 'Empresa E', status: 'Pendiente' },
  ];

  return { 
    stats, 
    actions, 
    students, 
    loading: false, 
    error: null 
  };
};
