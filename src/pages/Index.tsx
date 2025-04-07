
import { useAuth } from "@/components/Auth/AuthContext";
import WorldMap from "@/components/Map/WorldMap";
import LoginForm from "@/components/Auth/LoginForm";
import Navbar from "@/components/Layout/Navbar";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlightApi from "@/services/flightApi";
import { toast } from "sonner";

const Index = () => {
  const { currentUser, isLoading } = useAuth();
  const [stats, setStats] = useState({
    flightCount: 0,
    activePilots: 0,
    airports: 0
  });

  useEffect(() => {
    // Inicializar estadísticas
    if (currentUser) {
      const api = FlightApi.getInstance();
      const flights = api.getAllFlights();
      const airports = api.getAllAirports();
      
      setStats({
        flightCount: flights.length,
        activePilots: new Set(flights.map(f => f.callsign.substring(0, 3))).size,
        airports: airports.length
      });
      
      // Mostrar mensaje de bienvenida
      toast.success(
        `Bienvenido, ${currentUser.username}! Hay ${flights.length} vuelos activos.`, 
        { duration: 4000 }
      );
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-atc-lightBg to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-atc-blue">Cargando Sky Controller</h1>
          <div className="w-16 h-16 border-4 border-atc-blue border-t-atc-yellow rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar formulario de login
  if (!currentUser) {
    return <LoginForm />;
  }

  // Si hay usuario autenticado, mostrar el mapa mundial
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
          <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-bold text-atc-blue">Centro de Control Aéreo</h1>
              <p className="text-muted-foreground">Seleccione un aeropuerto para acceder a su torre de control</p>
            </div>
            
            {/* Estadísticas */}
            <div className="mt-4 md:mt-0 flex space-x-4 text-sm">
              <div className="bg-blue-50 p-2 rounded-md border border-blue-100">
                <div className="font-semibold text-atc-blue">Vuelos activos</div>
                <div className="text-xl font-bold">{stats.flightCount}</div>
              </div>
              <div className="bg-yellow-50 p-2 rounded-md border border-yellow-100">
                <div className="font-semibold text-atc-blue">Aerolíneas</div>
                <div className="text-xl font-bold">{stats.activePilots}</div>
              </div>
              <div className="bg-green-50 p-2 rounded-md border border-green-100">
                <div className="font-semibold text-atc-blue">Aeropuertos</div>
                <div className="text-xl font-bold">{stats.airports}</div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="map" className="flex-1 flex flex-col">
            <TabsList className="justify-start mx-4 mt-2">
              <TabsTrigger value="map">Mapa Mundial</TabsTrigger>
              <TabsTrigger value="flights">Vuelos Activos</TabsTrigger>
              <TabsTrigger value="guide">Guía del Controlador</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="flex-1 p-4 pt-2">
              <div className="h-full relative rounded-lg overflow-hidden shadow-inner border border-gray-200">
                <WorldMap />
                
                {/* Overlay con instrucciones */}
                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs">
                  <h3 className="font-bold text-atc-blue text-sm">Cómo jugar:</h3>
                  <ul className="text-xs mt-1 list-disc list-inside">
                    <li>Haz clic en un aeropuerto para ver su torre de control</li>
                    <li>Observa cómo los vuelos se desplazan en tiempo real</li>
                    <li>Las rutas se irán dibujando gradualmente</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="flights" className="flex-1 p-4 pt-2">
              <div className="h-full overflow-auto bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3 text-atc-blue">Vuelos en curso</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {FlightApi.getInstance().getAllFlights().map((flight) => (
                    <div key={flight.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="font-bold">{flight.callsign}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          flight.status === 'enroute' ? 'bg-blue-100 text-blue-800' : 
                          flight.status === 'landing' ? 'bg-yellow-100 text-yellow-800' :
                          flight.status === 'takeoff' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {flight.status === 'enroute' ? 'En ruta' :
                          flight.status === 'landing' ? 'Aterrizando' :
                          flight.status === 'takeoff' ? 'Despegando' : 
                          'Programado'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{flight.aircraft}</div>
                      <div className="flex justify-between mt-2 text-xs">
                        <div>
                          <span className="font-semibold">Origen:</span> {flight.origin}
                        </div>
                        <div>→</div>
                        <div>
                          <span className="font-semibold">Destino:</span> {flight.destination}
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <div><span className="font-semibold">Altitud:</span> {flight.altitude}00 ft</div>
                        <div><span className="font-semibold">Velocidad:</span> {flight.speed} kts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="guide" className="flex-1 p-4 pt-2">
              <div className="h-full overflow-auto bg-gray-50 rounded-lg p-4">
                <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-atc-blue mb-4">Guía del Controlador Aéreo</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">Introducción</h3>
                      <p className="mt-1 text-gray-700">
                        Bienvenido a Sky Controller, tu simulador de control aéreo. Como controlador,
                        tu misión es garantizar que todos los aviones despeguen y aterricen de forma
                        segura, manteniendo separación entre ellos y gestionando el tráfico en tu aeropuerto.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">Conceptos básicos</h3>
                      <ul className="list-disc list-inside mt-1 text-gray-700 space-y-1">
                        <li><span className="font-medium">Torre de control:</span> Centro desde donde dirigirás todas las operaciones.</li>
                        <li><span className="font-medium">Pistas:</span> Zonas designadas para despegues y aterrizajes.</li>
                        <li><span className="font-medium">Callsigns:</span> Identificadores únicos de cada vuelo (ej. IBE1234).</li>
                        <li><span className="font-medium">Altitud:</span> Altura a la que vuela un avión, medida en pies (ft).</li>
                        <li><span className="font-medium">Separación:</span> Distancia de seguridad entre aeronaves.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">Cómo jugar</h3>
                      <ol className="list-decimal list-inside mt-1 text-gray-700 space-y-1">
                        <li>Selecciona un aeropuerto en el mapa para acceder a su torre de control.</li>
                        <li>Visualiza los vuelos entrantes y salientes en el panel de control.</li>
                        <li>Gestiona las pistas asignando prioridades de aterrizaje y despegue.</li>
                        <li>Mantén la separación entre aeronaves para evitar conflictos.</li>
                        <li>Controla las condiciones meteorológicas que afectarán a tus decisiones.</li>
                      </ol>
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                      <h3 className="font-semibold">Consejo profesional</h3>
                      <p className="text-sm text-gray-700 mt-1">
                        Prioriza siempre la seguridad. En caso de duda, es mejor retrasar un despegue 
                        o desviar un aterrizaje que arriesgar una colisión. ¡El mejor controlador es el 
                        que mantiene la calma bajo presión!
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg">Niveles de dificultad</h3>
                      <p className="mt-1 text-gray-700">
                        A medida que aumentes tu nivel como controlador, accederás a aeropuertos con mayor 
                        tráfico y complejidad, donde deberás gestionar más pistas y más vuelos simultáneamente.
                      </p>
                    </div>
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

export default Index;
