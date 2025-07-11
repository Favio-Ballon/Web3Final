import { Routes, Route } from 'react-router-dom';
import EleccionForm from './eleccionesForm';

export default function EleccionesRoutes() {
  return (
    <Routes>
      <Route path="" element={<EleccionForm />} />
    </Routes>
  );
}