
export interface Punto {
  latitud: number;
  longitud: number;
}
export interface Seccion {
  id: number;
  nombre: string;
  tipo: string;
  puntos: Punto[];
}
export interface Eleccion {
  id: number;
  seccion: Seccion;
  nombre: string;
  fecha: string;
}

export interface Mesa {
    id: number;
    jefe_id: number;
    numero: number;
    cantidad: number;
    recinto: number; // ID del recinto
    eleccion: number; // ID de la elección
}