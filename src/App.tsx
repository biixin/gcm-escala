import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppDataProvider } from './context/AppDataContext'
import { AuthProvider } from './context/AuthContext'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { PublicPage } from './pages/PublicPage'

export default function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicPage />} path="/" />
            <Route element={<LoginPage />} path="/login" />
            <Route element={<AdminPage />} path="/admin" />
            <Route element={<Navigate replace to="/" />} path="*" />
          </Routes>
        </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  )
}
