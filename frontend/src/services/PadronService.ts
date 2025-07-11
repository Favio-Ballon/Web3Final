import {
  Votante,
  VotanteCreateRequest,
  VotantePublic,
  VotanteUpdateRequest,
} from "../models/Votante";
import apiClient from "./interceptors";

// Utility function to format coordinates safely
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

      // Ensure coordinates are formatted with comma as decimal separator
      const latitudStr = formatCoordinate(votante.latitud);
      const longitudStr = formatCoordinate(votante.longitud);

      console.log("Sending coordinates (create):", {
        latitud: latitudStr,
        longitud: longitudStr,
      });

      formData.append("latitud", latitudStr);
      formData.append("longitud", longitudStr);
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

  getVotanteByCi(ci: number): Promise<VotantePublic> {
    return new Promise<VotantePublic>((resolve, reject) => {
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

  static buscarVotantePorCI(ci: number): Promise<VotantePublic> {
    return new Promise<VotantePublic>((resolve, reject) => {
      apiClient
        .get(`padron/votantes/buscar/${ci}`)
        .then((response) => {
          if (response.data) {
            resolve(response.data);
          } else {
            reject(new Error("Votante no encontrado"));
          }
        })
        .catch((error) => {
          console.error("Error al buscar votante por CI:", error);
          reject(new Error("Error al buscar el votante: " + error.message));
        });
    });
  }

  updateVotante(votante: VotanteUpdateRequest, id: number): Promise<Votante> {
    return new Promise<Votante>((resolve, reject) => {
      const formData = new FormData();

      formData.append("ci", votante.ci.toString());
      formData.append("nombre", votante.nombre);
      formData.append("apellido", votante.apellido);
      formData.append("direccion", votante.direccion);
      formData.append("fechaNacimiento", votante.fechaNacimiento);

      // Ensure coordinates are formatted with comma as decimal separator
      const latitudStr = formatCoordinate(votante.latitud);
      const longitudStr = formatCoordinate(votante.longitud);

      console.log("Sending coordinates (update):", {
        latitud: latitudStr,
        longitud: longitudStr,
      });

      formData.append("latitud", latitudStr);
      formData.append("longitud", longitudStr);
      formData.append("departamento", votante.departamento);
      formData.append("ciudad", votante.ciudad);
      formData.append("provincia", votante.provincia);

      // Only append files if they are present
      if (votante.foto) {
        formData.append("foto", votante.foto);
      }
      if (votante.ciReverso) {
        formData.append("ciReverso", votante.ciReverso);
      }
      if (votante.ciAnverso) {
        formData.append("ciAnverso", votante.ciAnverso);
      }

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
  filtrarUbicacion({departamento, ciudad, provincia}: {departamento?: string; ciudad?: string; provincia?: string}): Promise<Array<Votante>> {
    return new Promise<Array<Votante>>((resolve, reject) => {
      const params: Record<string, string> = {};
      if (departamento) params.departamento = departamento;
      if (ciudad) params.ciudad = ciudad;
      if (provincia) params.provincia = provincia;

      apiClient
        .get("padron/votantes/filtrar", { params })
        .then((response) => {
          const data = response.data?.results || response.data || [];
          resolve(Array.isArray(data) ? data : []);
        })
        .catch((error) => {
          console.error("Error in filtrarUbicacion:", error);
          reject(new Error("Error al filtrar votantes: " + error.message));
        });
    });
  }
}
