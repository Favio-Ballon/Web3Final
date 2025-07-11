import { Seccion } from "./Seccion";

export interface Recinto {
  id?: number;
  nombre: string;
  latitud: number;
  longitud: number;
  seccion: number | Seccion; // can be either ID or full object
}
