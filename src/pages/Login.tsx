
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/Auth/LoginForm';
import { useAuth } from '@/components/Auth/AuthContext';

const Login = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Si ya hay un usuario autenticado, redirigir a la página principal
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  return <LoginForm />;
};

export default Login;
