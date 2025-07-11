export interface Seccion {
    id: number;
    nombre: string;
    tipo: string;
    puntos: {
        latitud: number;
        longitud: number;
    }[];
}