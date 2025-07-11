import axios from "axios";
import { Papeleta, PapeletaHabilitacion } from "../models/Papeleta";
import { v4 as uuidv4 } from "uuid";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class PapeletaService {
  private static baseURL = `${API_BASE_URL}/api/papeletas`;

  static async generarPapeleta(eleccionId: number): Promise<Papeleta> {
    try {
      const papeleta: Papeleta = {
        id: uuidv4(),
        eleccionId,
        estado: "disponible",
        candidatos: [],
      };

      const response = await axios.post<Papeleta>(this.baseURL, papeleta);
      return response.data;
    } catch (error) {
      console.error("Error al generar papeleta:", error);
      throw error;
    }
  }

  static async habilitarPapeleta(
    papeletaId: string,
    votanteId: number,
    maquinaJuradoId: string
  ): Promise<PapeletaHabilitacion> {
    try {
      const response = await axios.put<PapeletaHabilitacion>(
        `${this.baseURL}/${papeletaId}/habilitar`,
        {
          votanteId,
          maquinaJuradoId,
          fechaHabilitacion: new Date().toISOString(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al habilitar papeleta:", error);
      throw error;
    }
  }

  static async obtenerPapeletasDisponibles(
    eleccionId: number
  ): Promise<Papeleta[]> {
    try {
      const response = await axios.get<Papeleta[]>(
        `${this.baseURL}/disponibles/${eleccionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener papeletas disponibles:", error);
      throw error;
    }
  }

  static async obtenerPapeletaPorId(papeletaId: string): Promise<Papeleta> {
    try {
      const response = await axios.get<Papeleta>(
        `${this.baseURL}/${papeletaId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener papeleta:", error);
      throw error;
    }
  }

  static async cerrarPapeleta(papeletaId: string): Promise<void> {
    try {
      await axios.put(`${this.baseURL}/${papeletaId}/cerrar`, {
        fechaCierre: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error al cerrar papeleta:", error);
      throw error;
    }
  }

  static async obtenerEstadisticasPapeletas(eleccionId: number): Promise<{
    total: number;
    disponibles: number;
    habilitadas: number;
    votadas: number;
    cerradas: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/estadisticas/${eleccionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas de papeletas:", error);
      throw error;
    }
  }
}
