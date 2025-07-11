export interface Eleccion {
  id?: number;
  nombre: string;
  fecha: string;
  fechaInicio?: string;
  fechaFin?: string;
  seccion: number;
  activa?: boolean;
}
