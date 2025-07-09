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
}
