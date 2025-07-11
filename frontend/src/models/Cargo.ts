export interface Cargo{
    id: number;
    nombre: string;
    seccion: Seccion
}
export interface Seccion {
  id: number;
  nombre: string;
  tipo: string;
  puntos: Punto[];
}
export interface Punto {
  latitud: number;
  longitud: number;
}