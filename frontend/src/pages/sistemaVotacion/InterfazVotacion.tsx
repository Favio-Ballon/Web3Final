import React, { useState, useEffect } from "react";
import { socketService } from "../../services/SocketService";
import { VotoService } from "../../services/VotoService";
import { PapeletaHabilitacion } from "../../models/Papeleta";
import { VotoRegistro } from "../../models/Voto";
import { FiUser, FiWifi, FiWifiOff, FiCheck, FiX } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

const InterfazVotacion: React.FC = () => {
  const [conectado, setConectado] = useState(false);
  const [maquinaId] = useState(() => `votacion-${uuidv4()}`);
  const [papeletaActiva, setPapeletaActiva] =
    useState<PapeletaHabilitacion | null>(null);
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState<
    number | null
  >(null);
  const [votando, setVotando] = useState(false);
  const [votoCompletado, setVotoCompletado] = useState(false);
  const [mensaje, setMensaje] = useState("Esperando conexión...");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      await inicializarConexion();
    };
    init();

    return () => {
      socketService.offAllListeners();
      socketService.disconnect();
    };
  }, []);

  const inicializarConexion = async () => {
    try {
      await socketService.connect();
      socketService.registrarMaquinaVotacion(maquinaId);
      setConectado(true);
      setMensaje(
        "Máquina de votación conectada. Esperando papeleta habilitada..."
      );

      // Configurar listeners
      socketService.onPapeletaHabilitada(manejarPapeletaHabilitada);
      socketService.onVotoRegistrado(manejarVotoRegistrado);
      socketService.onPapeletaCerrada(manejarPapeletaCerrada);
    } catch (error) {
      console.error("Error al conectar:", error);
      setConectado(false);
      setMensaje("Error al conectar con el servidor");
      setError("No se pudo establecer conexión con el sistema");
    }
  };

  const manejarPapeletaHabilitada = (datos: PapeletaHabilitacion) => {
    console.log("Papeleta habilitada recibida:", datos);
    setPapeletaActiva(datos);
    setCandidatoSeleccionado(null);
    setVotoCompletado(false);
    setError("");
    setMensaje(
      `Papeleta habilitada para: ${datos.votante.nombre} ${datos.votante.apellido}`
    );
  };

  const manejarVotoRegistrado = (datos: {
    papeletaId: string;
    exitoso: boolean;
  }) => {
    if (datos.exitoso) {
      setVotoCompletado(true);
      setMensaje("¡Voto registrado exitosamente!");

      // Cerrar papeleta después de 3 segundos
      setTimeout(() => {
        cerrarPapeleta();
      }, 3000);
    } else {
      setError("Error al registrar el voto. Intente nuevamente.");
      setVotando(false);
    }
  };

  const manejarPapeletaCerrada = (papeletaId: string) => {
    if (papeletaActiva?.papeletaId === papeletaId) {
      setPapeletaActiva(null);
      setCandidatoSeleccionado(null);
      setVotoCompletado(false);
      setMensaje("Papeleta cerrada. Esperando nueva habilitación...");
    }
  };

  const seleccionarCandidato = (candidatoId: number) => {
    if (!votoCompletado && !votando) {
      setCandidatoSeleccionado(candidatoId);
      setError("");
    }
  };

  const confirmarVoto = async () => {
    if (
      !papeletaActiva ||
      !candidatoSeleccionado ||
      votando ||
      votoCompletado
    ) {
      return;
    }

    setVotando(true);
    setError("");

    try {
      // Verificar si ya se votó con esta papeleta
      const yaVoto = await VotoService.verificarVotoDuplicado(
        papeletaActiva.papeletaId
      );
      if (yaVoto) {
        setError("Esta papeleta ya fue utilizada para votar");
        setVotando(false);
        return;
      }

      // Registrar voto
      const votoData: VotoRegistro = {
        candidatoId: candidatoSeleccionado,
        papeletaId: papeletaActiva.papeletaId,
      };

      await VotoService.registrarVoto(votoData, maquinaId);

      // Notificar por socket
      socketService.registrarVoto({
        papeletaId: papeletaActiva.papeletaId,
        candidatoId: candidatoSeleccionado,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error al confirmar voto:", error);
      setError("Error al registrar el voto. Intente nuevamente.");
      setVotando(false);
    }
  };

  const cerrarPapeleta = () => {
    setPapeletaActiva(null);
    setCandidatoSeleccionado(null);
    setVotoCompletado(false);
    setMensaje("Esperando nueva papeleta habilitada...");
  };

  const reconectar = () => {
    inicializarConexion();
  };

  if (!conectado) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <FiWifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Sin Conexión</h2>
          <p className="text-red-600 mb-4">{mensaje}</p>
          <button
            onClick={reconectar}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Intentar Reconectar
          </button>
        </div>
      </div>
    );
  }

  if (!papeletaActiva) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FiWifi className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            Sistema de Votación
          </h2>
          <p className="text-blue-600 mb-4">{mensaje}</p>
          <div className="text-sm text-blue-500">
            <p>Máquina ID: {maquinaId.substring(0, 8)}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (votoCompletado) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <FiCheck className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            ¡Voto Registrado!
          </h2>
          <p className="text-green-600 mb-4">
            Su voto ha sido registrado exitosamente.
          </p>
          <p className="text-sm text-green-500">Cerrando papeleta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Papeleta Electoral
              </h1>
              <p className="text-gray-600">{papeletaActiva.eleccion.nombre}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-green-600 mb-1">
                <FiWifi className="w-4 h-4 mr-1" />
                <span className="text-sm">Conectado</span>
              </div>
              <p className="text-xs text-gray-500">
                ID: {papeletaActiva.papeletaId.substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Información del votante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FiUser className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">
              Votante Habilitado
            </span>
          </div>
          <p className="text-blue-700">
            {papeletaActiva.votante.nombre} {papeletaActiva.votante.apellido} -
            CI: {papeletaActiva.votante.ci}
          </p>
        </div>

        {/* Candidatos */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6 text-center">
            Seleccione su Candidato
          </h2>

          <div className="grid gap-4">
            {papeletaActiva.candidatos
              .sort((a, b) => a.orden - b.orden)
              .map((candidato) => (
                <button
                  key={candidato.id}
                  onClick={() => seleccionarCandidato(candidato.id)}
                  disabled={votando || votoCompletado}
                  className={`
                    p-6 border-2 rounded-lg transition-all duration-200 text-left
                    ${
                      candidatoSeleccionado === candidato.id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }
                    ${
                      votando || votoCompletado
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {candidato.foto && (
                      <img
                        src={candidato.foto}
                        alt={`${candidato.nombre} ${candidato.apellido}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {candidato.nombre} {candidato.apellido}
                      </h3>
                      <p className="text-gray-600">{candidato.partido}</p>
                      <p className="text-sm text-gray-500">
                        Opción {candidato.orden}
                      </p>
                    </div>
                    {candidatoSeleccionado === candidato.id && (
                      <FiCheck className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <FiX className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={cerrarPapeleta}
              disabled={votando}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
            >
              Cancelar Votación
            </button>

            <button
              onClick={confirmarVoto}
              disabled={!candidatoSeleccionado || votando || votoCompletado}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
            >
              {votando ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Registrando Voto...
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Confirmar Voto
                </>
              )}
            </button>
          </div>

          {candidatoSeleccionado && !votando && (
            <p className="text-center text-sm text-gray-600 mt-3">
              Has seleccionado al candidato de la opción{" "}
              {
                papeletaActiva.candidatos.find(
                  (c) => c.id === candidatoSeleccionado
                )?.orden
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterfazVotacion;
