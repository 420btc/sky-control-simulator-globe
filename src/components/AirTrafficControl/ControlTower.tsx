
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FlightApi, { Flight, Airport } from '@/services/flightApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Clock from '@/components/UI/Clock';
import RunwayView from './RunwayView';
import FlightTable from './FlightTable';

const ControlTower: React.FC = () => {
  const { airportId } = useParams<{ airportId: string }>();
  const [airport, setAirport] = useState<Airport | null>(null);
  const [arrivingFlights, setArrivingFlights] = useState<Flight[]>([]);
  const [departingFlights, setDepartingFlights] = useState<Flight[]>([]);
  const api = FlightApi.getInstance();

  useEffect(() => {
    if (!airportId) return;

    // Obtener datos del aeropuerto
    const airportData = api.getAirport(airportId);
    if (airportData) {
      setAirport(airportData);
    }

    // Obtener vuelos iniciales
    updateFlightData();
    
    // Configurar actualizaciones periódicas
    const interval = setInterval(updateFlightData, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [airportId]);

  const updateFlightData = () => {
    if (!airportId) return;
    
    // Actualizar vuelos llegando
    setArrivingFlights(api.getArrivingFlights(airportId));
    
    // Actualizar vuelos saliendo
    setDepartingFlights(api.getDepartingFlights(airportId));
  };

  if (!airport) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Cargando torre de control...</h1>
          <p>Espere un momento mientras se cargan los datos del aeropuerto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-2">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        {/* Cabecera y información del aeropuerto */}
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-atc-blue">
                {airport.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>IATA: {airport.iataCode}</span>
                <span>•</span>
                <span>Pistas: {airport.runways}</span>
                <span>•</span>
                <div className="flex items-center">
                  Tráfico: 
                  <div className="ml-1 flex">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1 h-3 mx-0.5 rounded-sm ${
                          i < airport.traffic ? 'bg-atc-blue' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <Clock />
          </div>
        </div>
      </div>
      
      {/* Vista de torre y datos de vuelo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Vista de pistas y radar */}
        <div className="lg:col-span-2">
          <Card className="h-[500px] overflow-hidden">
            <CardHeader className="p-4 bg-atc-darkBg text-white">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Vista de pistas</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-atc-yellow text-black border-none">
                    {arrivingFlights.length} llegadas
                  </Badge>
                  <Badge variant="outline" className="bg-atc-blue text-white border-none">
                    {departingFlights.length} salidas
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(100%-53px)]">
              <RunwayView airport={airport} arrivingFlights={arrivingFlights} departingFlights={departingFlights} />
            </CardContent>
          </Card>
        </div>
        
        {/* Panel de información de vuelos */}
        <div>
          <Card className="h-[500px]">
            <CardHeader className="p-4 bg-atc-blue text-white">
              <CardTitle className="text-lg">Panel de control</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="arrivals" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="arrivals" className="data-[state=active]:bg-atc-yellow data-[state=active]:text-black">Llegadas</TabsTrigger>
                  <TabsTrigger value="departures" className="data-[state=active]:bg-atc-yellow data-[state=active]:text-black">Salidas</TabsTrigger>
                </TabsList>
                <TabsContent value="arrivals" className="h-[380px] overflow-y-auto">
                  <FlightTable flights={arrivingFlights} type="arrivals" />
                </TabsContent>
                <TabsContent value="departures" className="h-[380px] overflow-y-auto">
                  <FlightTable flights={departingFlights} type="departures" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ControlTower;
