export interface Voto {
  id: string; // UUID único
  eleccionId: number;
  candidatoId: number;
  timestamp: string;
  maquinaVotacionId: string;
  // Datos anónimos - sin referencia al votante
}

export interface VotoRegistro {
  candidatoId: number;
  papeletaId: string;
}

export interface ResultadoEleccion {
  eleccionId: number;
  totalVotos: number;
  resultados: Array<{
    candidatoId: number;
    nombreCandidato: string;
    apellidoCandidato: string;
    partido: string;
    cantidadVotos: number;
    porcentaje: number;
  }>;
  fechaGeneracion: string;
}
