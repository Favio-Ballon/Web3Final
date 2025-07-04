import { Routes, Route } from 'react-router-dom';
import { URLS } from './CONSTANTS';
import UsersRoutes from '../pages/gestionUsuarios';
import VotacionRoutes from '../pages/sistemaVotacion';
import PadronElectoralRoutes from '../pages/padrónElectoral';
import AdminElectoralRoutes from '../pages/administracionElectoral';

export default function RouterConfig() {
  return (
    <Routes>
        <Route path={URLS.HOME} element={<div>Inicio</div>} />
        <Route path={URLS.LOGIN} element={<div>Login</div>} />
        <Route path={URLS.GESTIONUSUARIOS} element={<UsersRoutes />} />
        <Route path={URLS.PADRONELECTORAL} element={< PadronElectoralRoutes />} />
        <Route path={URLS.ADMINISTRACIONELECTORAL} element={<AdminElectoralRoutes />} />
        <Route path={URLS.VOTACION} element={<VotacionRoutes />} />
        <Route path={URLS.NOT_FOUND} element={<div>Página no encontrada</div>} />
    </Routes>
  );
}