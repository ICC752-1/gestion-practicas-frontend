import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '../components/Login/Login'
import { RegistrationPage } from '../pages/Registration/RegistrationPage'
import { LandingPage } from '../pages/Landing/LandingPage'
import { FAQPage } from '../pages/FAQ/FAQPage'
import { StudentDashboardPage } from '../pages/StudentDashboard/StudentDashboardPage'
import { CoordinatorDashboardPage } from '../pages/CoordinatorDashboard/CoordinatorDashboardPage'
import { SeguimientoPage } from '../pages/Seguimiento/SeguimientoPage'
import { SupervisorPage } from '../pages/Supervisor/SupervisorPage'
import { SelfEvaluationPage } from '../pages/SelfEvaluation/SelfEvaluationPage'
import { InterviewSchedulingPage } from '../pages/InterviewScheduling/InterviewSchedulingPage'
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing" replace />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/inscripcion" element={<RegistrationPage />} />
      <Route path="/dashboard" element={<StudentDashboardPage />} />
      <Route path="/coordinador" element={<CoordinatorDashboardPage />} />
      <Route path="/seguimiento" element={<SeguimientoPage />} />
      <Route path="/supervisor" element={<SupervisorPage />} />
      <Route path="/autoevaluacion" element={<SelfEvaluationPage />} />
      <Route path="/entrevistas" element={<InterviewSchedulingPage />} />
    </Routes>
  )
}
