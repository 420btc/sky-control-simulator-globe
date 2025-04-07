
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Layout/Navbar';
import ControlTower from '@/components/AirTrafficControl/ControlTower';
import RunwayView from '@/components/AirTrafficControl/RunwayView';
import ControlPanel from '@/components/AirTrafficControl/ControlPanel'; 
import FlightTable from '@/components/AirTrafficControl/FlightTable';
import Clock from '@/components/UI/Clock';
import FlightApi, { Flight, Airport } from '@/services/flightApi';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AirportControl = () => {
  const { airportId } = useParams<{ airportId: string }>();
  const navigate = useNavigate();
  const [airport, setAirport] = useState<Airport | null>(null);
  const [arrivingFlights, setArrivingFlights] = useState<Flight[]>([]);
  const [departingFlights, setDepartingFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  
  useEffect(() => {
    if (!airportId) return;
    
    const api = FlightApi.getInstance();
    const airportData = api.getAirport(airportId);
    
    if (!airportData) {
      toast.error("Aeropuerto no encontrado", { 
        description: "Redirigiendo a la página principal",
        duration: 3000
      });
      navigate('/');
      return;
    }
    
    setAirport(airportData);
    
    // Cargar vuelos iniciales
    const arriving = api.getArrivingFlights(airportId);
    const departing = api.getDepartingFlights(airportId);
    setArrivingFlights(arriving);
    setDepartingFlights(departing);
    
    // Mostrar notificación de bienvenida
    toast.info(`Bienvenido a la torre de control de ${airportData.name}`, {
      description: `Gestionando ${arriving.length} llegadas y ${departing.length} salidas`,
      duration: 4000
    });
    
    // Actualizar los vuelos periódicamente
    const interval = setInterval(() => {
      setArrivingFlights(api.getArrivingFlights(airportId));
      setDepartingFlights(api.getDepartingFlights(airportId));
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [airportId, navigate]);
  
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    
    // Mostrar notificación de vuelo seleccionado
    toast(`Vuelo ${flight.callsign} seleccionado`, {
      description: `${flight.aircraft} - ${flight.origin} → ${flight.destination}`,
      duration: 2000
    });
  };

  if (!airport) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-atc-lightBg to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-atc-blue">Cargando datos del aeropuerto</h1>
          <div className="w-16 h-16 border-4 border-atc-blue border-t-atc-yellow rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white rounded-lg p-4 shadow-md h-full">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-atc-blue">{airport.name} ({airport.iataCode})</h1>
              <p className="text-muted-foreground">Torre de Control - {airport.runways} pistas activas</p>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center">
              <div className="bg-atc-blue/10 px-3 py-1 rounded-md mr-3">
                <Clock />
              </div>
              <div className="bg-atc-blue text-white px-3 py-1 rounded-md font-mono">
                {airport.id} TWR
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="tower" className="flex-1">
            <TabsList>
              <TabsTrigger value="tower">Torre de Control</TabsTrigger>
              <TabsTrigger value="radar">Radar</TabsTrigger>
              <TabsTrigger value="flights">Lista de Vuelos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tower" className="h-[calc(100vh-240px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-2 grid grid-rows-2 gap-4">
                  <div className="relative">
                    <ControlTower airport={airport} />
                    
                    {/* Indicador de clima */}
                    <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded text-xs">
                      <div className="flex items-center">
                        <span>Visibilidad: {(Math.random() * 10 + 5).toFixed(1)}km</span>
                        <span className="mx-2">|</span>
                        <span>Viento: {Math.floor(Math.random() * 20) + 5}kt @ {Math.floor(Math.random() * 360)}°</span>
                      </div>
                    </div>
                  </div>
                  <RunwayView 
                    airport={airport} 
                    arrivingFlights={arrivingFlights} 
                    departingFlights={departingFlights} 
                  />
                </div>
                <div>
                  <ControlPanel 
                    arrivingFlights={arrivingFlights}
                    departingFlights={departingFlights}
                    onSelectFlight={handleSelectFlight}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="radar" className="h-[calc(100vh-240px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                <div className="lg:col-span-2">
                  {/* Vista de radar simulada */}
                  <div className="h-full bg-atc-darkBg p-4 relative rounded-lg">
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border-2 border-atc-blue/30"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border-2 border-atc-blue/30"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full border-2 border-atc-blue/30"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-6 border-t-2 border-atc-blue/20"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-full border-l-2 border-atc-blue/20"></div>
                      
                      {/* Vuelos en el radar */}
                      {arrivingFlights.concat(departingFlights).map((flight) => {
                        // Calcular posición relativa (simplificada)
                        const distance = flight.status === 'landing' ? 
                          Math.random() * 30 + 5 : 
                          Math.random() * 50 + 20;
                        
                        const angle = flight.heading * (Math.PI / 180);
                        const x = 50 + Math.cos(angle) * distance; // % desde el centro
                        const y = 50 + Math.sin(angle) * distance; // % desde el centro
                        
                        return (
                          <div 
                            key={flight.id}
                            className={`absolute w-2 h-2 rounded-full shadow-md ${
                              flight.id === selectedFlight?.id
                                ? 'bg-white animate-pulse'
                                : flight.status === 'landing'
                                ? 'bg-atc-yellow'
                                : 'bg-atc-blue'
                            }`}
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: 'translate(-50%, -50%)',
                            }}
                            onClick={() => handleSelectFlight(flight)}
                          >
                            <div className="absolute w-5 h-5 bg-transparent rounded-full border border-current animate-ping opacity-75"></div>
                            {(selectedFlight?.id === flight.id || flight.status === 'landing') && (
                              <div className="absolute whitespace-nowrap text-xs text-white -mt-4 -ml-6">
                                {flight.callsign}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Barrido del radar */}
                      <div className="absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-bottom-left radar-sweep animate-[spin_4s_linear_infinite]"></div>
                    </div>
                    
                    {/* HUD con información del vuelo seleccionado */}
                    {selectedFlight && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-green-400 p-3 rounded font-mono text-sm">
                        <div className="flex justify-between">
                          <div><span className="text-white">CALLSIGN:</span> {selectedFlight.callsign}</div>
                          <div><span className="text-white">TYPE:</span> {selectedFlight.aircraft}</div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <div><span className="text-white">ALT:</span> {selectedFlight.altitude}00 FT</div>
                          <div><span className="text-white">SPD:</span> {selectedFlight.speed} KTS</div>
                          <div><span className="text-white">HDG:</span> {Math.round(selectedFlight.heading)}°</div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <div><span className="text-white">FROM:</span> {selectedFlight.origin}</div>
                          <div><span className="text-white">TO:</span> {selectedFlight.destination}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <ControlPanel 
                    arrivingFlights={arrivingFlights}
                    departingFlights={departingFlights}
                    onSelectFlight={handleSelectFlight}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="flights" className="h-[calc(100vh-240px)]">
              <FlightTable 
                arrivingFlights={arrivingFlights}
                departingFlights={departingFlights}
                airportId={airportId || ''}
                onSelectFlight={handleSelectFlight}
              />
              
              {/* Panel de estadísticas */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-600 font-medium">Total Llegadas</div>
                  <div className="text-2xl font-bold">{arrivingFlights.length}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <div className="text-sm text-yellow-600 font-medium">Total Salidas</div>
                  <div className="text-2xl font-bold">{departingFlights.length}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="text-sm text-green-600 font-medium">Aprox. Final</div>
                  <div className="text-2xl font-bold">
                    {arrivingFlights.filter(f => f.status === 'landing').length}
                  </div>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <div className="text-sm text-indigo-600 font-medium">En Pista</div>
                  <div className="text-2xl font-bold">
                    {departingFlights.filter(f => f.status === 'takeoff').length}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AirportControl;
