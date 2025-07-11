export interface Candidato {
  id: number;
  nombre: string;
  apellido: string;
  partido: string;
  foto?: string;
  propuestas?: string;
  eleccionId: number;
  orden: number; // Orden en la papeleta
}

export interface CandidatoCreateRequest {
  nombre: string;
  apellido: string;
  partido: string;
  foto?: File;
  propuestas?: string;
  eleccionId: number;
  orden: number;
}

export interface CandidatoUpdateRequest {
  id: number;
  nombre: string;
  apellido: string;
  partido: string;
  foto?: File;
  propuestas?: string;
  orden: number;
}
