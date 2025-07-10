import { Routes, Route } from 'react-router-dom';
import SeccionForm from './seccionesForm';


export default function SeccionRoutes() {
  return (
    <Routes>
      <Route path="" element={<SeccionForm />} />
    </Routes>
  );
} 