import { Routes, Route } from "react-router-dom";
import CandidaturaForm from "./candidaturaForm";


export default function PadronElectoralRoutes() {
  return (
    <Routes>
      <Route path="" element={<CandidaturaForm />} />
    </Routes>
  );
}
