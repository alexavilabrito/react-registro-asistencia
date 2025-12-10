import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { LoginFormData, UserProfile } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (data: LoginFormData) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Cargar estado de autenticación desde localStorage o sessionStorage al iniciar
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth') || sessionStorage.getItem('auth');
    const savedProfile = localStorage.getItem('userProfile');
    
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        
        // Cargar perfil guardado o crear uno básico
        if (savedProfile) {
          setUser(JSON.parse(savedProfile));
        } else {
          const basicProfile: UserProfile = {
            email: authData.email,
            firstName: '',
            lastName: '',
            phone: '',
          };
          setUser(basicProfile);
        }
      } catch (error) {
        localStorage.removeItem('auth');
        sessionStorage.removeItem('auth');
        localStorage.removeItem('userProfile');
      }
    }
  }, []);

  const login = (data: LoginFormData) => {
    setIsAuthenticated(true);
    const basicProfile: UserProfile = {
      email: data.email,
      firstName: '',
      lastName: '',
      phone: '',
    };
    setUser(basicProfile);
    
    // Guardar en localStorage si "recordar me" está activado
    if (data.rememberMe) {
      localStorage.setItem('auth', JSON.stringify({ email: data.email }));
      localStorage.setItem('userProfile', JSON.stringify(basicProfile));
    } else {
      // Guardar solo en sesión si no está marcado "recordar me"
      sessionStorage.setItem('auth', JSON.stringify({ email: data.email }));
      sessionStorage.setItem('userProfile', JSON.stringify(basicProfile));
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    if (user) {
      const updatedProfile = { ...user, ...profile };
      setUser(updatedProfile);
      
      // Guardar perfil actualizado
      const storage = localStorage.getItem('auth') ? localStorage : sessionStorage;
      storage.setItem('userProfile', JSON.stringify(updatedProfile));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('userProfile');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

