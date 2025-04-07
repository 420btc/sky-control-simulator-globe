
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/components/Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  if (!currentUser) {
    return null;
  }

  // Datos simulados de actividad
  const recentActivity = [
    { date: '2025-04-06', airport: 'MAD', duration: '2h 15m', flights: 47, performance: 'Excelente' },
    { date: '2025-04-05', airport: 'BCN', duration: '1h 30m', flights: 32, performance: 'Buena' },
    { date: '2025-04-04', airport: 'LHR', duration: '3h 00m', flights: 69, performance: 'Excelente' }
  ];

  // Datos simulados de estadísticas
  const stats = {
    totalFlights: 1423,
    totalHours: 126,
    averagePerformance: 'Buena',
    level: currentUser.level,
    airports: currentUser.airports.length,
    rank: currentUser.role === 'admin' ? 'Supervisor' : 'Controlador Junior'
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-atc-blue">Perfil de Usuario</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Datos de usuario */}
        <Card>
          <CardHeader className="bg-atc-blue text-white">
            <CardTitle>Información personal</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-6">
              <div className="h-24 w-24 rounded-full bg-atc-yellow flex items-center justify-center text-3xl font-bold text-atc-darkBg">
                {currentUser.username.substring(0, 1).toUpperCase()}
              </div>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold">{currentUser.username}</h3>
              <Badge variant="outline" className="bg-atc-yellow text-black mt-1">
                {currentUser.role === 'admin' ? 'Administrador' : 'Controlador'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="font-medium">Nivel:</div>
              <div>{stats.level}</div>
              <div className="font-medium">Rango:</div>
              <div>{stats.rank}</div>
              <div className="font-medium">Aeropuertos:</div>
              <div>{stats.airports}</div>
              <div className="font-medium">ID Usuario:</div>
              <div>{currentUser.id}</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Estadísticas */}
        <Card>
          <CardHeader className="bg-atc-blue text-white">
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-atc-blue">{stats.totalFlights}</p>
                  <p className="text-sm text-muted-foreground">Vuelos gestionados</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-atc-blue">{stats.totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Tiempo total</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold">Rendimiento</h3>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-atc-blue h-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Principiante</span>
                  <span className="font-medium">Intermedio</span>
                  <span>Experto</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Aeropuertos certificados</h3>
                <div className="flex flex-wrap gap-1">
                  {currentUser.airports.map(airport => (
                    <Badge 
                      key={airport} 
                      className="bg-atc-lightBg text-atc-blue cursor-pointer hover:bg-atc-yellow hover:text-black"
                      onClick={() => navigate(`/airport/${airport}`)}
                    >
                      {airport}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Objetivos y progreso */}
        <Card>
          <CardHeader className="bg-atc-blue text-white">
            <CardTitle>Objetivos y progreso</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">Nivel {stats.level + 1}</h4>
                  <span className="text-xs">{75}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-atc-yellow h-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Próximos desbloqueos</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Acceso a JFK (Nivel {stats.level + 1})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    <span>Controlador Senior (Nivel {stats.level + 2})</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    <span>Control meteorológico (Nivel {stats.level + 3})</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Logros</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 border rounded-md bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-atc-blue">
                      <circle cx="12" cy="8" r="6"></circle>
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                    </svg>
                    <p className="text-xs mt-1">Primer vuelo</p>
                  </div>
                  <div className="text-center p-2 border rounded-md bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-atc-blue">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47 1-1 1H7c-.53 0-1-.45-1-1v-2.34"></path>
                      <path d="M18 14.66V17c0 .55-.47 1-1 1h-2c-.53 0-1-.45-1-1v-2.34"></path>
                      <path d="M12 9v12"></path>
                      <path d="M6 4v5"></path>
                      <path d="M18 4v5"></path>
                    </svg>
                    <p className="text-xs mt-1">100 vuelos</p>
                  </div>
                  <div className="text-center p-2 border rounded-md bg-gray-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-yellow-500">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <p className="text-xs mt-1">Excelencia</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Actividad reciente */}
      <Card>
        <CardHeader className="bg-atc-blue text-white">
          <CardTitle>Actividad reciente</CardTitle>
          <CardDescription className="text-white/80">Últimas sesiones de control</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Aeropuerto</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Vuelos</TableHead>
                <TableHead>Rendimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity, i) => (
                <TableRow key={i}>
                  <TableCell>{new Date(activity.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-atc-lightBlue/10">
                      {activity.airport}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.duration}</TableCell>
                  <TableCell>{activity.flights}</TableCell>
                  <TableCell>
                    <Badge className={activity.performance === 'Excelente' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {activity.performance}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
