import { Routes, Route } from "react-router-dom";
import InterfazJurado from "./InterfazJurado";
import InterfazVotacion from "./InterfazVotacion";

export default function VotacionRoutes() {
  return (
    <Routes>
      <Route
        path=""
        element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                  Sistema de Votación
                </h1>
                <p className="text-gray-600 mb-8">
                  Seleccione el tipo de interfaz según el rol de la máquina:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-3">
                      Máquina del Jurado
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Para verificar votantes y habilitar papeletas de votación.
                    </p>
                    <a
                      href="/voting/jurado"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Acceder como Jurado
                    </a>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-3">
                      Máquina de Votación
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Para que los votantes registren sus votos de forma
                      anónima.
                    </p>
                    <a
                      href="/voting/votar"
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Acceder para Votar
                    </a>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Instrucciones:
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>
                      • La máquina del jurado debe estar conectada para
                      verificar votantes
                    </li>
                    <li>
                      • La máquina de votación debe estar en una computadora
                      separada
                    </li>
                    <li>
                      • Ambas máquinas se conectan automáticamente al servidor
                      en 192.168.0.9:3001
                    </li>
                    <li>
                      • Una vez habilitada una papeleta, aparecerá
                      automáticamente en la máquina de votación
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        }
      />
      <Route path="jurado" element={<InterfazJurado />} />
      <Route path="votar" element={<InterfazVotacion />} />
    </Routes>
  );
}
