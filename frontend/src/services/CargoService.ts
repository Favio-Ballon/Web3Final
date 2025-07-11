import { Cargo } from "../models/Cargo";
import apiClient from "./interceptors";

export class CargoService {
    getCargos(): Promise<Array<Cargo>> {
        return new Promise<Array<Cargo>>((resolve, reject) => {
            apiClient
                .get("eleccion/cargos/")
                .then((response) => {
                    const data = response.data?.results || response.data || [];
                    resolve(Array.isArray(data) ? data : []);
                })
                .catch((error) => {
                    console.error("Error in getCargos:", error);
                    reject(new Error("Error al obtener los cargos: " + error.message));
                });
        });
    }

    crearCargo(cargo: Cargo): Promise<Cargo> {
        return new Promise<Cargo>((resolve, reject) => {
            const formData = new FormData();
            formData.append("nombre", cargo.nombre);
            formData.append("seccion_id", cargo.seccion.toString());

            apiClient
                .post("eleccion/cargos/", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error("Error in crearCargo:", error);
                    reject(new Error("Error al crear el cargo: " + error.message));
                });
        });
    }
    editarCargo(cargo: Cargo): Promise<Cargo> {
        return new Promise<Cargo>((resolve, reject) => {
            const formData = new FormData();
            formData.append("nombre", cargo.nombre);
            formData.append("seccion_id", cargo.seccion.toString());

            apiClient
                .put(`eleccion/cargos/${cargo.id}/`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    console.error("Error in editarCargo:", error);
                    reject(new Error("Error al editar el cargo: " + error.message));
                });
        });
    }
    eliminarCargo(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            apiClient
                .delete(`eleccion/cargos/${id}/`)
                .then(() => {
                    resolve();
                })
                .catch((error) => {
                    console.error("Error in eliminarCargo:", error);
                    reject(new Error("Error al eliminar el cargo: " + error.message));
                });
        });
    }
}