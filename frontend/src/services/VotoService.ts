import axios from "axios";
import { Voto, VotoRegistro, ResultadoEleccion } from "../models/Voto";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class VotoService {
  private static baseURL = `${API_BASE_URL}/api/votos`;

  static async registrarVoto(
    votoData: VotoRegistro,
    maquinaVotacionId: string
  ): Promise<Voto> {
    try {
      const voto: Omit<Voto, "id"> = {
        eleccionId: 0, // Se obtendrá del backend basado en la papeleta
        candidatoId: votoData.candidatoId,
        timestamp: new Date().toISOString(),
        maquinaVotacionId,
      };

      const response = await axios.post<Voto>(this.baseURL, {
        ...voto,
        papeletaId: votoData.papeletaId,
      });
      return response.data;
    } catch (error) {
      console.error("Error al registrar voto:", error);
      throw error;
    }
  }

  static async verificarVotoDuplicado(papeletaId: string): Promise<boolean> {
    try {
      const response = await axios.get<{ existe: boolean }>(
        `${this.baseURL}/verificar/${papeletaId}`
      );
      return response.data.existe;
    } catch (error) {
      console.error("Error al verificar voto duplicado:", error);
      throw error;
    }
  }

  static async obtenerResultados(
    eleccionId: number
  ): Promise<ResultadoEleccion> {
    try {
      const response = await axios.get<ResultadoEleccion>(
        `${this.baseURL}/resultados/${eleccionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener resultados:", error);
      throw error;
    }
  }

  static async obtenerEstadisticasVotacion(eleccionId: number): Promise<{
    totalVotos: number;
    votosUltimaHora: number;
    participacionPorcentaje: number;
    totalVotantesRegistrados: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/estadisticas/${eleccionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas de votación:", error);
      throw error;
    }
  }

  static async exportarResultados(
    eleccionId: number,
    formato: "pdf" | "excel"
  ): Promise<Blob> {
    try {
      const response = await axios.get(
        `${this.baseURL}/exportar/${eleccionId}/${formato}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al exportar resultados:", error);
      throw error;
    }
  }
}
