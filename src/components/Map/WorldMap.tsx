
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import FlightApi, { Flight, Airport } from '@/services/flightApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Soluciona el problema con los iconos en React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapLayerControl } from './MapLayerControl';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface WorldMapProps {
  centerPosition?: [number, number];
  zoom?: number;
  selectedAirport?: string;
  onSelectAirport?: (airportId: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({
  centerPosition = [20, 0],
  zoom = 2,
  selectedAirport,
  onSelectAirport
}) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [visibleRoutes, setVisibleRoutes] = useState<Record<string, number[]>>({});
  const prevFlightsRef = useRef<Flight[]>([]);
  const navigate = useNavigate();
  const api = FlightApi.getInstance();
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  
  useEffect(() => {
    // Iniciar la API y obtener datos iniciales
    api.startUpdates();
    setAirports(api.getAllAirports());
    const initialFlights = api.getAllFlights();
    setFlights(initialFlights);
    
    // Inicializar las rutas visibles (al principio ninguna es visible)
    const initialRoutes: Record<string, number[]> = {};
    initialFlights.forEach(flight => {
      initialRoutes[flight.id] = [];
    });
    setVisibleRoutes(initialRoutes);
    
    // Actualizar los datos cada 5 segundos
    const interval = setInterval(() => {
      const updatedFlights = api.getAllFlights();
      setFlights([...updatedFlights]);
      
      // Detectar nuevos vuelos para mostrar notificaciones
      const prevFlightIds = new Set(prevFlightsRef.current.map(f => f.id));
      updatedFlights.forEach(flight => {
        if (!prevFlightIds.has(flight.id)) {
          // Nuevo vuelo detectado
          toast.info(`Nuevo vuelo detectado: ${flight.callsign} (${flight.origin} → ${flight.destination})`, {
            duration: 3000,
          });
          
          // Crear entrada para su ruta (inicialmente vacía)
          setVisibleRoutes(prev => ({
            ...prev,
            [flight.id]: []
          }));
        }
      });
      
      // Actualizar referencia de vuelos previos
      prevFlightsRef.current = updatedFlights;
    }, 5000);
    
    // Intervalo para ir revelando gradualmente las rutas
    const routeInterval = setInterval(() => {
      setVisibleRoutes(prev => {
        const updated = { ...prev };
        
        flights.forEach(flight => {
          if (flight.route && flight.route.length > 0) {
            // Si la ruta aún no está completa, revelar un punto más
            const currentVisible = updated[flight.id] || [];
            if (currentVisible.length < flight.route.length) {
              updated[flight.id] = [...currentVisible, currentVisible.length];
            }
          }
        });
        
        return updated;
      });
    }, 1000); // Revelar un punto cada segundo
    
    return () => {
      clearInterval(interval);
      clearInterval(routeInterval);
      api.stopUpdates();
    };
  }, []);
  
  const handleAirportClick = (airport: Airport) => {
    // Reproducir efecto sonoro de "click" (simulado con console.log)
    console.log("Airport selected sound would play here");
    
    if (onSelectAirport) {
      onSelectAirport(airport.id);
    } else {
      navigate(`/airport/${airport.id}`);
    }
  };

  const getFlightIcon = (flight: Flight) => {
    // Determinar la rotación del icono según el rumbo del vuelo
    const rotationStyle = {
      transform: `rotate(${flight.heading}deg)`,
      transformOrigin: 'center',
    };
    
    // Determinar el color según el estado del vuelo
    let color = '#0057b7'; // Azul por defecto (en ruta)
    if (flight.status === 'takeoff') color = '#00a8e8'; // Azul claro para despegando
    if (flight.status === 'landing') color = '#ffd700'; // Amarillo para aterrizando
    
    return (
      <div className="flight-marker" style={rotationStyle}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill={color} 
          stroke="#ffffff" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
          <path d="m14 8-3 3-3-3" />
          <path d="M10 17V8" />
        </svg>
      </div>
    );
  };

  // Función para generar rutas parciales basadas en los puntos visibles
  const getVisibleRoutePath = (flight: Flight): [number, number][] => {
    if (!flight.route || !visibleRoutes[flight.id]) return [];
    
    const visiblePoints = visibleRoutes[flight.id];
    return visiblePoints.map(i => {
      const point = flight.route![i];
      return [point[1], point[0]] as [number, number];
    });
  };

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
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
      
      {/* Aeropuertos */}
      {airports.map(airport => (
        <CircleMarker 
          key={airport.id}
          center={[airport.position[1], airport.position[0]]}
          pathOptions={{ 
            fillColor: selectedAirport === airport.id ? '#ffd700' : '#0057b7', 
            fillOpacity: 0.8,
            color: selectedAirport === airport.id ? '#ffd700' : '#0057b7',
            weight: 2
          }}
          radius={selectedAirport === airport.id ? 12 : 6}
          eventHandlers={{
            click: () => handleAirportClick(airport)
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">{airport.name}</h3>
              <p className="text-sm">Código IATA: {airport.iataCode}</p>
              <p className="text-xs">Pistas: {airport.runways}</p>
              <div className="text-xs mt-1">
                <span className="font-semibold">Nivel de tráfico: </span>
                <span className="inline-flex items-center">
                  {[...Array(10)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`w-1.5 h-3 mx-px ${i < airport.traffic ? 'bg-atc-blue' : 'bg-gray-200'}`}
                    />
                  ))}
                </span>
              </div>
              <button 
                className="mt-2 px-3 py-1 bg-atc-blue text-white text-xs rounded hover:bg-atc-lightBlue transition-colors"
                onClick={() => handleAirportClick(airport)}
              >
                Ver torre de control
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      
      {/* Vuelos */}
      {flights.map(flight => (
        <React.Fragment key={flight.id}>
          {/* Ruta del vuelo (ahora se revela gradualmente) */}
          {flight.route && visibleRoutes[flight.id] && visibleRoutes[flight.id].length > 1 && (
            <Polyline
              positions={getVisibleRoutePath(flight)}
              pathOptions={{ 
                color: 
                  flight.status === 'enroute' ? '#0057b7' :
                  flight.status === 'landing' ? '#ffd700' :
                  flight.status === 'takeoff' ? '#00a8e8' : 
                  '#ffffff',
                opacity: 0.6,
                weight: 2,
                dashArray: flight.status === 'scheduled' ? '5, 5' : undefined
              }}
            />
          )}
          
          {/* Icono de avión personalizado */}
          <CircleMarker
            center={[flight.position[1], flight.position[0]]}
            radius={0}
            pathOptions={{ fillOpacity: 0 }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold">{flight.callsign}</h3>
                <p className="text-sm">{flight.aircraft}</p>
                <div className="grid grid-cols-2 gap-1 text-xs my-1">
                  <div>Origen: <span className="font-bold">{flight.origin}</span></div>
                  <div>Destino: <span className="font-bold">{flight.destination}</span></div>
                  <div>Altitud: <span className="font-bold">{flight.altitude}00 ft</span></div>
                  <div>Velocidad: <span className="font-bold">{flight.speed} kts</span></div>
                </div>
                <p className="text-xs">Estado: {
                  flight.status === 'enroute' ? 'En ruta' :
                  flight.status === 'landing' ? 'Aterrizando' :
                  flight.status === 'takeoff' ? 'Despegando' : 'Programado'
                }</p>
              </div>
            </Popup>
            {getFlightIcon(flight)}
          </CircleMarker>
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default WorldMap;
