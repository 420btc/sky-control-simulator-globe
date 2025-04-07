
import React from 'react';
import { useAuth } from '@/components/Auth/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import UserProfile from '@/components/Profile/UserProfile';

const Profile = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-atc-lightBg to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-atc-blue">Cargando perfil</h1>
          <div className="w-16 h-16 border-4 border-atc-blue border-t-atc-yellow rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // El usuario será redirigido por AuthContext
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;
