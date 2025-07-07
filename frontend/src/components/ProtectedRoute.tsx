import React from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "../hooks/useRole";
import { useAuth } from "../hooks/useAuth";
import { URLS } from "../navigation/CONSTANTS";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  adminOnly?: boolean;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  adminOnly = false,
  requireAuth = true,
}) => {
  const { isAuthenticated, hasRole, hasAnyRole, canAccessAdminPanel } =
    useRole();

  const { isInitialized } = useAuth();

  // Si no está inicializado, mostrar un loading
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={URLS.LOGIN} replace />;
  }

  // Si es solo para admin y no tiene acceso
  if (adminOnly && !canAccessAdminPanel()) {
    return <Navigate to={URLS.HOME} replace />;
  }

  // Si requiere un rol específico
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={URLS.HOME} replace />;
  }

  // Si requiere alguno de varios roles
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <Navigate to={URLS.HOME} replace />;
  }

  return <>{children}</>;
};
