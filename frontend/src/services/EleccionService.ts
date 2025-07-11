import { Eleccion } from "../models/Eleccion";
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
                    reject(new Error("Error al obtener las elecciones: " + error.message));
                });
        });
    }
    crearEleccion(eleccion: Eleccion): Promise<Eleccion> {
        return new Promise<Eleccion>((resolve, reject) => {
            const formData = new FormData();
            formData.append("nombre", eleccion.nombre);
            formData.append("fecha", eleccion.fecha);
            formData.append("seccion", eleccion.seccion.toString());

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
            formData.append("seccion", eleccion.seccion.toString());

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
}