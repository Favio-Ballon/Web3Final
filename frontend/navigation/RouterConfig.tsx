import { Routes, Route } from "react-router";

import { URLS } from "./CONSTANTS";
import { LoginForm } from "../pages/LoginForm";
import { RegisterForm } from "../pages/registerForm";
import { GeneroLibro } from "../pages/GeneroLibro";
import { LibroDetalle } from "../pages/LibroDetalle";
import { CarritoList } from "../pages/Carrito";
import { DetalleCompra } from "../pages/CompraDetalle";
import { ComprasUser } from "../pages/ComprasUser";
import { GeneroList } from "../pages/crud/GeneroList";
import { Main } from "../pages/Main";
import { LibroList } from "../pages/crud/LibroList";
import { CompraList } from "../pages/crud/CompraList";
import { UsuarioList } from "../pages/crud/UsuarioList";

const RouterConfig = () => {
    return (
        <Routes>
            <Route path={URLS.HOME} element={< Main/>} />
            <Route path={URLS.LOGIN} element={< LoginForm />} />
            <Route path={URLS.REGISTER} element={< RegisterForm />} />
            <Route path={URLS.GENEROS.GENEROLIBROS} element={<GeneroLibro/>} />
            <Route path={URLS.LIBROS.LIBRODETALLE} element={<LibroDetalle/>} />
            <Route path={URLS.CARRITO} element={<CarritoList/> } />
            <Route path={URLS.COMPRA.DETALLECOMPRA} element={<DetalleCompra/>} />
            <Route path={URLS.COMPRA.COMPRAUSER} element={<ComprasUser/>} />
            <Route path={URLS.ADMIN.GENEROS} element={<GeneroList/>} />
            <Route path={URLS.ADMIN.LIBROS} element={<LibroList/>} />
            <Route path={URLS.ADMIN.VENTAS} element={<CompraList/>} />
            <Route path={URLS.ADMIN.USUARIOS} element={<UsuarioList/>} />
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
    );
}
export default RouterConfig;