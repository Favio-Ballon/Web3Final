import { Seccion } from "../models/Seccion";
import apiClient from "./interceptors";
const formatCoordinate = (coord: number): string => {
  // Ensure it's a number
  const num = Number(coord);
  if (isNaN(num)) {
    throw new Error(`Invalid coordinate: ${coord}`);
  }

  const formatted = num.toFixed(6).replace(".", ",");

  console.log(`Coordinate formatting: ${coord} -> ${num} -> ${formatted}`);

  return formatted;
};
export class SeccionService {
    getSecciones(): Promise<Array<Seccion>> {
        return new Promise<Array<Seccion>>((resolve, reject) => {
        apiClient
            .get("eleccion/secciones/")
            .then((response) => {
            const data = response.data?.results || response.data || [];
            resolve(Array.isArray(data) ? data : []);
            })
            .catch((error) => {
            console.error("Error in getSecciones:", error);
            reject(new Error("Error al obtener las secciones: " + error.message));
            });
        });
    }
    crearSecciones(seccion: Seccion): Promise<Seccion> {
        return new Promise<Seccion>((resolve, reject) => {
          const formData = new FormData();
          formData.append("nombre", seccion.nombre);
          formData.append("tipo", seccion.tipo);
          formData.append("puntos", JSON.stringify(seccion.puntos.map(p => ({
            latitud: formatCoordinate(p.latitud),
            longitud: formatCoordinate(p.longitud),
          }))));
          apiClient
            .post("eleccion/secciones/crear/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((response) => {
              resolve(response.data);
            })
            .catch((error) => {
              console.error("Error in crearSecciones:", error);
              reject(new Error("Error al crear la sección: " + error.message));
            });
        });
    }
    eliminarSeccion(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            apiClient
                .delete(`eleccion/secciones/${id}`)
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    console.error("Error in eliminarSeccion:", error);
                    reject(new Error("Error al eliminar la sección: " + error.message));
                });
        });
    }
}