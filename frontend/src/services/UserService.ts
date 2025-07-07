import { User } from "../models/User";
import apiClient from "./interceptors";

export class UserService {
  getUsers(): Promise<Array<User>> {
    return new Promise<Array<User>>((resolve, reject) => {
      apiClient
        .get("info/all/")
        .then((response) => {
          // Handle different possible response structures
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getUsers:", error);
          reject(new Error("Error al obtener los usuarios: " + error.message));
        });
    });
  }

  createUser(user: User): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      apiClient
        .post("info/create/", user)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al crear el usuario: " + error.message));
        });
    });
  }
  updateUser(user: User, id: number): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      apiClient
        .put(`info/${id}/update/`, user)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al actualizar el usuario: " + error.message));
        });
    });
  }
  deleteUser(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      apiClient
        .delete(`info/${id}/delete/`)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(new Error("Error al eliminar el usuario: " + error.message));
        });
    });
  }
}
