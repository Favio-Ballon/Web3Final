import { Eleccion, Mesa } from "../models/Eleccion";
import apiClient from "./interceptors";

export class EleccionService {
  getElecciones(): Promise<Array<Eleccion>> {
    return new Promise<Array<Eleccion>>((resolve, reject) => {
      apiClient
        .get("eleccion/elecciones/")
        .then((response) => {
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getElecciones:", error);
          reject(
            new Error("Error al obtener las elecciones: " + error.message)
          );
        });
    });
  }
  crearEleccion(eleccion: Eleccion): Promise<Eleccion> {
    return new Promise<Eleccion>((resolve, reject) => {
      const formData = new FormData();
      formData.append("nombre", eleccion.nombre);
      formData.append("fecha", eleccion.fecha);
      formData.append("seccion_id", eleccion.seccion.toString());

      apiClient
        .post("eleccion/elecciones/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error in crearEleccion:", error);
          reject(new Error("Error al crear la elección: " + error.message));
        });
    });
  }
  eliminarEleccion(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      apiClient
        .delete(`eleccion/elecciones/${id}/`)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error("Error in eliminarEleccion:", error);
          reject(new Error("Error al eliminar la elección: " + error.message));
        });
    });
  }
  editarEleccion(eleccion: Eleccion): Promise<Eleccion> {
    return new Promise<Eleccion>((resolve, reject) => {
      const formData = new FormData();
      formData.append("nombre", eleccion.nombre);
      formData.append("fecha", eleccion.fecha);
      formData.append("seccion_id", eleccion.seccion.toString());

      apiClient
        .put(`eleccion/elecciones/${eleccion.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error in editarEleccion:", error);
          reject(new Error("Error al editar la elección: " + error.message));
        });
    });
  }
  getMesasByEleccionYRecinto(
    eleccionId: number,
    recintoId: number
  ): Promise<Array<Mesa>> {
    return new Promise<Array<Mesa>>((resolve, reject) => {
      apiClient
        .get(`eleccion/mesas/recinto/${recintoId}/eleccion/${eleccionId}/`)
        .then((response) => {
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getMesasByEleccionYRecinto:", error);
          reject(new Error("Error al obtener las mesas: " + error.message));
        });
    });
  }
  crearYDistribuir(
    eleccionId: number,
    recintos: Array<{ recinto: number; mesas: number }>,
    votantes: number[]
  ): Promise<Mesa[]> {
    return new Promise<Mesa[]>((resolve, reject) => {
      const formData = new FormData();
      formData.append("eleccion_id", eleccionId.toString());
      formData.append("recintos", JSON.stringify(recintos));
      formData.append("votantes", JSON.stringify(votantes));

      apiClient
        .post("eleccion/mesas/crear_y_distribuir/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error in crearYDistribuir:", error);
          reject(
            new Error("Error al crear y distribuir mesas: " + error.message)
          );
        });
    });
  }
}
