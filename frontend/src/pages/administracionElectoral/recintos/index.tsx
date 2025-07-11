import { Routes, Route } from "react-router-dom";
import RecintoForm from "./recintosForm";
import MesasList from "../mesas/mesasList";

export default function RecintoRoutes() {
  return (
    <Routes>
      <Route path="" element={<RecintoForm />} />
      <Route path="mesas/:recintoId" element={<MesasList />} />
    </Routes>
  );
}
