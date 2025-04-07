
import { useAuth } from "@/components/Auth/AuthContext";
import WorldMap from "@/components/Map/WorldMap";
import LoginForm from "@/components/Auth/LoginForm";
import Navbar from "@/components/Layout/Navbar";

const Index = () => {
  const { currentUser, isLoading } = useAuth();

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
        <div className="bg-white rounded-lg p-4 shadow-md h-full">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-atc-blue">Mapa de tráfico aéreo</h1>
              <p className="text-muted-foreground">Seleccione un aeropuerto para acceder a su torre de control</p>
            </div>
            <div className="flex-1 relative rounded-lg overflow-hidden shadow-inner border border-gray-200">
              <WorldMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
