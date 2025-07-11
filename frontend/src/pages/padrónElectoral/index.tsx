import { Routes, Route } from "react-router-dom";
import { PadronForm } from "./padronForm";

export default function PadronElectoralRoutes() {
  return (
    <Routes>
      <Route path="" element={<PadronForm />} />
    </Routes>
  );
}
