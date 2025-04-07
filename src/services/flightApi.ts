
import * as turf from '@turf/turf';

// Tipo para los datos de vuelo
export interface Flight {
  id: string;
  callsign: string;
  origin: string;
  destination: string;
  aircraft: string;
  altitude: number;
  speed: number;
  heading: number;
  position: [number, number]; // [longitud, latitud]
  status: 'enroute' | 'landing' | 'takeoff' | 'scheduled';
  eta?: string;
  route?: [number, number][]; // Lista de puntos [longitud, latitud]
}

// Tipo para aeropuertos
export interface Airport {
  id: string;
  name: string;
  iataCode: string;
  position: [number, number]; // [longitud, latitud]
  runways: number;
  traffic: number; // Nivel de tráfico de 1 a 10
}

// API simulada para vuelos y aeropuertos
class FlightApi {
  private static instance: FlightApi;
  private flights: Map<string, Flight> = new Map();
  private airports: Map<string, Airport> = new Map();
  private updateInterval: number | null = null;

  // Aeropuertos principales
  private readonly MAIN_AIRPORTS = [
    { id: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', iataCode: 'MAD', position: [-3.5667, 40.4667], runways: 4, traffic: 8 },
    { id: 'BCN', name: 'Barcelona-El Prat', iataCode: 'BCN', position: [2.0833, 41.2969], runways: 3, traffic: 7 },
    { id: 'LHR', name: 'London Heathrow', iataCode: 'LHR', position: [-0.4614, 51.4700], runways: 2, traffic: 10 },
    { id: 'CDG', name: 'Paris Charles de Gaulle', iataCode: 'CDG', position: [2.5478, 49.0097], runways: 4, traffic: 9 },
    { id: 'JFK', name: 'New York John F. Kennedy', iataCode: 'JFK', position: [-73.7781, 40.6413], runways: 4, traffic: 8 },
    { id: 'DXB', name: 'Dubai International', iataCode: 'DXB', position: [55.3644, 25.2528], runways: 2, traffic: 9 },
    { id: 'HND', name: 'Tokyo Haneda', iataCode: 'HND', position: [139.7798, 35.5494], runways: 4, traffic: 8 },
    { id: 'SYD', name: 'Sydney Kingsford Smith', iataCode: 'SYD', position: [151.1772, -33.9399], runways: 3, traffic: 6 },
    { id: 'GRU', name: 'São Paulo-Guarulhos', iataCode: 'GRU', position: [-46.4728, -23.4356], runways: 2, traffic: 7 },
    { id: 'CPT', name: 'Cape Town International', iataCode: 'CPT', position: [18.6021, -33.9648], runways: 2, traffic: 5 }
  ];

  // Nombres de aerolíneas para generar call signs
  private readonly AIRLINES = [
    { code: 'IBE', name: 'Iberia' },
    { code: 'RYR', name: 'Ryanair' },
    { code: 'BAW', name: 'British Airways' },
    { code: 'AFR', name: 'Air France' },
    { code: 'DLH', name: 'Lufthansa' },
    { code: 'UAE', name: 'Emirates' },
    { code: 'AAL', name: 'American Airlines' },
    { code: 'DAL', name: 'Delta Air Lines' },
    { code: 'UAL', name: 'United Airlines' },
    { code: 'THY', name: 'Turkish Airlines' }
  ];

  // Tipos de aviones para generar datos de vuelo
  private readonly AIRCRAFT_TYPES = [
    'A320', 'A330', 'A350', 'A380',
    'B737', 'B747', 'B777', 'B787',
    'E190', 'CRJ9', 'DH8D', 'AT76'
  ];

  private constructor() {
    // Inicializamos los aeropuertos
    this.MAIN_AIRPORTS.forEach(airport => {
      this.airports.set(airport.id, airport);
    });

    // Generamos vuelos iniciales
    this.generateFlights(50);
  }

  public static getInstance(): FlightApi {
    if (!FlightApi.instance) {
      FlightApi.instance = new FlightApi();
    }
    return FlightApi.instance;
  }

  // Genera vuelos aleatorios entre aeropuertos
  private generateFlights(count: number): void {
    const airportIds = Array.from(this.airports.keys());

    for (let i = 0; i < count; i++) {
      // Seleccionar aeropuertos de origen y destino diferentes
      const originIndex = Math.floor(Math.random() * airportIds.length);
      let destIndex = Math.floor(Math.random() * airportIds.length);
      while (destIndex === originIndex) {
        destIndex = Math.floor(Math.random() * airportIds.length);
      }

      const origin = this.airports.get(airportIds[originIndex])!;
      const destination = this.airports.get(airportIds[destIndex])!;

      // Generar posición en la ruta entre origen y destino
      const line = turf.lineString([origin.position, destination.position]);
      const length = turf.length(line, { units: 'kilometers' });
      const progress = Math.random(); // Progreso aleatorio en la ruta (0-1)
      const along = turf.along(line, length * progress, { units: 'kilometers' });
      const position: [number, number] = [along.geometry.coordinates[0], along.geometry.coordinates[1]];

      // Generar call sign
      const airline = this.AIRLINES[Math.floor(Math.random() * this.AIRLINES.length)];
      const flightNumber = Math.floor(Math.random() * 9000) + 1000;
      const callsign = `${airline.code}${flightNumber}`;

      // Generar otros datos del vuelo
      const aircraft = this.AIRCRAFT_TYPES[Math.floor(Math.random() * this.AIRCRAFT_TYPES.length)];
      const altitude = Math.floor(Math.random() * 350) + 150; // 15,000-50,000 pies
      const speed = Math.floor(Math.random() * 300) + 400; // 400-700 knots
      const heading = this.calculateHeading(origin.position, destination.position);

      // Calcular tiempo estimado de llegada
      const remainingDistance = length * (1 - progress);
      const timeInHours = remainingDistance / (speed * 1.852); // Convertir nudos a km/h
      const now = new Date();
      const eta = new Date(now.getTime() + timeInHours * 60 * 60 * 1000).toISOString();

      // Determinar estado del vuelo
      let status: Flight['status'] = 'enroute';
      if (progress < 0.1) status = 'takeoff';
      if (progress > 0.9) status = 'landing';

      // Crear objeto de vuelo
      const flight: Flight = {
        id: `FL${i}`,
        callsign,
        origin: origin.id,
        destination: destination.id,
        aircraft,
        altitude,
        speed,
        heading,
        position,
        status,
        eta,
        route: [origin.position, position, destination.position]
      };

      this.flights.set(flight.id, flight);
    }
  }

  // Calcula el rumbo entre dos puntos
  private calculateHeading(start: [number, number], end: [number, number]): number {
    const startPoint = turf.point(start);
    const endPoint = turf.point(end);
    const bearing = turf.bearing(startPoint, endPoint);
    return bearing < 0 ? bearing + 360 : bearing;
  }

  // Actualiza la posición de los vuelos basado en su velocidad y rumbo
  private updateFlightPositions(): void {
    this.flights.forEach(flight => {
      // Determinar si el vuelo está cerca del destino
      const destAirport = this.airports.get(flight.destination)!;
      const currentPoint = turf.point(flight.position);
      const destPoint = turf.point(destAirport.position);
      const distance = turf.distance(currentPoint, destPoint, { units: 'kilometers' });

      // Si está muy cerca del destino, generar un nuevo vuelo
      if (distance < 50) {
        // 10% de probabilidad de generar un nuevo vuelo desde el destino
        if (Math.random() < 0.1) {
          const availableDestinations = Array.from(this.airports.keys())
            .filter(id => id !== flight.destination);
          const newDest = availableDestinations[Math.floor(Math.random() * availableDestinations.length)];
          
          // Actualizar el vuelo con nuevo origen y destino
          flight.origin = flight.destination;
          flight.destination = newDest;
          flight.position = [...this.airports.get(flight.origin)!.position];
          flight.status = 'takeoff';
          flight.altitude = Math.floor(Math.random() * 100) + 50; // Altitud de despegue
          flight.heading = this.calculateHeading(
            this.airports.get(flight.origin)!.position, 
            this.airports.get(flight.destination)!.position
          );
          
          // Actualizar la ruta
          flight.route = [
            this.airports.get(flight.origin)!.position, 
            flight.position, 
            this.airports.get(flight.destination)!.position
          ];
        } else {
          // Eliminar el vuelo
          this.flights.delete(flight.id);
        }
        return;
      }

      // Actualizar posición basado en velocidad y rumbo
      const speedKmPerSecond = (flight.speed * 1.852) / 3600; // Convertir nudos a km/s
      const newPoint = turf.destination(
        currentPoint, 
        speedKmPerSecond * 5, // Actualizar cada 5 segundos para simulación
        flight.heading
      );
      
      flight.position = [newPoint.geometry.coordinates[0], newPoint.geometry.coordinates[1]];
      
      // Actualizar altitud y velocidad para despegues y aterrizajes
      if (flight.status === 'takeoff') {
        flight.altitude = Math.min(flight.altitude + Math.floor(Math.random() * 20) + 10, 350);
        flight.speed = Math.min(flight.speed + Math.floor(Math.random() * 10) + 5, 700);
        if (flight.altitude >= 300) flight.status = 'enroute';
      } else if (distance < 200 && flight.altitude > 100) {
        flight.status = 'landing';
        flight.altitude = Math.max(flight.altitude - Math.floor(Math.random() * 10) - 5, 10);
        flight.speed = Math.max(flight.speed - Math.floor(Math.random() * 5) - 2, 180);
      }
      
      // Actualizar ETA
      const remainingDistance = turf.distance(
        turf.point(flight.position), 
        turf.point(this.airports.get(flight.destination)!.position), 
        { units: 'kilometers' }
      );
      const timeInHours = remainingDistance / (flight.speed * 1.852);
      const now = new Date();
      flight.eta = new Date(now.getTime() + timeInHours * 60 * 60 * 1000).toISOString();
      
      // Actualizar ruta
      if (flight.route) {
        flight.route[1] = flight.position;
      }
    });
    
    // Generar nuevos vuelos si hay menos de 50
    if (this.flights.size < 50) {
      this.generateFlights(Math.floor(Math.random() * 3) + 1); // 1-3 nuevos vuelos
    }
  }

  // Inicia la actualización periódica de los vuelos
  public startUpdates(): void {
    if (this.updateInterval === null) {
      this.updateInterval = window.setInterval(() => {
        this.updateFlightPositions();
      }, 5000);
    }
  }

  // Detiene las actualizaciones
  public stopUpdates(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Obtiene todos los vuelos activos
  public getAllFlights(): Flight[] {
    return Array.from(this.flights.values());
  }

  // Obtiene un vuelo por su ID
  public getFlight(id: string): Flight | undefined {
    return this.flights.get(id);
  }

  // Obtiene todos los aeropuertos
  public getAllAirports(): Airport[] {
    return Array.from(this.airports.values());
  }

  // Obtiene un aeropuerto por su ID
  public getAirport(id: string): Airport | undefined {
    return this.airports.get(id);
  }

  // Obtiene vuelos en ruta a un aeropuerto específico
  public getArrivingFlights(airportId: string): Flight[] {
    return Array.from(this.flights.values())
      .filter(flight => flight.destination === airportId);
  }

  // Obtiene vuelos saliendo de un aeropuerto específico
  public getDepartingFlights(airportId: string): Flight[] {
    return Array.from(this.flights.values())
      .filter(flight => flight.origin === airportId && flight.status === 'takeoff');
  }
}

export default FlightApi;
