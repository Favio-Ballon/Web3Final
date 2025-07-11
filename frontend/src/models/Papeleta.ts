export interface Papeleta {
  id: string; // UUID único para cada papeleta
  eleccionId: number;
  votanteId?: number; // Se asigna cuando se habilita
  estado: "disponible" | "habilitada" | "votada" | "cerrada";
  fechaHabilitacion?: string;
  fechaVoto?: string;
  maquinaJuradoId?: string;
  maquinaVotacionId?: string;
  candidatos: number[]; // IDs de candidatos disponibles
}

export interface PapeletaHabilitacion {
  papeletaId: string;
  votante: {
    ci: number;
    nombre: string;
    apellido: string;
    codigo: number;
  };
  eleccion: {
    id: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
  };
  candidatos: Array<{
    id: number;
    nombre: string;
    apellido: string;
    partido: string;
    foto?: string;
    orden: number;
  }>;
  maquinaJuradoId: string;
}

export interface PapeletaVoto {
  papeletaId: string;
  candidatoId: number;
  timestamp: string;
}
