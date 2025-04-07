
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from './AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginAsGuest, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-atc-lightBg to-white">
      <Card className="w-full max-w-md shadow-lg border-atc-blue">
        <CardHeader className="bg-atc-blue text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-atc-yellow">
              <path d="M14.639 10.258a1.798 1.798 0 0 1-3.109 0l-9-16A2 2 0 0 1 4.054 2H19.946a2 2 0 0 1 1.524 3.258l-9 16Z"/>
              <path d="M5 2c7.109 5.531 0 16 7.252 16a3 3 0 0 0 3.086-4.459L12.5 9"/>
            </svg>
          </div>
          <CardTitle className="text-center text-2xl font-bold">Air Traffic Control</CardTitle>
          <CardDescription className="text-center text-atc-yellow">Inicia sesión para acceder a tu torre de control</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input
                id="username"
                placeholder="Ingresa tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-atc-blue/30 focus-visible:ring-atc-blue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-atc-blue/30 focus-visible:ring-atc-blue"
              />
              <p className="text-sm text-muted-foreground text-right">
                <a href="#" className="text-atc-blue hover:underline">¿Olvidaste tu contraseña?</a>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-atc-yellow hover:bg-atc-darkYellow text-black" 
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
            
            <div className="flex items-center w-full">
              <Separator className="flex-1" />
              <span className="px-2 text-xs text-muted-foreground">o</span>
              <Separator className="flex-1" />
            </div>
            
            <Button 
              type="button"
              variant="outline" 
              className="w-full border-atc-blue/30 hover:bg-atc-blue/10 text-atc-blue"
              onClick={loginAsGuest}
              disabled={isLoading}
            >
              Acceder como invitado
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-2">
              Credenciales de prueba: admin/admin123 o user/user123
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
