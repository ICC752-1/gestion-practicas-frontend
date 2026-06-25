import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { PrivateRoute } from '../components/PrivateRoute'
import { Login } from '../components/Login/Login'
import { RegistrationPage } from '../pages/Registration/RegistrationPage'
import { PreRegistrationPage } from '../pages/Registration/PreRegistrationPage'
import { LandingPage } from '../pages/Landing/LandingPage'
import { FAQPage } from '../pages/FAQ/FAQPage'
import { StudentDashboardPage } from '../pages/StudentDashboard/StudentDashboardPage'
import { CoordinatorDashboardPage } from '../pages/CoordinatorDashboard/CoordinatorDashboardPage'
import { PracticeDetailPage } from '../pages/CoordinatorDashboard/PracticeDetailPage'
import { SupervisorPage } from '../pages/Supervisor/SupervisorPage'
import { SupervisorEvaluationPage } from '../pages/Supervisor/SupervisorEvaluationPage'
import { SelfEvaluationPage } from '../pages/SelfEvaluation/SelfEvaluationPage'
import { InterviewSchedulingPage } from '../pages/InterviewScheduling/InterviewSchedulingPage'
import { InductionAdminPage } from '../pages/Induction/InductionAdminPage'
import { StudentAccountsPage } from '../pages/StudentAccounts/StudentAccountsPage'
import { PresentationLettersPage } from '../pages/PresentationLetters/PresentationLettersPage'
import ActivateAccountPage from '../pages/Auth/ActivateAccountPage'
import AuthCallbackPage from '../pages/Auth/AuthCallbackPage'
import { FicaDashboardPage } from '../pages/Fica/FicaDashboardPage'
import { SuperadminUsersPage } from '../pages/Superadmin/SuperadminUsersPage'
import { SecretaryDashboardPage } from '../pages/Secretary/SecretaryDashboardPage'
import {
    CAREER_DIRECTOR_ROLE,
    PRACTICE_MANAGER_ROLE,
    FICA_ROLE,
    SECRETARY_ROLE,
    STUDENT_ROLE,
    SUPERADMIN_ROLE,
    SUPERVISOR_ROLE,
} from '../services/roleRouting'

const STUDENT_ROLES = [STUDENT_ROLE]
const DECISION_ADMIN_ROLES = [PRACTICE_MANAGER_ROLE, CAREER_DIRECTOR_ROLE]
const REPORT_ROLES = [PRACTICE_MANAGER_ROLE, CAREER_DIRECTOR_ROLE, FICA_ROLE]
const PRACTICE_MANAGER_ROLES = [PRACTICE_MANAGER_ROLE]
const CAREER_DIRECTOR_ROLES = [CAREER_DIRECTOR_ROLE]
const SECRETARY_ROLES = [SECRETARY_ROLE]
const SUPERVISOR_ROLES = [SUPERVISOR_ROLE]
const FICA_ROLES = [FICA_ROLE]
const SUPERADMIN_ROLES = [SUPERADMIN_ROLE]

const LegacyCoordinatorDetailRedirect = () => {
    const { id } = useParams()

    return <Navigate to={`/encargado/practica/${id}`} replace />
}

export const AppRoutes = () => {
  return (
      <Routes>

          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          {/* Rutas públicas */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/activar-cuenta" element={<ActivateAccountPage />} />
          <Route
              path="/auth/callback"
              element={<AuthCallbackPage />}
          />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/supervisor/evaluacion/:token" element={<SupervisorEvaluationPage />} />

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
              element={<Navigate to="/encargado" replace />}
          />

          <Route
              path="/coordinador/practica/:id"
              element={<LegacyCoordinatorDetailRedirect />}
          />

          <Route
              path="/encargado"
              element={
                  <PrivateRoute allowedRoles={PRACTICE_MANAGER_ROLES}>
                      <CoordinatorDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/encargado/practica/:id"
              element={
                  <PrivateRoute allowedRoles={DECISION_ADMIN_ROLES}>
                      <PracticeDetailPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/director"
              element={
                  <PrivateRoute allowedRoles={CAREER_DIRECTOR_ROLES}>
                      <CoordinatorDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/director/practica/:id"
              element={
                  <PrivateRoute allowedRoles={DECISION_ADMIN_ROLES}>
                      <PracticeDetailPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/induccion/admin"
              element={
                  <PrivateRoute allowedRoles={DECISION_ADMIN_ROLES}>
                      <InductionAdminPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/reportes/admin"
              element={
                  <PrivateRoute allowedRoles={REPORT_ROLES}>
                      <FicaDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/estudiantes/admin"
              element={
                  <PrivateRoute allowedRoles={DECISION_ADMIN_ROLES}>
                      <StudentAccountsPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/secretaria"
              element={
                  <PrivateRoute allowedRoles={SECRETARY_ROLES}>
                      <SecretaryDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/seguimiento"
              element={<Navigate to="/dashboard" replace />}
          />

          <Route
              path="/seguimiento/:internshipId"
              element={<Navigate to="/dashboard" replace />}
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
              element={<Navigate to="/dashboard" replace />}
          />

          <Route
              path="/autoevaluacion/:internshipId"
              element={
                  <PrivateRoute allowedRoles={STUDENT_ROLES}>
                      <SelfEvaluationPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/entrevistas"
              element={
                  <PrivateRoute allowedRoles={[...STUDENT_ROLES, ...DECISION_ADMIN_ROLES]}>
                      <InterviewSchedulingPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/cartas-presentacion"
              element={
                  <PrivateRoute allowedRoles={[...STUDENT_ROLES, ...DECISION_ADMIN_ROLES]}>
                      <PresentationLettersPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/fica"
              element={
                  <PrivateRoute allowedRoles={FICA_ROLES}>
                      <FicaDashboardPage />
                  </PrivateRoute>
              }
          />

          <Route
              path="/superadmin/usuarios"
              element={
                  <PrivateRoute allowedRoles={SUPERADMIN_ROLES}>
                      <SuperadminUsersPage />
                  </PrivateRoute>
              }
          />

      </Routes>
  )
}
