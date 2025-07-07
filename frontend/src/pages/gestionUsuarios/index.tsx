import { Routes, Route } from "react-router-dom";
import { UsuariosForm } from "./usuariosForm";

export default function UsersRoutes() {
  return (
    <Routes>
      <Route path="" element={<UsuariosForm />} />
    </Routes>
  );
}
