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

  const isAuthenticated = !!email;

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
    // Solo ejecutar si no está inicializado
    if (!isInitialized) {
      new AuthService()
        .me()
        .then((response) => {
          if (response.email) {
            console.log("User is logged in with email:", response);
            dispatch(
              loginUser({
                email: response.email,
                rol: response.rol,
                first_name: response.first_name,
                last_name: response.last_name,
              })
            );
          } else {
            // Marcar como inicializado aunque no haya usuario
            dispatch(setInitialized(true));
          }
        })
        .catch(() => {
          // En caso de error, marcar como inicializado
          dispatch(setInitialized(true));
        });
    } else if (email) {
      // Si ya está inicializado y hay email, significa que se recuperó de la persistencia
      console.log("Auth state recovered from persistence:", {
        email,
        rol,
        first_name,
        last_name,
      });
    }
  }, [dispatch, isInitialized, email, rol, first_name, last_name]);

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
