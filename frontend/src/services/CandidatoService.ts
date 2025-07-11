import axios from "axios";
import {
  Candidato,
  CandidatoCreateRequest,
  CandidatoUpdateRequest,
} from "../models/Candidato";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class CandidatoService {
  private static baseURL = `${API_BASE_URL}/api/candidatos`;

  static async obtenerCandidatos(): Promise<Candidato[]> {
    try {
      const response = await axios.get<Candidato[]>(this.baseURL);
      return response.data;
    } catch (error) {
      console.error("Error al obtener candidatos:", error);
      throw error;
    }
  }

  static async obtenerCandidatosPorEleccion(
    eleccionId: number
  ): Promise<Candidato[]> {
    try {
      const response = await axios.get<Candidato[]>(
        `${this.baseURL}/eleccion/${eleccionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener candidatos por elección:", error);
      throw error;
    }
  }

  static async obtenerCandidatoPorId(id: number): Promise<Candidato> {
    try {
      const response = await axios.get<Candidato>(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener candidato:", error);
      throw error;
    }
  }

  static async crearCandidato(
    candidato: CandidatoCreateRequest
  ): Promise<Candidato> {
    try {
      const formData = new FormData();
      formData.append("nombre", candidato.nombre);
      formData.append("apellido", candidato.apellido);
      formData.append("partido", candidato.partido);
      formData.append("eleccionId", candidato.eleccionId.toString());
      formData.append("orden", candidato.orden.toString());

      if (candidato.propuestas) {
        formData.append("propuestas", candidato.propuestas);
      }

      if (candidato.foto) {
        formData.append("foto", candidato.foto);
      }

      const response = await axios.post<Candidato>(this.baseURL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al crear candidato:", error);
      throw error;
    }
  }

  static async actualizarCandidato(
    candidato: CandidatoUpdateRequest
  ): Promise<Candidato> {
    try {
      const formData = new FormData();
      formData.append("nombre", candidato.nombre);
      formData.append("apellido", candidato.apellido);
      formData.append("partido", candidato.partido);
      formData.append("orden", candidato.orden.toString());

      if (candidato.propuestas) {
        formData.append("propuestas", candidato.propuestas);
      }

      if (candidato.foto) {
        formData.append("foto", candidato.foto);
      }

      const response = await axios.put<Candidato>(
        `${this.baseURL}/${candidato.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar candidato:", error);
      throw error;
    }
  }

  static async eliminarCandidato(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
    } catch (error) {
      console.error("Error al eliminar candidato:", error);
      throw error;
    }
  }
}
