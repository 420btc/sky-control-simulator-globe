
import React, { useState } from 'react';
import { Flight } from '@/services/flightApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ControlPanelProps {
  arrivingFlights: Flight[];
  departingFlights: Flight[];
  onSelectFlight?: (flight: Flight) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ arrivingFlights, departingFlights, onSelectFlight }) => {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [messageLog, setMessageLog] = useState<{message: string, time: string, type: 'system'|'pilot'|'atc'}[]>([
    {
      message: "Sistema ATC iniciado. Bienvenido controlador.",
      time: new Date().toLocaleTimeString(),
      type: 'system'
    }
  ]);
  
  // Ordenar vuelos por proximidad (simulada con ETA)
  const sortedArrivingFlights = [...arrivingFlights].sort((a, b) => {
    return (a.eta || '').localeCompare(b.eta || '');
  });
  
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    if (onSelectFlight) onSelectFlight(flight);
    
    // Añadir mensaje al log
    addMessage(`Seleccionado vuelo ${flight.callsign}`, 'atc');
  };
  
  const handleClearance = (type: 'landing' | 'takeoff') => {
    if (!selectedFlight) return;
    
    // Simular autorización y respuesta del piloto
    if (type === 'landing') {
      addMessage(`${selectedFlight.callsign}, está autorizado a aterrizar en pista ${Math.floor(Math.random() * 36) + 1}`, 'atc');
      setTimeout(() => {
        addMessage(`Torre, ${selectedFlight.callsign}, copiado. Iniciando aproximación final.`, 'pilot');
        toast.success(`${selectedFlight.callsign} ha recibido autorización para aterrizar`, {
          duration: 3000
        });
      }, 1200);
    } else {
      addMessage(`${selectedFlight.callsign}, autorizado a despegar pista ${Math.floor(Math.random() * 36) + 1}, vientos 090 a 5 nudos`, 'atc');
      setTimeout(() => {
        addMessage(`Autorizado a despegar pista ${Math.floor(Math.random() * 36) + 1}, ${selectedFlight.callsign}`, 'pilot');
        toast.success(`${selectedFlight.callsign} iniciará despegue momentáneamente`, {
          duration: 3000
        });
      }, 1200);
    }
  };
  
  const addMessage = (message: string, type: 'system' | 'pilot' | 'atc') => {
    const newMessage = {
      message,
      time: new Date().toLocaleTimeString(),
      type
    };
    
    setMessageLog(prev => [...prev, newMessage]);
  };
  
  const handleSendCustomMessage = () => {
    if (!selectedFlight) return;
    
    // Simular envío de mensaje y respuesta
    addMessage(`${selectedFlight.callsign}, notifique altitud y rumbo actual`, 'atc');
    
    setTimeout(() => {
      addMessage(`Torre, ${selectedFlight.callsign} a ${selectedFlight.altitude}00 pies, rumbo ${Math.round(selectedFlight.heading)}`, 'pilot');
    }, 1500);
  };

  return (
    <div className="h-full bg-atc-blue/10 rounded-lg p-3 flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1">
        {/* Panel de llegadas */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 overflow-auto">
          <h2 className="font-bold text-atc-blue border-b pb-1 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 12v-2a2 2 0 0 0-2-2h-4l-5-5v16l5-5h4a2 2 0 0 0 2-2Z"></path>
            </svg>
            Llegadas ({sortedArrivingFlights.length})
          </h2>
          
          <div className="space-y-2">
            {sortedArrivingFlights.length > 0 ? (
              sortedArrivingFlights.map(flight => (
                <div 
                  key={flight.id}
                  className={`p-2 text-sm rounded-md cursor-pointer transition-colors ${
                    selectedFlight?.id === flight.id 
                      ? 'bg-atc-blue/20 border border-atc-blue/30' 
                      : 'hover:bg-gray-50 border border-gray-100'
                  }`}
                  onClick={() => handleSelectFlight(flight)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold">{flight.callsign}</span>
                    <Badge variant={flight.status === 'landing' ? 'warning' : 'default'} className="text-[0.65rem]">
                      {flight.status === 'landing' ? 'APROX FINAL' : 'EN RUTA'}
                    </Badge>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span>{flight.aircraft}</span>
                    <span>Desde: {flight.origin}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ETA: {flight.eta ? new Date(flight.eta).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No hay vuelos llegando actualmente
              </div>
            )}
          </div>
        </div>
        
        {/* Panel de salidas */}
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 overflow-auto">
          <h2 className="font-bold text-atc-blue border-b pb-1 mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M21 13v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2"></path>
              <path d="M17 8l-5-5-5 5"></path>
              <path d="M12 3v11"></path>
            </svg>
            Salidas ({departingFlights.length})
          </h2>
          
          <div className="space-y-2">
            {departingFlights.length > 0 ? (
              departingFlights.map(flight => (
                <div 
                  key={flight.id}
                  className={`p-2 text-sm rounded-md cursor-pointer transition-colors ${
                    selectedFlight?.id === flight.id 
                      ? 'bg-atc-yellow/20 border border-atc-yellow/30' 
                      : 'hover:bg-gray-50 border border-gray-100'
                  }`}
                  onClick={() => handleSelectFlight(flight)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold">{flight.callsign}</span>
                    <Badge variant={flight.status === 'takeoff' ? 'default' : 'outline'} className="text-[0.65rem]">
                      {flight.status === 'takeoff' ? 'LISTO' : 'PROGRAMADO'}
                    </Badge>
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span>{flight.aircraft}</span>
                    <span>Hacia: {flight.destination}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    STD: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No hay vuelos programados para salir
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Panel de comunicaciones */}
      <div className="mt-3 bg-white rounded-lg p-3 shadow-sm border border-gray-200 h-64">
        <h2 className="font-bold text-atc-blue border-b pb-1 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <path d="M14.5 2v20M2 5h12M2 19h12"></path>
          </svg>
          Comunicaciones de Radio
        </h2>
        
        {selectedFlight ? (
          <>
            <div className="flex gap-2 mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                onClick={() => handleClearance('landing')}
              >
                Autorizar aterrizaje
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
                onClick={() => handleClearance('takeoff')}
              >
                Autorizar despegue
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSendCustomMessage}
              >
                Solicitar posición
              </Button>
            </div>
            
            <div className="h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {messageLog.map((msg, idx) => (
                <div key={idx} className={`text-xs mb-1 ${
                  msg.type === 'system' ? 'text-gray-500 italic' : 
                  msg.type === 'pilot' ? 'text-blue-600' : 
                  'text-green-600'
                }`}>
                  <span className="text-gray-400">[{msg.time}]</span> {msg.message}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3.8a2 2 0 0 0 1.4-.58l4.2-4.2A2 2 0 0 1 15 2.8a2 2 0 0 1 1.4.58l4.2 4.2c.37.4.59.89.6 1.42"></path>
              <path d="M2 11.5a3.5 3.5 0 0 0 7 0 3.5 3.5 0 0 0-7 0"></path>
              <path d="M15 10.5a3.5 3.5 0 0 0 7 0 3.5 3.5 0 0 0-7 0"></path>
            </svg>
            <p className="mt-2 text-sm">Selecciona un vuelo para comunicarte</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
