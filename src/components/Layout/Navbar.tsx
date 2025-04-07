
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/Auth/AuthContext';
import Clock from '@/components/UI/Clock';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <header className="bg-atc-darkBg text-white py-2 px-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-atc-yellow">
              <path d="M14.639 10.258a1.798 1.798 0 0 1-3.109 0l-9-16A2 2 0 0 1 4.054 2H19.946a2 2 0 0 1 1.524 3.258l-9 16Z"/>
              <path d="M5 2c7.109 5.531 0 16 7.252 16a3 3 0 0 0 3.086-4.459L12.5 9"/>
            </svg>
            <span className="font-bold text-lg hidden sm:inline">Sky Controller</span>
          </Link>
          
          <div className="hidden md:flex gap-4">
            <NavItem to="/" label="Mapa global" active={location.pathname === '/'} />
            <NavItem to="/profile" label="Perfil" active={location.pathname === '/profile'} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Clock />
          </div>
          <div className="flex items-center gap-1">
            <div className="text-sm text-atc-yellow hidden md:block">
              <span className="opacity-70">Controlador:</span> {currentUser.username}
            </div>
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 hover:text-atc-yellow" 
              onClick={logout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavItemProps {
  to: string;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, active }) => {
  return (
    <Link 
      to={to} 
      className={`px-3 py-1 rounded-md text-sm transition-colors ${
        active 
          ? 'bg-atc-blue text-white' 
          : 'hover:bg-atc-blue/20 text-gray-300'
      }`}
    >
      {label}
    </Link>
  );
};

export default Navbar;
