
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/Auth/AuthContext';
import Navbar from '@/components/Layout/Navbar';
import ControlTower from '@/components/AirTrafficControl/ControlTower';
import FlightApi from '@/services/flightApi';
import { Button } from '@/components/ui/button';

const AirportControl = () => {
  const { airportId } = useParams<{ airportId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !airportId) return;

    // Comprobar si el usuario tiene acceso al aeropuerto
    const userHasAccess = currentUser.airports.includes(airportId);
    setHasAccess(userHasAccess);
    setLoading(false);

    // Verificar si el aeropuerto existe
    const api = FlightApi.getInstance();
    const airport = api.getAirport(airportId);
    if (!airport) {
      navigate('/');
    }
  }, [currentUser, airportId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-atc-lightBg to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-atc-blue">Cargando torre de control</h1>
          <div className="w-16 h-16 border-4 border-atc-blue border-t-atc-yellow rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Si el usuario no tiene acceso a este aeropuerto
  if (!hasAccess) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-atc-lightBg to-white">
          <div className="text-center max-w-md px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-atc-blue">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h1 className="text-2xl font-bold mb-2 text-atc-blue">Acceso no autorizado</h1>
            <p className="mb-4 text-gray-600">No tienes permiso para acceder a la torre de control de este aeropuerto. Necesitas aumentar tu nivel o desbloquear este aeropuerto.</p>
            <Button 
              className="bg-atc-blue hover:bg-atc-lightBlue text-white" 
              onClick={() => navigate('/')}
            >
              Volver al mapa global
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-auto">
        <ControlTower />
      </div>
    </div>
  );
};

export default AirportControl;
