import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { socketService } from "../../services/SocketService";
import { PadronService } from "../../services/PadronService";
import { EleccionService } from "../../services/EleccionService";
import { CandidatoService } from "../../services/CandidatoService";
import { PapeletaService } from "../../services/PapeletaService";
import { VotantePublic } from "../../models/Votante";
import { Eleccion } from "../../models/Eleccion";
import { Candidato } from "../../models/Candidato";
import { PapeletaHabilitacion } from "../../models/Papeleta";
import {
  FiSearch,
  FiUser,
  FiCheckCircle,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

interface BusquedaVotanteForm {
  ci: string;
}

const InterfazJurado: React.FC = () => {
  const [conectado, setConectado] = useState(false);
  const [maquinaId] = useState(() => `jurado-${uuidv4()}`);
  const [votanteEncontrado, setVotanteEncontrado] =
    useState<VotantePublic | null>(null);
  const [eleccionActiva, setEleccionActiva] = useState<Eleccion | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [habilitando, setHabilitando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusquedaVotanteForm>();

  useEffect(() => {
    const init = async () => {
      await inicializarConexion();
      await cargarEleccionActiva();
    };
    init();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const inicializarConexion = async () => {
    try {
      await socketService.connect();
      socketService.registrarMaquinaJurado(maquinaId);
      setConectado(true);
      setMensaje("Conectado al sistema de votación");
    } catch (error) {
      console.error("Error al conectar:", error);
      setConectado(false);
      setMensaje("Error al conectar con el servidor");
    }
  };

  const cargarEleccionActiva = async () => {
    try {
      const elecciones = await EleccionService.obtenerElecciones();
      const ahora = new Date();
      const eleccionActiva = elecciones.find((e: Eleccion) => {
        // Para este ejemplo, usamos el campo fecha como referencia
        // En un caso real, tendrías fechaInicio y fechaFin
        const fechaEleccion = new Date(e.fecha);
        const fechaInicio = e.fechaInicio
          ? new Date(e.fechaInicio)
          : fechaEleccion;
        const fechaFin = e.fechaFin
          ? new Date(e.fechaFin)
          : new Date(fechaEleccion.getTime() + 24 * 60 * 60 * 1000); // +1 día
        return ahora >= fechaInicio && ahora <= fechaFin;
      });

      if (eleccionActiva) {
        setEleccionActiva(eleccionActiva);
        const candidatosEleccion =
          await CandidatoService.obtenerCandidatosPorEleccion(
            eleccionActiva.id!
          );
        setCandidatos(candidatosEleccion.sort((a, b) => a.orden - b.orden));
        setMensaje(`Elección activa: ${eleccionActiva.nombre}`);
      } else {
        setMensaje("No hay elecciones activas en este momento");
      }
    } catch (error) {
      console.error("Error al cargar elección activa:", error);
      setMensaje("Error al cargar información de la elección");
    }
  };

  const buscarVotante = async (data: BusquedaVotanteForm) => {
    setBuscando(true);
    setVotanteEncontrado(null);

    try {
      const votante = await PadronService.buscarVotantePorCI(parseInt(data.ci));
      setVotanteEncontrado(votante);
      setMensaje(`Votante encontrado: ${votante.nombre} ${votante.apellido}`);
    } catch (error) {
      console.error("Error al buscar votante:", error);
      setMensaje("Votante no encontrado en el padrón electoral");
    } finally {
      setBuscando(false);
    }
  };

  const habilitarPapeleta = async () => {
    if (!votanteEncontrado || !eleccionActiva || !conectado) {
      return;
    }

    setHabilitando(true);

    try {
      // Generar papeleta
      const papeleta = await PapeletaService.generarPapeleta(
        eleccionActiva.id!
      );

      // Preparar datos para habilitar
      const datosHabilitacion: PapeletaHabilitacion = {
        papeletaId: papeleta.id,
        votante: {
          ci: votanteEncontrado.ci,
          nombre: votanteEncontrado.nombre,
          apellido: votanteEncontrado.apellido,
          codigo: votanteEncontrado.codigo,
        },
        eleccion: {
          id: eleccionActiva.id!,
          nombre: eleccionActiva.nombre,
          fechaInicio: eleccionActiva.fechaInicio || eleccionActiva.fecha,
          fechaFin: eleccionActiva.fechaFin || eleccionActiva.fecha,
        },
        candidatos: candidatos.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          apellido: c.apellido,
          partido: c.partido,
          foto: c.foto,
          orden: c.orden,
        })),
        maquinaJuradoId: maquinaId,
      };

      // Habilitar en el backend
      await PapeletaService.habilitarPapeleta(
        papeleta.id,
        votanteEncontrado.codigo,
        maquinaId
      );

      // Enviar por socket a la máquina de votación
      socketService.habilitarPapeleta(datosHabilitacion);

      setMensaje(
        `Papeleta habilitada exitosamente. ID: ${papeleta.id.substring(
          0,
          8
        )}...`
      );

      // Limpiar formulario
      reset();
      setVotanteEncontrado(null);
    } catch (error) {
      console.error("Error al habilitar papeleta:", error);
      setMensaje("Error al habilitar papeleta");
    } finally {
      setHabilitando(false);
    }
  };

  const reconectar = () => {
    inicializarConexion();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Interfaz del Jurado Electoral
            </h1>
            <div className="flex items-center gap-2">
              {conectado ? (
                <div className="flex items-center text-green-600">
                  <FiWifi className="w-5 h-5 mr-1" />
                  <span className="text-sm">Conectado</span>
                </div>
              ) : (
                <button
                  onClick={reconectar}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <FiWifiOff className="w-5 h-5 mr-1" />
                  <span className="text-sm">Reconectar</span>
                </button>
              )}
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">{mensaje}</p>
            {eleccionActiva && (
              <div className="mt-2 text-sm text-blue-600">
                <p>Máquina ID: {maquinaId.substring(0, 8)}...</p>
                <p>Candidatos disponibles: {candidatos.length}</p>
              </div>
            )}
          </div>

          {/* Formulario de búsqueda */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Verificación de Votante
            </h2>
            <form onSubmit={handleSubmit(buscarVotante)} className="flex gap-3">
              <div className="flex-1">
                <input
                  {...register("ci", {
                    required: "La cédula es requerida",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Solo se permiten números",
                    },
                  })}
                  type="text"
                  placeholder="Número de cédula"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={buscando || !conectado}
                />
                {errors.ci && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ci.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={buscando || !conectado}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {buscando ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <FiSearch className="w-4 h-4" />
                    Buscar
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Información del votante */}
          {votanteEncontrado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                    <FiUser className="w-5 h-5" />
                    Votante Verificado
                  </h3>
                  <div className="mt-2 text-green-700">
                    <p>
                      <strong>Nombre:</strong> {votanteEncontrado.nombre}{" "}
                      {votanteEncontrado.apellido}
                    </p>
                    <p>
                      <strong>CI:</strong> {votanteEncontrado.ci}
                    </p>
                    <p>
                      <strong>Código:</strong> {votanteEncontrado.codigo}
                    </p>
                    <p>
                      <strong>Ubicación:</strong>{" "}
                      {votanteEncontrado.departamento},{" "}
                      {votanteEncontrado.ciudad}
                    </p>
                  </div>
                </div>
                <button
                  onClick={habilitarPapeleta}
                  disabled={habilitando || !conectado || !eleccionActiva}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  {habilitando ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Habilitando...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      Habilitar Papeleta
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Lista de candidatos */}
          {candidatos.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Candidatos en esta Elección
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {candidatos.map((candidato) => (
                  <div
                    key={candidato.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      {candidato.foto && (
                        <img
                          src={candidato.foto}
                          alt={`${candidato.nombre} ${candidato.apellido}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">
                          {candidato.nombre} {candidato.apellido}
                        </p>
                        <p className="text-sm text-gray-600">
                          {candidato.partido}
                        </p>
                        <p className="text-xs text-gray-500">
                          Orden: {candidato.orden}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterfazJurado;
