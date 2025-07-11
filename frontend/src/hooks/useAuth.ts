import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  loginUser,
  logoutUser,
  updateUserRole,
  updateUserProfile,
  setInitialized,
} from "../redux/slices/authSlice";
import { AuthService } from "../services/AuthService";
import { useNavigate } from "react-router";

type LoginParams = {
  access_token: string;
  refresh_token: string;
  email: string;
  rol?: string;
  first_name?: string;
  last_name?: string;
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const email = useAppSelector((state) => state.auth.email);
  const rol = useAppSelector((state) => state.auth.rol);
  const first_name = useAppSelector((state) => state.auth.first_name);
  const last_name = useAppSelector((state) => state.auth.last_name);
  const isInitialized = useAppSelector((state) => state.auth.isInitialized);

  const doLogin = (params: LoginParams) => {
    dispatch(
      loginUser({
        email: params.email,
        rol: params.rol,
        first_name: params.first_name,
        last_name: params.last_name,
      })
    );
  };

  // La autenticación se basa en si tenemos datos del usuario válidos del servidor
  const isAuthenticated = !!email && isInitialized;

  const hasRole = (requiredRole: string) => {
    return rol === requiredRole;
  };

  const isSuperAdmin = () => {
    return rol === "super_admin";
  };

  const updateRole = (newRole: string) => {
    dispatch(updateUserRole(newRole));
  };

  const updateProfile = (profile: {
    rol?: string;
    first_name?: string;
    last_name?: string;
  }) => {
    dispatch(updateUserProfile(profile));
  };
  const doLogout = () => {
    new AuthService()
      .logout()
      .then(() => {
        dispatch(logoutUser());
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
  };
  useEffect(() => {
    // Siempre validar el estado de autenticación con el servidor al montar
    if (!isInitialized) {
      new AuthService()
        .me()
        .then((response) => {
          if (response.email) {
            console.log("User authenticated with server:", response);
            dispatch(
              loginUser({
                email: response.email,
                rol: response.rol,
                first_name: response.first_name,
                last_name: response.last_name,
              })
            );
          } else {
            // Si no hay usuario válido, marcar como inicializado
            dispatch(setInitialized(true));
          }
        })
        .catch(() => {
          // En caso de error (no autenticado, token expirado, etc.)
          // marcar como inicializado sin datos de usuario
          dispatch(setInitialized(true));
        });
    }
  }, [dispatch, isInitialized]);

  return {
    email,
    rol,
    first_name,
    last_name,
    isInitialized,
    doLogin,
    doLogout,
    isAuthenticated,
    hasRole,
    isSuperAdmin,
    updateRole,
    updateProfile,
  };
};
