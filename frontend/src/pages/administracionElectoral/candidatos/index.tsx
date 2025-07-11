import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CandidatoService } from "../../../services/CandidatoService";
import { EleccionService } from "../../../services/EleccionService";
import { Candidato, CandidatoCreateRequest } from "../../../models/Candidato";
import { Eleccion } from "../../../models/Eleccion";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";

const GestionCandidatos: React.FC = () => {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [creando, setCreando] = useState(false);
  const [cargando, setCargando] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CandidatoCreateRequest>();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [candidatosData, eleccionesData] = await Promise.all([
        CandidatoService.obtenerCandidatos(),
        EleccionService.obtenerElecciones(),
      ]);
      setCandidatos(candidatosData);
      setElecciones(eleccionesData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setCargando(false);
    }
  };

  const crearCandidato = async (data: CandidatoCreateRequest) => {
    try {
      await CandidatoService.crearCandidato(data);
      await cargarDatos();
      setCreando(false);
      reset();
    } catch (error) {
      console.error("Error al crear candidato:", error);
    }
  };

  const eliminarCandidato = async (id: number) => {
    if (window.confirm("¿Está seguro de eliminar este candidato?")) {
      try {
        await CandidatoService.eliminarCandidato(id);
        await cargarDatos();
      } catch (error) {
        console.error("Error al eliminar candidato:", error);
      }
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Candidatos</h1>
        <button
          onClick={() => setCreando(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="w-4 h-4" />
          Nuevo Candidato
        </button>
      </div>

      {/* Formulario de creación */}
      {creando && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Crear Nuevo Candidato</h2>
          <form
            onSubmit={handleSubmit(crearCandidato)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                {...register("nombre", { required: "El nombre es requerido" })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm">{errors.nombre.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Apellido</label>
              <input
                {...register("apellido", {
                  required: "El apellido es requerido",
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.apellido && (
                <p className="text-red-500 text-sm">
                  {errors.apellido.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Partido</label>
              <input
                {...register("partido", {
                  required: "El partido es requerido",
                })}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.partido && (
                <p className="text-red-500 text-sm">{errors.partido.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Elección</label>
              <select
                {...register("eleccionId", {
                  required: "La elección es requerida",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar elección</option>
                {elecciones.map((eleccion) => (
                  <option key={eleccion.id} value={eleccion.id}>
                    {eleccion.nombre}
                  </option>
                ))}
              </select>
              {errors.eleccionId && (
                <p className="text-red-500 text-sm">
                  {errors.eleccionId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Orden en papeleta
              </label>
              <input
                {...register("orden", {
                  required: "El orden es requerido",
                  min: { value: 1, message: "El orden debe ser mayor a 0" },
                })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.orden && (
                <p className="text-red-500 text-sm">{errors.orden.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Foto (opcional)
              </label>
              <input
                {...register("foto")}
                type="file"
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Propuestas (opcional)
              </label>
              <textarea
                {...register("propuestas")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Propuestas del candidato..."
              />
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setCreando(false);
                  reset();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                <FiX className="w-4 h-4" />
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiSave className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de candidatos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidato
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Partido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Elección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {candidatos.map((candidato) => (
              <tr key={candidato.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {candidato.foto && (
                      <img
                        src={candidato.foto}
                        alt={`${candidato.nombre} ${candidato.apellido}`}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {candidato.nombre} {candidato.apellido}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {candidato.partido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {elecciones.find((e) => e.id === candidato.eleccionId)
                    ?.nombre || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {candidato.orden}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        console.log("Editar candidato:", candidato.id)
                      }
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => eliminarCandidato(candidato.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {candidatos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay candidatos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionCandidatos;
