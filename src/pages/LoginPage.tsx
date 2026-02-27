import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { user, isLoading, isApproved } = useAuth();

  if (!isLoading && user) {
    return <Navigate to={isApproved ? '/plots' : '/pending-approval'} replace />;
  }

  return <LoginForm />;
};

export default LoginPage;
