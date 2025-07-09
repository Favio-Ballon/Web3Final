import { Votante, VotanteCreateRequest } from "../models/Votante";
import apiClient from "./interceptors";

export class PadronService {
  getVotantes(): Promise<Array<Votante>> {
    return new Promise<Array<Votante>>((resolve, reject) => {
      apiClient
        .get("padron/votantes")
        .then((response) => {
          // Handle different possible response structures
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in getVotantes:", error);
          reject(new Error("Error al obtener los votantes: " + error.message));
        });
    });
  }

  createVotante(votante: VotanteCreateRequest): Promise<Votante> {
    return new Promise<Votante>((resolve, reject) => {
      const formData = new FormData();

      formData.append("ci", votante.ci.toString());
      formData.append("nombre", votante.nombre);
      formData.append("apellido", votante.apellido);
      formData.append("direccion", votante.direccion);
      formData.append("fechaNacimiento", votante.fechaNacimiento);
      formData.append("latitud", votante.latitud.toString());
      formData.append("longitud", votante.longitud.toString());
      formData.append("departamento", votante.departamento);
      formData.append("ciudad", votante.ciudad);
      formData.append("provincia", votante.provincia);

      formData.append("foto", votante.foto);
      formData.append("ciReverso", votante.ciReverso);
      formData.append("ciAnverso", votante.ciAnverso);

      apiClient
        .post("padron/votantes", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al crear el votante: " + error.message));
        });
    });
  }

  getVotanteByCi(ci: number): Promise<Votante> {
    return new Promise<Votante>((resolve, reject) => {
      apiClient
        .get(`padron/votantes/estado/${ci}`)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          console.error("Error in getVotanteByCi:", error);
          reject(
            new Error("Error al obtener el votante por CI: " + error.message)
          );
        });
    });
  }

  updateVotante(votante: VotanteCreateRequest, id: number): Promise<Votante> {
    return new Promise<Votante>((resolve, reject) => {
      const formData = new FormData();

      formData.append("ci", votante.ci.toString());
      formData.append("nombre", votante.nombre);
      formData.append("apellido", votante.apellido);
      formData.append("direccion", votante.direccion);
      formData.append("fechaNacimiento", votante.fechaNacimiento);
      formData.append("latitud", votante.latitud.toString());
      formData.append("longitud", votante.longitud.toString());
      formData.append("departamento", votante.departamento);
      formData.append("ciudad", votante.ciudad);
      formData.append("provincia", votante.provincia);

      // Append files
      formData.append("foto", votante.foto);
      formData.append("ciReverso", votante.ciReverso);
      formData.append("ciAnverso", votante.ciAnverso);

      apiClient
        .put(`padron/votantes/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(new Error("Error al actualizar el votante: " + error.message));
        });
    });
  }

  deleteVotante(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      apiClient
        .delete(`padron/votantes/${id}`)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(new Error("Error al eliminar el votante: " + error.message));
        });
    });
  }
}
