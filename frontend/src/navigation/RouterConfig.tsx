import { Routes, Route } from "react-router-dom";
import { URLS } from "./CONSTANTS";
import UsersRoutes from "../pages/gestionUsuarios";
import VotacionRoutes from "../pages/sistemaVotacion";
import PadronElectoralRoutes from "../pages/padrónElectoral";
import AdminElectoralRoutes from "../pages/administracionElectoral";
import SeccionRoutes from "../pages/administracionElectoral/secciones";
import { LoginForm } from "../pages/LoginForm";
import { VerificacionPadron } from "../pages/VerificacionPadron";
import { ProtectedRoute } from "../components/ProtectedRoute";
import RecintoRoutes from "../pages/administracionElectoral/recintos";
import EleccionesRoutes from "../pages/administracionElectoral/elecciones";
import CargosRoutes from "../pages/administracionElectoral/cargos";
import CandidaturaRoutes from "../pages/administracionElectoral/candidatura";

export default function RouterConfig() {
  return (
    <Routes>
      <Route
        path={URLS.HOME}
        element={
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
        }
      />

      <Route path={URLS.LOGIN} element={<LoginForm />} />

      {/* Ruta pública para verificación del padrón */}
      <Route path={URLS.VERIFICACION_PADRON} element={<VerificacionPadron />} />

      <Route
        path={`${URLS.GESTIONUSUARIOS}/*`}
        element={
          <ProtectedRoute requiredRoles={["super_admin"]}>
            <UsersRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path={`${URLS.PADRONELECTORAL}/*`}
        element={
          <ProtectedRoute requiredRoles={["admin_padron"]}>
            <PadronElectoralRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path={`${URLS.ADMINISTRACIONELECTORAL}/*`}
        element={
          <ProtectedRoute requiredRoles={["admin_elecciones"]}>
            <AdminElectoralRoutes />
          </ProtectedRoute>
        }
      />

      <Route
        path={`${URLS.VOTACION}/*`}
        element={
          // <ProtectedRoute requiredRoles={["jurado"]}>
          <VotacionRoutes />
          // </ProtectedRoute>
        }
      />

      <Route path={URLS.NOT_FOUND} element={<div>Página no encontrada</div>} />

      <Route
        path={`${URLS.SECCIONES}/*`}
        element={
          <ProtectedRoute requiredRoles={["admin_elecciones"]}>
            <SeccionRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${URLS.ELECCIONES}/*`}
        element={
          <ProtectedRoute requiredRoles={["admin_elecciones"]}>
            <EleccionesRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${URLS.RECINTOS}/*`}
        element={
          <ProtectedRoute requiredRoles={["admin_elecciones"]}>
            <RecintoRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${URLS.CARGOS}/*`}
        element={
          <ProtectedRoute requiredRoles={["admin_elecciones"]}>
            <CargosRoutes />
          </ProtectedRoute>
        }
      />
      <Route
        path={`${URLS.CANDIDATURAS}/*`}
        element={
          <ProtectedRoute requiredRoles={["admin_elecciones"]}>
            <CandidaturaRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
