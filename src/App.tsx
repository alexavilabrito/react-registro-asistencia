import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Alumnos from './pages/Alumnos';
import AlumnoDetail from './pages/AlumnoDetail';
import Asistencia from './pages/Asistencia';
import Profile from './pages/Profile';
import type { LoginFormData, RegisterFormData, ForgotPasswordFormData } from './types/auth';

function LoginWrapper() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = (data: LoginFormData) => {
    login(data);
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Login onLogin={handleLogin} />
    </div>
  );
}

function RegisterWrapper() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRegister = (data: RegisterFormData) => {
    console.log('Register:', data);
    // Aquí iría la lógica de registro
    alert(`Registro exitoso para ${data.email}`);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Register onRegister={handleRegister} />
    </div>
  );
}

function ForgotPasswordWrapper() {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleForgotPassword = (data: ForgotPasswordFormData) => {
    console.log('Forgot Password:', data);
    // Aquí iría la lógica de recuperación de contraseña
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <ForgotPassword onResetPassword={handleForgotPassword} />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/register" element={<RegisterWrapper />} />
      <Route path="/forgot-password" element={<ForgotPasswordWrapper />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="mantenedores/alumnos" element={<Alumnos />} />
        <Route path="mantenedores/alumnos/:id" element={<AlumnoDetail />} />
        <Route path="asistencia" element={<Asistencia />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

