import { useAppSelector } from "../redux/hooks";
import { AuthService } from "../services/AuthService";

// Hook específico para manejo de roles
export const useRole = () => {
    
  const rol = useAppSelector((state) => state.auth.rol);
  const email = useAppSelector((state) => state.auth.email);

  const isAuthenticated = !!email;

  const hasRole = (requiredRole: string) => {
    return rol === requiredRole;
  };

  const hasAnyRole = (requiredRoles: string[]) => {
    return requiredRoles.some((role) => rol === role);
  };

  const isSuperAdmin = () => {
    return rol === "super_admin";
  };

  const isAdmin = () => {
    return rol === "admin" || rol === "super_admin";
  };

  const isUser = () => {
    return rol === "user";
  };

  const canAccessAdminPanel = () => {
    return isSuperAdmin();
  };

  const canManageUsers = () => {
    return isSuperAdmin() || isAdmin();
  };

  const canVote = () => {
    return isAuthenticated; // Todos los usuarios autenticados pueden votar
  };

  const getRoleDisplayName = () => {
    switch (rol) {
      case "super_admin":
        return "Super Administrador";
      case "admin":
        return "Administrador";
      case "user":
        return "Usuario";
      default:
        return "Sin rol asignado";
    }
  };

  return {
    rol,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isUser,
    canAccessAdminPanel,
    canManageUsers,
    canVote,
    getRoleDisplayName,
  };
};
