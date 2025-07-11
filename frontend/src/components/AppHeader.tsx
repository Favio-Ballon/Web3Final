import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const routes = [
  { name: 'Secciones', path: '/secciones' },
  { name: 'Elecciones', path: '/elecciones' },
  { name: 'Recintos', path: '/recintos' },
  { name: 'Cargos', path: '/cargos' },
  { name: 'Candidaturas', path: '/candidaturas' },
];

export const AppHeader: React.FC = () => {
  const { email, doLogout } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <nav className="flex items-center space-x-4">
        {routes.map(route => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium hover:bg-primary/75 ${
                isActive ? 'bg-secondary text-secondary-foreground' : ''
              }`
            }
          >
            {route.name}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <span>{email}</span>
        <button onClick={doLogout} className="flex items-center gap-1 hover:underline">
          <FiLogOut /> Salir
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
