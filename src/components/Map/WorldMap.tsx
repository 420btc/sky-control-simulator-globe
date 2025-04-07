
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import FlightApi, { Flight, Airport } from '@/services/flightApi';
import { useNavigate } from 'react-router-dom';

// Soluciona el problema con los iconos en React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
  const navigate = useNavigate();
  const api = FlightApi.getInstance();
  
  useEffect(() => {
    // Iniciar la API y obtener datos iniciales
    api.startUpdates();
    setAirports(api.getAllAirports());
    setFlights(api.getAllFlights());
    
    // Actualizar los datos cada 5 segundos
    const interval = setInterval(() => {
      setFlights([...api.getAllFlights()]);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      api.stopUpdates();
    };
  }, []);
  
  const handleAirportClick = (airport: Airport) => {
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
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill={color} 
          stroke="#ffffff" 
          strokeWidth="1" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
        </svg>
      </div>
    );
  };

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
          <Marker 
            position={[flight.position[1], flight.position[0]]}
            icon={DefaultIcon}
            opacity={0}
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
          </Marker>
          
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
          
          {/* Ruta del vuelo */}
          {flight.route && (
            <Polyline
              positions={flight.route.map(coord => [coord[1], coord[0]])}
              pathOptions={{ 
                color: 
                  flight.status === 'enroute' ? '#0057b7' :
                  flight.status === 'landing' ? '#ffd700' :
                  flight.status === 'takeoff' ? '#00a8e8' : 
                  '#ffffff',
                opacity: 0.6,
                weight: 2
              }}
            />
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default WorldMap;
