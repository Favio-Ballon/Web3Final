export const URLS = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ADMIN: {
    GENEROS: "/admin/generos",
    LIBROS: "/admin/libros",
    VENTAS: "/admin/ventas",
    USUARIOS: "/admin/usuarios",
  },
  CARRITO: "/carrito",
  COMPRA: {
    LIST: "/compras",
    DETALLECOMPRA: "/compras/:id/detalle",
    COMPRAUSER: "/compras/user/",
  },
  GENEROS: {
    GENEROLIBROS: "/generos/:id/libros",
  },
  LIBROS: {
    LIST: "/libros",
    CREATE: "/libros/create",
    EDIT: "/libros/:id",
    UPDATE: (id: string) => {
      return `/libros/${id}`;
    },
    LIBRODETALLE: "/libros/:id/detalle",
  },
};
