import { Routes, Route } from "react-router-dom";
import CargoForm from "./cargosForm";

export default function CargosRoutes() {
  return (
    <Routes>
      <Route path="" element={<CargoForm />} />
    </Routes>
  );
}