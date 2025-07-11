import { Routes, Route } from "react-router-dom";
import CandidaturaForm from "./candidaturaForm";

export default function CandidaturaRoutes() {
  return (
    <Routes>
      <Route path="" element={<CandidaturaForm />} />
    </Routes>
  );
}
