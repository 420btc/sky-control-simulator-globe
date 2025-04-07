
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import FlightApi, { Flight } from '@/services/flightApi';
import Navbar from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/Auth/AuthContext';
import { MapLayerControl } from '@/components/Map/MapLayerControl';

// Icono personalizado para el avión del jugador
const playerIcon = new Icon({
  iconUrl: '/player-plane.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  className: 'player-plane'
});

// Componente para controlar el avión con teclas WASD
const KeyboardController = ({ 
  onKeyPress, 
  isActive 
}: { 
  onKeyPress: (key: string) => void;
  isActive: boolean;
}) => {
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        onKeyPress(key);
        e.preventDefault(); // Prevenir comportamiento por defecto
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress, isActive]);
  
  return null;
};

// Componente para manejar el centrado automático del mapa
const MapController = ({ 
  position, 
  autoCenter 
}: { 
  position: [number, number]; 
  autoCenter: boolean;
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (autoCenter) {
      map.setView(position, map.getZoom());
    }
  }, [position, autoCenter, map]);
  
  return null;
};

const FlightSimulator = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [playerPosition, setPlayerPosition] = useState<[number, number]>([0, 0]);
  const [playerHeading, setPlayerHeading] = useState(0);
  const [playerSpeed, setPlayerSpeed] = useState(5);
  const [autoCenter, setAutoCenter] = useState(true);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);
  const [targetCheckpoint, setTargetCheckpoint] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Inicializar datos de vuelo
    if (flightId) {
      const api = FlightApi.getInstance();
      const flightData = api.getFlight(flightId);
      
      if (flightData) {
        setFlight(flightData);
        // Inicializar posición del jugador cerca del origen
        setPlayerPosition([flightData.position[1], flightData.position[0]]);
        setPlayerHeading(flightData.heading);
        
        toast.success(`¡Vuelo ${flightData.callsign} seleccionado! Usa WASD para controlar tu avión`, {
          duration: 5000,
        });
      } else {
        toast.error('Vuelo no encontrado');
        navigate('/');
      }
    }
  }, [flightId, navigate, currentUser]);
  
  // Manejar las teclas de control
  const handleKeyPress = (key: string) => {
    if (!gameActive) return;
    
    // Clonar la posición actual
    const newPosition: [number, number] = [...playerPosition];
    let newHeading = playerHeading;
    
    // Aplicar movimiento basado en la tecla
    switch (key) {
      case 'w': // Adelante
        // Calcular el nuevo punto basado en el heading actual
        newPosition[0] += Math.sin(playerHeading * Math.PI / 180) * (playerSpeed / 5000);
        newPosition[1] += Math.cos(playerHeading * Math.PI / 180) * (playerSpeed / 5000);
        break;
      case 's': // Atrás
        newPosition[0] -= Math.sin(playerHeading * Math.PI / 180) * (playerSpeed / 10000);
        newPosition[1] -= Math.cos(playerHeading * Math.PI / 180) * (playerSpeed / 10000);
        break;
      case 'a': // Izquierda (girar)
        newHeading = (playerHeading - 5) % 360;
        if (newHeading < 0) newHeading += 360;
        setPlayerHeading(newHeading);
        break;
      case 'd': // Derecha (girar)
        newHeading = (playerHeading + 5) % 360;
        setPlayerHeading(newHeading);
        break;
    }
    
    // Actualizar posición
    setPlayerPosition(newPosition);
    
    // Comprobar si ha alcanzado el siguiente checkpoint
    if (flight?.route && targetCheckpoint < flight.route.length) {
      const target = flight.route[targetCheckpoint];
      const distance = calculateDistance(
        [newPosition[1], newPosition[0]],
        [target[0], target[1]]
      );
      
      if (distance < 0.5) { // 0.5 grados es aproximadamente 50km en el ecuador
        // Checkpoint alcanzado
        setCompletedCheckpoints([...completedCheckpoints, targetCheckpoint]);
        setScore(score + 100);
        setTargetCheckpoint(targetCheckpoint + 1);
        
        if (targetCheckpoint + 1 >= (flight.route?.length || 0)) {
          // Ruta completada
          toast.success('¡Ruta completada con éxito!', {
            duration: 5000,
          });
          setGameActive(false);
        } else {
          toast.info('Checkpoint alcanzado! +100 puntos', {
            duration: 2000,
          });
        }
      }
    }
  };
  
  // Calcular distancia entre dos puntos
  const calculateDistance = (point1: [number, number], point2: [number, number]) => {
    const dx = point1[0] - point2[0];
    const dy = point1[1] - point2[1];
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setCompletedCheckpoints([]);
    setTargetCheckpoint(0);
    
    // Inicializar posición del jugador cerca del origen si hay un vuelo seleccionado
    if (flight) {
      const origin = flight.route?.[0] || [flight.position[0], flight.position[1]];
      setPlayerPosition([origin[1], origin[0]]);
    }
    
    toast.info('¡Juego iniciado! Usa WASD para controlar el avión', {
      duration: 3000,
    });
  };

  if (!flight) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-atc-lightBg to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-atc-blue">Cargando vuelo...</h1>
          <div className="w-16 h-16 border-4 border-atc-blue border-t-atc-yellow rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex-1 overflow-hidden p-4">
        <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-atc-blue">Simulador de Vuelo</h1>
                <p className="text-muted-foreground">
                  Vuelo: <span className="font-semibold">{flight.callsign}</span> - 
                  {flight.origin} → {flight.destination}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  Volver al mapa
                </Button>
                
                <Button 
                  onClick={startGame}
                  disabled={gameActive}
                  variant="default"
                >
                  {gameActive ? 'En progreso...' : 'Iniciar simulación'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 flex flex-col md:flex-row gap-4">
            {/* Panel izquierdo con datos del vuelo */}
            <div className="md:w-1/4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="mb-4">
                <h3 className="font-semibold text-atc-blue">Panel de control</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <div className="text-xs text-gray-500">Velocidad</div>
                    <div className="font-bold">{playerSpeed} kt</div>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <div className="text-xs text-gray-500">Rumbo</div>
                    <div className="font-bold">{Math.round(playerHeading)}°</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold">Controles</h4>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-center text-sm">
                    <div></div>
                    <div className="bg-gray-200 p-1 rounded">W</div>
                    <div></div>
                    <div className="bg-gray-200 p-1 rounded">A</div>
                    <div className="bg-gray-200 p-1 rounded">S</div>
                    <div className="bg-gray-200 p-1 rounded">D</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    W: Avanzar, S: Retroceder, A: Girar izq., D: Girar der.
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-atc-blue">Datos del vuelo</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div><span className="font-semibold">Avión:</span> {flight.aircraft}</div>
                  <div><span className="font-semibold">Altitud:</span> {flight.altitude}00 ft</div>
                  <div><span className="font-semibold">Velocidad real:</span> {flight.speed} kts</div>
                  <div><span className="font-semibold">Estado:</span> {
                    flight.status === 'enroute' ? 'En ruta' :
                    flight.status === 'landing' ? 'Aterrizando' :
                    flight.status === 'takeoff' ? 'Despegando' : 'Programado'
                  }</div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold text-atc-blue">Progreso</h3>
                <div className="mt-2">
                  <div className="text-xl font-bold">{score} pts</div>
                  <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-atc-blue" 
                      style={{
                        width: `${flight.route ? (completedCheckpoints.length / flight.route.length) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs mt-1">
                    Checkpoints: {completedCheckpoints.length}/{flight.route?.length || 0}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <input 
                  id="auto-center" 
                  type="checkbox" 
                  checked={autoCenter}
                  onChange={e => setAutoCenter(e.target.checked)}
                  className="rounded border-gray-300 h-4 w-4 text-atc-blue"
                />
                <label htmlFor="auto-center" className="ml-2 text-sm">
                  Centrar mapa automáticamente
                </label>
              </div>
            </div>
            
            {/* Mapa principal */}
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
              <MapContainer
                center={playerPosition}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
              >
                {mapType === 'standard' ? (
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                ) : (
                  <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                )}
                
                <MapLayerControl 
                  position="topright" 
                  mapType={mapType} 
                  onChangeMapType={(type) => setMapType(type)} 
                />
                
                <KeyboardController 
                  onKeyPress={handleKeyPress} 
                  isActive={gameActive} 
                />
                
                <MapController 
                  position={playerPosition} 
                  autoCenter={autoCenter} 
                />
                
                {/* Avión del jugador */}
                <Marker 
                  position={playerPosition} 
                  icon={playerIcon}
                  rotationAngle={playerHeading}
                  rotationOrigin="center"
                />
                
                {/* Ruta del vuelo */}
                {flight.route && flight.route.length > 0 && (
                  <>
                    <Polyline
                      positions={flight.route.map(point => [point[1], point[0]])}
                      pathOptions={{ 
                        color: '#0057b7', 
                        weight: 2, 
                        opacity: 0.6, 
                        dashArray: '5, 5'
                      }}
                    />
                    
                    {/* Checkpoints */}
                    {flight.route.map((point, index) => (
                      <CircleMarker
                        key={`checkpoint-${index}`}
                        center={[point[1], point[0]]}
                        radius={index === targetCheckpoint ? 10 : 5}
                        pathOptions={{
                          fillColor: completedCheckpoints.includes(index) ? '#4CAF50' :
                                     index === targetCheckpoint ? '#FFC107' : '#90CAF9',
                          fillOpacity: 0.8,
                          color: completedCheckpoints.includes(index) ? '#4CAF50' :
                                 index === targetCheckpoint ? '#FFC107' : '#2196F3',
                          weight: 1
                        }}
                      />
                    ))}
                  </>
                )}
              </MapContainer>
              
              {/* Overlay con instrucciones */}
              {!gameActive && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-6 rounded-lg shadow-lg text-center max-w-sm">
                  <h3 className="text-xl font-bold text-atc-blue">Simulador de vuelo</h3>
                  <p className="mt-2">Pulsa "Iniciar simulación" para comenzar a controlar tu avión.</p>
                  <p className="mt-2 text-sm text-gray-600">Sigue los checkpoints para completar la ruta.</p>
                  <Button 
                    onClick={startGame}
                    variant="default"
                    className="mt-4"
                  >
                    Iniciar simulación
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSimulator;
