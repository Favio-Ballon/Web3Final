export interface Votante {
  codigo: number;
  ci: number;
  nombre: string;
  apellido: string;
  direccion: string;
  foto?: File;
  ciReverso?: File;
  ciAnverso?: File;
  fechaNacimiento: string; // Using string for date, can be converted to Date when needed
  latitud: number;
  longitud: number;
  departamento: string;
  ciudad: string;
  provincia: string;
}

// Interface para la consulta pública del padrón (sin datos sensibles)
export interface VotantePublic {
  recinto: string;
  recintoNombre: string;
  codigo: number;
  ci: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  departamento: string;
  ciudad: string;
  provincia: string;
}

export interface VotanteCreateRequest {
  ci: number;
  nombre: string;
  apellido: string;
  direccion: string;
  foto: File;
  ciReverso: File;
  ciAnverso: File;
  fechaNacimiento: string;
  latitud: number;
  longitud: number;
  departamento: string;
  ciudad: string;
  provincia: string;
  recinto: string; // ID del recinto asociado
}

export interface VotanteUpdateRequest {
  ci: number;
  nombre: string;
  apellido: string;
  direccion: string;
  foto?: File;
  ciReverso?: File;
  ciAnverso?: File;
  fechaNacimiento: string;
  latitud: number;
  longitud: number;
  departamento: string;
  ciudad: string;
  provincia: string;
  recinto: string; // ID del recinto asociado
}
