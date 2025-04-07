
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Flight } from '@/services/flightApi';

interface FlightTableProps {
  flights: Flight[];
  type: 'arrivals' | 'departures';
}

const FlightTable: React.FC<FlightTableProps> = ({ flights, type }) => {
  // Ordenamos los vuelos: primero los que están aterrizando/despegando, luego por ETA
  const sortedFlights = [...flights].sort((a, b) => {
    // Primero por estado (landing/takeoff primero)
    if ((a.status === 'landing' || a.status === 'takeoff') && 
        (b.status !== 'landing' && b.status !== 'takeoff')) {
      return -1;
    }
    if ((b.status === 'landing' || b.status === 'takeoff') && 
        (a.status !== 'landing' && a.status !== 'takeoff')) {
      return 1;
    }
    
    // Luego por ETA
    if (a.eta && b.eta) {
      return new Date(a.eta).getTime() - new Date(b.eta).getTime();
    }
    return 0;
  });

  // Función para formatear el tiempo de ETA a formato legible
  const formatEta = (etaString?: string) => {
    if (!etaString) return 'N/A';
    
    const eta = new Date(etaString);
    const now = new Date();
    
    // Si es hoy, mostrar solo la hora
    if (eta.toDateString() === now.toDateString()) {
      return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Si es otro día, mostrar fecha y hora
    return eta.toLocaleString([], {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para determinar el estado del vuelo en español
  const getStatus = (flight: Flight) => {
    switch (flight.status) {
      case 'landing':
        return <span className="text-atc-blue font-medium">Aterrizando</span>;
      case 'takeoff':
        return <span className="text-atc-yellow font-medium">Despegando</span>;
      case 'enroute':
        return 'En ruta';
      case 'scheduled':
        return 'Programado';
      default:
        return 'N/A';
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vuelo</TableHead>
            <TableHead>{type === 'arrivals' ? 'Origen' : 'Destino'}</TableHead>
            <TableHead>{type === 'arrivals' ? 'ETA' : 'ETD'}</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFlights.length > 0 ? (
            sortedFlights.map(flight => (
              <TableRow key={flight.id}>
                <TableCell className="font-medium">{flight.callsign}</TableCell>
                <TableCell>{type === 'arrivals' ? flight.origin : flight.destination}</TableCell>
                <TableCell>{formatEta(flight.eta)}</TableCell>
                <TableCell>{getStatus(flight)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-sm text-muted-foreground">
                No hay vuelos {type === 'arrivals' ? 'llegando' : 'saliendo'} en este momento
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default FlightTable;
