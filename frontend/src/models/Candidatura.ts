export interface Candidatura {
  id: number;
  sigla: string;
  candidato: string;
  eleccion: Eleccion;
  cargo: Cargo;
  color: string;
  partido_politico: string;
}
export interface Cargo {
  id: number;
  nombre: string;
}
export interface Eleccion {
  id: number;
  nombre: string;
  fecha: string;
}