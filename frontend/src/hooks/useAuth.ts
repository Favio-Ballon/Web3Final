import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { loginUser, logoutUser } from "../redux/slices/authSlice";
import { AuthService } from "../services/AuthService";
import { useNavigate } from "react-router";
type LoginParams = {
  access_token: string;
  refresh_token: string;
  email: string;
};
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const email = useAppSelector((state) => state.auth.email);
  const doLogin = (params: LoginParams) => {
    dispatch(
      loginUser({
        email: params.email,
      })
    );
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
    // si no hay token en cookies, ignorar
    if (!document.cookie.includes("access_token")) {
      console.log("No access token found in cookies");
      return;
    }

    new AuthService().me().then((response) => {
      if (response.email) {
        console.log("User is logged in with email:", response);
        if (window.location.href.includes("admin") && !response.is_staff) {
          window.location.href = "/";
        }
        dispatch(
          loginUser({
            email: response.email,
            rol: response.rol,
            first_name: response.first_name,
            last_name: response.last_name,
          })
        );
      } else {
        console.log("User is not logged in");
        if (window.location.href.includes("admin")) {
          window.location.href = "/";
        }
      }
    });
  }, []);

  return { email, doLogin, doLogout };
};
