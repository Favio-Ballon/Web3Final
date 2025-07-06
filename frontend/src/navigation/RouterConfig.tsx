import { Routes, Route } from 'react-router-dom';
import { URLS } from './CONSTANTS';
import UsersRoutes from '../pages/gestionUsuarios';
import VotacionRoutes from '../pages/sistemaVotacion';
import PadronElectoralRoutes from '../pages/padrónElectoral';
import AdminElectoralRoutes from '../pages/administracionElectoral';
import { LoginForm } from '../pages/LoginForm';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function RouterConfig() {
  return (
    <Routes>
        <Route path={URLS.HOME} element={
          <ProtectedRoute requireAuth={true}>
            <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/30 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-card rounded-lg shadow-lg p-8">
                  <h1 className="text-3xl font-bold text-foreground mb-6">
                    Bienvenido al Sistema Electoral
                  </h1>
                  <p className="text-muted-foreground">
                    Selecciona una opción del menú para continuar.
                  </p>
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path={URLS.LOGIN} element={<LoginForm/>} />
        
        <Route path={`${URLS.GESTIONUSUARIOS}/*`} element={
          <ProtectedRoute requiredRoles={["super_admin"]}>
            <UsersRoutes />
          </ProtectedRoute>
        } />
        
        <Route path={`${URLS.PADRONELECTORAL}/*`} element={
          <ProtectedRoute requiredRoles={["admin_padron"]}>
            <PadronElectoralRoutes />
          </ProtectedRoute>
        } />
        
        <Route path={`${URLS.ADMINISTRACIONELECTORAL}/*`} element={
          <ProtectedRoute requiredRoles={["admin_elecciones"]}>
            <AdminElectoralRoutes />
          </ProtectedRoute>
        } />
        
        <Route path={`${URLS.VOTACION}/*`} element={
          <ProtectedRoute requiredRoles={["jurado"]}>
            <VotacionRoutes />
          </ProtectedRoute>
        } />
        
        <Route path={URLS.NOT_FOUND} element={<div>Página no encontrada</div>} />
    </Routes>
  );
}