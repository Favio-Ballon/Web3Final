import axios from "axios";
import { LoginResponse } from "../models/dto/LoginResponse";
import { RefreshTokenResponse } from "../models/dto/RefreshTokenResponse";
import apiClient from "./interceptors";
import { UserInfoResponse } from "../models/dto/UserInfoResponse";

export class AuthService {
  login(username: string, password: string): Promise<LoginResponse> {
    return new Promise<LoginResponse>((resolve, reject) => {
      axios
        .post(
          "http://localhost:3000/auth/login/",
          {
            username: username,
            password: password,
          },
          { withCredentials: true }
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al iniciar sesión: " + error.message));
        });
    });
  }
  refreshToken(): Promise<RefreshTokenResponse> {
    return new Promise<RefreshTokenResponse>((resolve, reject) => {
      axios
        .post(
          "http://localhost:3000/auth/refresh/",
          {},
          {
            withCredentials: true,
          }
        )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al refrescar el token: " + error.message));
        });
    });
  }
  logout(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      apiClient
        .post("http://localhost:3000/auth/logout/")
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al cerrar sesión: " + error.message));
        });
    });
  }

  me(): Promise<UserInfoResponse> {
    return new Promise<UserInfoResponse>((resolve, reject) => {
      apiClient
        .get("usuario/info/me/")
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(
            new Error(
              "Error al obtener la información del usuario: " + error.message
            )
          );
        });
    });
  }

  all(): Promise<Array<UserInfoResponse>> {
    return new Promise<Array<UserInfoResponse>>((resolve, reject) => {
      apiClient
        .get("usuario/info/all/")
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al obtener los usuarios: " + error.message));
        });
    });
  }
}
