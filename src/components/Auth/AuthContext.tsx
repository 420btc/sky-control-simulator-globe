
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  role: string;
  airports: string[];
  level: number;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios de prueba
const MOCK_USERS = [
  { 
    id: '1', 
    username: 'admin', 
    password: 'admin123', 
    role: 'admin',
    airports: ['MAD', 'BCN', 'LHR', 'CDG', 'JFK'],
    level: 10
  },
  { 
    id: '2', 
    username: 'user', 
    password: 'user123', 
    role: 'controller',
    airports: ['MAD', 'BCN'],
    level: 3
  }
];

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Comprobar si hay una sesión guardada
    const storedUser = localStorage.getItem('atcUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
      } catch (e) {
        console.error('Error parsing stored user data', e);
        localStorage.removeItem('atcUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simular una petición a la API
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(
          (u) => u.username === username && u.password === password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          localStorage.setItem('atcUser', JSON.stringify(userWithoutPassword));
          setIsLoading(false);
          resolve(true);
        } else {
          setError('Nombre de usuario o contraseña incorrectos');
          setIsLoading(false);
          resolve(false);
        }
      }, 800);
    });
  };

  const loginAsGuest = () => {
    setIsLoading(true);
    setError(null);
    
    // Crear un usuario invitado
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      username: 'Invitado',
      role: 'guest',
      airports: ['MAD', 'BCN'], // Acceso limitado a dos aeropuertos
      level: 1
    };
    
    setCurrentUser(guestUser);
    localStorage.setItem('atcUser', JSON.stringify(guestUser));
    setIsLoading(false);
    navigate('/');
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('atcUser');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, loginAsGuest, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
