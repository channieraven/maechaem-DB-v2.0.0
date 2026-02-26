import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/plots" replace />;
  }

  return <LoginForm />;
};

export default LoginPage;
