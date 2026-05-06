import { Routes, Route, Navigate } from 'react-router-dom'
import { Login } from '../components/Login/Login'
import { RegistrationPage } from '../pages/Registration/RegistrationPage'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegistrationPage />} />
    </Routes>
  )
}
