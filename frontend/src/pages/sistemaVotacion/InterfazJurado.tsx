import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { socketService } from "../../services/SocketService";
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
  FiToggleLeft,
  FiToggleRight,
} from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

// DATOS DE PRUEBA
const DATOS_PRUEBA = {
  votantes: [
    {
      codigo: 1001,
      ci: 12345678,
      nombre: "Juan Carlos",
      apellido: "Pérez García",
      fechaNacimiento: "1985-03-15",
      departamento: "La Paz",
      ciudad: "La Paz",
      provincia: "Murillo",
    },
    {
      codigo: 1002,
      ci: 11111111,
      nombre: "María Elena",
      apellido: "Rodríguez López",
      fechaNacimiento: "1990-07-22",
      departamento: "Santa Cruz",
      ciudad: "Santa Cruz",
      provincia: "Andrés Ibáñez",
    },
    {
      codigo: 1003,
      ci: 22222222,
      nombre: "Pedro Antonio",
      apellido: "Mamani Quispe",
      fechaNacimiento: "1978-11-08",
      departamento: "Cochabamba",
      ciudad: "Cochabamba",
      provincia: "Cercado",
    },
    {
      codigo: 1004,
      ci: 33333333,
      nombre: "Ana Sofía",
      apellido: "Vargas Cruz",
      fechaNacimiento: "1995-01-30",
      departamento: "La Paz",
      ciudad: "El Alto",
      provincia: "Murillo",
    },
    {
      codigo: 1005,
      ci: 44444444,
      nombre: "Carlos Roberto",
      apellido: "Mendoza Silva",
      fechaNacimiento: "1988-09-12",
      departamento: "Tarija",
      ciudad: "Tarija",
      provincia: "Cercado",
    },
  ],
  eleccion: {
    id: 1,
    nombre: "Elección Presidencial 2025",
    fecha: "2025-07-11",
    fechaInicio: "2025-07-11T08:00:00",
    fechaFin: "2025-07-11T18:00:00",
    seccion: 1,
    activa: true,
  },
  candidatos: [
    {
      id: 1,
      nombre: "Carlos Alberto",
      apellido: "Mesa Gisbert",
      partido: "Partido Democrático",
      foto: "https://via.placeholder.com/100x100?text=CM",
      propuestas: "Modernización del estado y desarrollo económico",
      eleccionId: 1,
      orden: 1,
    },
    {
      id: 2,
      nombre: "Eva María",
      apellido: "Copa Murga",
      partido: "Movimiento Social",
      foto: "https://via.placeholder.com/100x100?text=EC",
      propuestas: "Inclusión social y derechos humanos",
      eleccionId: 1,
      orden: 2,
    },
    {
      id: 3,
      nombre: "Luis Fernando",
      apellido: "Camacho Vaca",
      partido: "Alianza Nacional",
      foto: "https://via.placeholder.com/100x100?text=LC",
      propuestas: "Autonomías y desarrollo regional",
      eleccionId: 1,
      orden: 3,
    },
    {
      id: 4,
      nombre: "Jeanine Áñez",
      apellido: "Chávez",
      partido: "Frente Patriótico",
      foto: "https://via.placeholder.com/100x100?text=JA",
      propuestas: "Orden institucional y justicia",
      eleccionId: 1,
      orden: 4,
    },
  ],
};

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
  const [usarDatosPrueba, setUsarDatosPrueba] = useState(true); // Toggle para datos de prueba

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (usarDatosPrueba) {
        // Usar datos de prueba
        setEleccionActiva(DATOS_PRUEBA.eleccion);
        setCandidatos(
          DATOS_PRUEBA.candidatos.sort((a, b) => a.orden - b.orden)
        );
        setMensaje(
          `Elección activa: ${DATOS_PRUEBA.eleccion.nombre} (DATOS DE PRUEBA)`
        );
      } else {
        // Código original para backend real
        // const elecciones = await EleccionService.obtenerElecciones();
        // ... resto del código original
        setMensaje("Modo backend real - implementar conexión");
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
      if (usarDatosPrueba) {
        // Buscar en datos de prueba
        const votante = DATOS_PRUEBA.votantes.find(
          (v) => v.ci === parseInt(data.ci)
        );
        if (votante) {
          setVotanteEncontrado(votante);
          setMensaje(
            `Votante encontrado: ${votante.nombre} ${votante.apellido} (DATOS DE PRUEBA)`
          );
        } else {
          throw new Error("Votante no encontrado");
        }
      } else {
        // Código original para backend real
        // const votante = await PadronService.buscarVotantePorCI(parseInt(data.ci));
        // setVotanteEncontrado(votante);
        setMensaje("Modo backend real - implementar búsqueda");
      }
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
      // Generar ID único para la papeleta de prueba
      const papeletaId = uuidv4();

      // Preparar datos para habilitar
      const datosHabilitacion: PapeletaHabilitacion = {
        papeletaId: papeletaId,
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

      if (usarDatosPrueba) {
        // En modo de prueba, solo enviar por socket
        console.log("🗳️ Enviando papeleta de prueba:", datosHabilitacion);

        // Simular delay de procesamiento
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        // En modo real, usar servicios del backend
        // const papeleta = await PapeletaService.generarPapeleta(eleccionActiva.id!);
        // await PapeletaService.habilitarPapeleta(papeleta.id, votanteEncontrado.codigo, maquinaId);
      }

      // Enviar por socket a la máquina de votación
      socketService.habilitarPapeleta(datosHabilitacion);

      setMensaje(
        `Papeleta habilitada exitosamente. ID: ${papeletaId.substring(
          0,
          8
        )}... ${usarDatosPrueba ? "(DATOS DE PRUEBA)" : ""}`
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
            <div className="flex items-center gap-4">
              {/* Toggle para datos de prueba */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Backend Real</span>
                <button
                  onClick={() => setUsarDatosPrueba(!usarDatosPrueba)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    usarDatosPrueba ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      usarDatosPrueba ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-600">Datos de Prueba</span>
              </div>

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

          {/* Datos de prueba disponibles */}
          {usarDatosPrueba && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">
                CIs de Prueba Disponibles:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-yellow-700">
                {DATOS_PRUEBA.votantes.map((votante) => (
                  <div
                    key={votante.ci}
                    className="bg-yellow-100 px-2 py-1 rounded"
                  >
                    <span className="font-mono">{votante.ci}</span> -{" "}
                    {votante.nombre}
                  </div>
                ))}
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                💡 Usa cualquiera de estos CIs para probar la búsqueda de
                votantes
              </p>
            </div>
          )}

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

            {/* Botones de prueba rápida */}
            {usarDatosPrueba && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  🚀 Prueba rápida - Cargar votante:
                </p>
                <div className="flex flex-wrap gap-2">
                  {DATOS_PRUEBA.votantes.slice(0, 3).map((votante) => (
                    <button
                      key={votante.ci}
                      type="button"
                      onClick={() => {
                        // Simular escritura en el input y búsqueda
                        const ciString = votante.ci.toString();
                        setValue("ci", ciString);
                        buscarVotante({ ci: ciString });
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      disabled={buscando}
                    >
                      {votante.ci} ({votante.nombre})
                    </button>
                  ))}
                </div>
              </div>
            )}
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
