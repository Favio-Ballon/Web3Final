import { Recinto } from "../models/Recinto";
import { Mesa } from "../models/Mesa";
import apiClient from "./interceptors";

export class RecintoService {
  getRecintos(): Promise<Array<Recinto>> {
    return new Promise<Array<Recinto>>((resolve, reject) => {
      apiClient
        .get("eleccion/recintos/")
        .then((response) => {
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getRecintos:", error);
          reject(new Error("Error al obtener los recintos: " + error.message));
        });
    });
  }
  crearRecinto(recinto: Recinto): Promise<Recinto> {
    return new Promise<Recinto>((resolve, reject) => {
      const formData = new FormData();
      formData.append("nombre", recinto.nombre);
      formData.append("latitud", recinto.latitud.toString());
      formData.append("longitud", recinto.longitud.toString());
      formData.append("seccion_id", recinto.seccion.toString());

      apiClient
        .post("eleccion/recintos/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error in crearRecinto:", error);
          reject(new Error("Error al crear el recinto: " + error.message));
        });
    });
  }
  editarRecinto(recinto: Recinto): Promise<Recinto> {
    return new Promise<Recinto>((resolve, reject) => {
      const formData = new FormData();
      formData.append("nombre", recinto.nombre);
      formData.append("latitud", recinto.latitud.toString());
      formData.append("longitud", recinto.longitud.toString());
      formData.append("seccion_id", recinto.seccion.toString());

      apiClient
        .put(`eleccion/recintos/${recinto.id}/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error in editarRecinto:", error);
          reject(new Error("Error al editar el recinto: " + error.message));
        });
    });
  }
  eliminarRecinto(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      apiClient
        .delete(`eleccion/recintos/${id}/`)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error("Error in eliminarRecinto:", error);
          reject(new Error("Error al eliminar el recinto: " + error.message));
        });
    });
  }
  getRecintoById(id: number): Promise<Recinto> {
    return new Promise<Recinto>((resolve, reject) => {
      apiClient
        .get(`eleccion/recintos/${id}/`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error in getRecintoById:", error);
          reject(new Error("Error al obtener el recinto: " + error.message));
        });
    });
  }
  getRecintosBySeccion(seccionId: number): Promise<Array<Recinto>> {
    return new Promise<Array<Recinto>>((resolve, reject) => {
      apiClient
        .get(`eleccion/recintos/seccion/${seccionId}`)
        .then((response) => {
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getRecintosBySeccion:", error);
          reject(
            new Error(
              "Error al obtener los recintos por sección: " + error.message
            )
          );
        });
    });
  }
  getRecintosByEleccion(eleccionId: number): Promise<Array<Recinto>> {
    return new Promise<Array<Recinto>>((resolve, reject) => {
      apiClient
        .get(`eleccion/recintos/eleccion/${eleccionId}`)
        .then((response) => {
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getRecintosByEleccion:", error);
          reject(
            new Error(
              "Error al obtener los recintos por elección: " + error.message
            )
          );
        });
    });
  }

  createMesaByRecinto(recintoId: number, mesas: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      formData.append("recinto_id", recintoId.toString());
      formData.append("cantidad_mesas", mesas.toString());

      apiClient
        .post("eleccion/mesas/crear-mesas/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error("Error in createMesaByRecinto:", error);
          reject(
            new Error("Error al crear mesas por recinto: " + error.message)
          );
        });
    });
  }

  getMesaByRecintoId(recintoId: number): Promise<Array<Mesa>> {
    return new Promise<Array<Mesa>>((resolve, reject) => {
      apiClient
        .get(`eleccion/mesas/recinto/${recintoId}/`)
        .then((response) => {
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getMesaByRecintoId:", error);
          reject(
            new Error("Error al obtener mesas por recinto: " + error.message)
          );
        });
    });
  }

  updateMesaJefe(mesaId: number, jefeId: number | null): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const formData = new FormData();
      if (jefeId !== null) {
        formData.append("jefeId", jefeId.toString());
        formData.append("mesaId", mesaId.toString());
      } else {
        formData.append("jefe_id", "");
      }

      apiClient
        .post(`eleccion/mesas/asignar-jurado/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.error("Error in updateMesaJefe:", error);
          reject(
            new Error("Error al actualizar jefe de mesa: " + error.message)
          );
        });
    });
  }
}
