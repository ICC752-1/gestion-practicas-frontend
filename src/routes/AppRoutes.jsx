import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '../components/PrivateRoute'
import { Login } from '../components/Login/Login'
import { RegistrationPage } from '../pages/Registration/RegistrationPage'
import { PreRegistrationPage } from '../pages/Registration/PreRegistrationPage'
import { LandingPage } from '../pages/Landing/LandingPage'
import { FAQPage } from '../pages/FAQ/FAQPage'
import { StudentDashboardPage } from '../pages/StudentDashboard/StudentDashboardPage'
import { CoordinatorDashboardPage } from '../pages/CoordinatorDashboard/CoordinatorDashboardPage'
import { PracticeDetailPage } from '../pages/CoordinatorDashboard/PracticeDetailPage'
import { SeguimientoPage } from '../pages/Seguimiento/SeguimientoPage'
import { SeguimientoListPage } from '../pages/Seguimiento/SeguimientoListPage'
import { SupervisorPage } from '../pages/Supervisor/SupervisorPage'
import { SelfEvaluationPage } from '../pages/SelfEvaluation/SelfEvaluationPage'
import { InterviewSchedulingPage } from '../pages/InterviewScheduling/InterviewSchedulingPage'
import { PresentationLettersPage } from '../pages/PresentationLetters/PresentationLettersPage'
import AuthCallbackPage from '../pages/Auth/AuthCallbackPage'

const STUDENT_ROLES = ['Estudiante']
const ADMIN_ROLES = [
    'Encargado de practica',
    'Director de carrera',
    'Secretaria de Carrera',
]
const SUPERVISOR_ROLES = ['Supervisor de practica']

export const AppRoutes = () => {
  return (
      <Routes>

          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          {/* Rutas públicas */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
              path="/auth/callback"
              element={<AuthCallbackPage />}
          />
          <Route path="/faq" element={<FAQPage />} />

          {/* Rutas protegidas */}
          <Route
              path="/inscripcion"
              element={<Navigate to="/practicas/nueva/preinscripcion" replace />}
          />

          <Route
              path="/practicas/nueva/preinscripcion"
              element={
                  <PrivateRoute allowedRoles={STUDENT_ROLES}>
                      <PreRegistrationPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/practicas/nueva/formulario"
              element={
                  <PrivateRoute allowedRoles={STUDENT_ROLES}>
                      <RegistrationPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/dashboard"
              element={
                  <PrivateRoute allowedRoles={STUDENT_ROLES}>
                      <StudentDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/coordinador"
              element={
                  <PrivateRoute allowedRoles={ADMIN_ROLES}>
                      <CoordinatorDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/coordinador/practica/:id"
              element={
                  <PrivateRoute allowedRoles={ADMIN_ROLES}>
                      <PracticeDetailPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/seguimiento"
              element={
                  <PrivateRoute allowedRoles={STUDENT_ROLES}>
                      <SeguimientoListPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/seguimiento/:internshipId"
              element={
                  <PrivateRoute allowedRoles={STUDENT_ROLES}>
                      <SeguimientoPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/supervisor"
              element={
                  <PrivateRoute allowedRoles={SUPERVISOR_ROLES}>
                      <SupervisorPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/autoevaluacion"
              element={
                  <PrivateRoute allowedRoles={STUDENT_ROLES}>
                      <SelfEvaluationPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/entrevistas"
              element={
                  <PrivateRoute allowedRoles={[...STUDENT_ROLES, ...ADMIN_ROLES]}>
                      <InterviewSchedulingPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/cartas-presentacion"
              element={
                  <PrivateRoute allowedRoles={[...STUDENT_ROLES, ...ADMIN_ROLES]}>
                      <PresentationLettersPage />
                  </PrivateRoute>
              }
          />

      </Routes>
  )
}
