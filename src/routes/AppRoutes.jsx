import { Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from '../components/PrivateRoute'
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

          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          {/* Rutas públicas */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<FAQPage />} />

          {/* Rutas protegidas */}
          <Route
              path="/inscripcion"
              element={
                  <PrivateRoute>
                      <RegistrationPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/dashboard"
              element={
                  <PrivateRoute>
                      <StudentDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/coordinador"
              element={
                  <PrivateRoute>
                      <CoordinatorDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/seguimiento"
              element={
                  <PrivateRoute>
                      <SeguimientoPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/supervisor"
              element={
                  <PrivateRoute>
                      <SupervisorPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/autoevaluacion"
              element={
                  <PrivateRoute>
                      <SelfEvaluationPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/entrevistas"
              element={
                  <PrivateRoute>
                      <InterviewSchedulingPage />
                  </PrivateRoute>
              }
          />

      </Routes>
  )
}