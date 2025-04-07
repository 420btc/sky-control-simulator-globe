
import React from 'react';
import { Flight, Airport } from '@/services/flightApi';

interface RunwayViewProps {
  airport: Airport;
  arrivingFlights: Flight[];
  departingFlights: Flight[];
}

const RunwayView: React.FC<RunwayViewProps> = ({ airport, arrivingFlights, departingFlights }) => {
  // Seleccionar los vuelos más relevantes (los que están aterrizando o despegando)
  const landingFlights = arrivingFlights
    .filter(f => f.status === 'landing')
    .slice(0, airport.runways);
    
  const takeoffFlights = departingFlights
    .filter(f => f.status === 'takeoff')
    .slice(0, airport.runways);
    
  // Crear pistas dinámicamente según el número de pistas del aeropuerto
  const runways = Array.from({ length: airport.runways }, (_, idx) => ({
    id: `${airport.iataCode}-R${idx + 1}`,
    number: idx + 1,
    direction: Math.floor(Math.random() * 36) + 1, // Dirección aleatoria 1-36
    length: 3000 + Math.floor(Math.random() * 500),
    landing: landingFlights[idx],
    takeoff: takeoffFlights[idx]
  }));

  return (
    <div className="h-full bg-atc-darkBg p-4 relative flex flex-col">
      {/* Radar circular */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full border-2 border-atc-blue/30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full border-2 border-atc-blue/30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-6 border-t-2 border-atc-blue/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-full border-l-2 border-atc-blue/20"></div>
        
        {/* Vuelos en el radar */}
        {arrivingFlights.map((flight) => {
          // Calcular posición relativa (simplificada)
          const distance = flight.status === 'landing' ? 
            Math.random() * 20 + 5 : 
            Math.random() * 40 + 20;
          
          const angle = flight.heading * (Math.PI / 180);
          const x = 50 + Math.cos(angle) * distance; // % desde el centro
          const y = 50 + Math.sin(angle) * distance; // % desde el centro
          
          return (
            <div 
              key={flight.id}
              className="absolute w-2 h-2 bg-atc-yellow rounded-full shadow-md"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
        
        {/* Barrido del radar */}
        <div className="absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-bottom-left radar-sweep animate-pulse-radar"></div>
      </div>
      
      {/* Pistas */}
      <div className="mt-auto flex flex-col justify-end gap-4 z-10">
        {runways.map((runway) => (
          <div key={runway.id} className="relative">
            <div className="h-10 bg-gray-800 rounded-sm relative overflow-hidden flex items-center justify-center">
              {/* Líneas centrales de la pista */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-0.5 flex">
                  {Array.from({ length: 20 }).map((_, idx) => (
                    <div key={idx} className="h-full bg-white flex-1 mx-1"></div>
                  ))}
                </div>
              </div>
              
              {/* Indicador de pista */}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
                {runway.direction.toString().padStart(2, '0')}
              </div>
              
              {/* Avión aterrizando o despegando */}
              {runway.landing && (
                <div className="absolute right-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ffd700" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-90">
                    <path d="M22 2 11 13"></path>
                    <path d="M22 2 15 22 11 13 2 9 22 2z"></path>
                  </svg>
                  <span className="ml-1 text-xs text-white bg-atc-blue/70 px-1 rounded">
                    {runway.landing.callsign}
                  </span>
                </div>
              )}
              
              {runway.takeoff && (
                <div className="absolute left-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#0057b7" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="transform rotate-90">
                    <path d="M22 2 11 13"></path>
                    <path d="M22 2 15 22 11 13 2 9 22 2z"></path>
                  </svg>
                  <span className="ml-1 text-xs text-black bg-atc-yellow/70 px-1 rounded">
                    {runway.takeoff.callsign}
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-between px-1">
              <span>Pista {runway.number}</span>
              <span>{runway.length}m</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Información meteorológica */}
      <div className="mt-4 p-2 bg-black/30 rounded text-white text-xs">
        <div className="flex justify-between">
          <span>Viento: {Math.floor(Math.random() * 20) + 5}kt @ {Math.floor(Math.random() * 360)}°</span>
          <span>Visibilidad: {(Math.random() * 10 + 5).toFixed(1)}km</span>
        </div>
        <div className="flex justify-between">
          <span>Temp: {Math.floor(Math.random() * 15) + 15}°C</span>
          <span>QNH: {Math.floor(Math.random() * 50) + 1000}hPa</span>
        </div>
      </div>
    </div>
  );
};

export default RunwayView;
