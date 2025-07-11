import { Routes, Route } from 'react-router-dom';
import RecintoForm from './recintosForm';


export default function RecintoRoutes() {
  return (
    <Routes>
      <Route path="" element={<RecintoForm />} />
    </Routes>
  );
} 