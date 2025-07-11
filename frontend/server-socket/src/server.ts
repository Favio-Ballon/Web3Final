import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

// Configurar CORS para permitir conexiones desde cualquier origen
app.use(cors());

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Almacenar las conexiones de las máquinas
const maquinasJurado = new Map<string, string>(); // socketId -> maquinaId
const maquinasVotacion = new Map<string, string>(); // socketId -> maquinaId
const papeletasActivas = new Map<string, any>(); // papeletaId -> datos

io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // Registro de máquina del jurado
  socket.on("registrar_maquina_jurado", (data) => {
    const { maquinaId } = data;
    maquinasJurado.set(socket.id, maquinaId);
    console.log(
      `Máquina del jurado registrada: ${maquinaId} (Socket: ${socket.id})`
    );

    socket.emit("registro_exitoso", {
      tipo: "jurado",
      maquinaId,
      mensaje: "Máquina del jurado registrada exitosamente",
    });
  });

  // Registro de máquina de votación
  socket.on("registrar_maquina_votacion", (data) => {
    const { maquinaId } = data;
    maquinasVotacion.set(socket.id, maquinaId);
    console.log(
      `Máquina de votación registrada: ${maquinaId} (Socket: ${socket.id})`
    );

    socket.emit("registro_exitoso", {
      tipo: "votacion",
      maquinaId,
      mensaje: "Máquina de votación registrada exitosamente",
    });
  });

  // Habilitar papeleta (desde máquina del jurado)
  socket.on("habilitar_papeleta", (datos) => {
    console.log(`Habilitando papeleta: ${datos.papeletaId}`);

    // Almacenar papeleta activa
    papeletasActivas.set(datos.papeletaId, {
      ...datos,
      fechaHabilitacion: new Date().toISOString(),
      socketJurado: socket.id,
    });

    // Enviar a todas las máquinas de votación
    maquinasVotacion.forEach((maquinaId, socketId) => {
      io.to(socketId).emit("papeleta_habilitada", datos);
    });

    console.log(
      `Papeleta ${datos.papeletaId} enviada a ${maquinasVotacion.size} máquinas de votación`
    );

    // Confirmar al jurado
    socket.emit("papeleta_enviada", {
      papeletaId: datos.papeletaId,
      maquinasReceptoras: maquinasVotacion.size,
    });
  });

  // Registrar voto (desde máquina de votación)
  socket.on("registrar_voto", (datos) => {
    const { papeletaId, candidatoId, timestamp } = datos;

    console.log(
      `Voto registrado - Papeleta: ${papeletaId}, Candidato: ${candidatoId}`
    );

    // Verificar que la papeleta existe
    const papeleta = papeletasActivas.get(papeletaId);
    if (!papeleta) {
      socket.emit("voto_registrado", {
        papeletaId,
        exitoso: false,
        error: "Papeleta no encontrada o ya cerrada",
      });
      return;
    }

    // Marcar papeleta como votada
    papeletasActivas.set(papeletaId, {
      ...papeleta,
      votada: true,
      fechaVoto: timestamp,
      candidatoSeleccionado: candidatoId,
      socketVotacion: socket.id,
    });

    // Confirmar voto exitoso
    socket.emit("voto_registrado", {
      papeletaId,
      exitoso: true,
      timestamp,
    });

    // Notificar al jurado que la papeleta fue utilizada
    if (papeleta.socketJurado) {
      io.to(papeleta.socketJurado).emit("papeleta_utilizada", {
        papeletaId,
        candidatoId,
        timestamp,
        votante: papeleta.votante.nombre + " " + papeleta.votante.apellido,
      });
    }

    // Cerrar papeleta automáticamente después de votar
    setTimeout(() => {
      cerrarPapeleta(papeletaId);
    }, 2000);
  });

  // Función para cerrar papeleta
  const cerrarPapeleta = (papeletaId: string) => {
    const papeleta = papeletasActivas.get(papeletaId);
    if (!papeleta) return;

    // Notificar cierre a todas las máquinas
    io.emit("papeleta_cerrada", papeletaId);

    // Remover de papeletas activas
    papeletasActivas.delete(papeletaId);

    console.log(`Papeleta ${papeletaId} cerrada y removida`);
  };

  // Cerrar papeleta manualmente
  socket.on("cerrar_papeleta", (data) => {
    const { papeletaId } = data;
    cerrarPapeleta(papeletaId);
  });

  // Obtener estadísticas del sistema
  socket.on("obtener_estadisticas", () => {
    socket.emit("estadisticas_sistema", {
      maquinasJurado: maquinasJurado.size,
      maquinasVotacion: maquinasVotacion.size,
      papeletasActivas: papeletasActivas.size,
      timestamp: new Date().toISOString(),
    });
  });

  // Desconexión
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);

    // Remover de registros
    if (maquinasJurado.has(socket.id)) {
      const maquinaId = maquinasJurado.get(socket.id);
      console.log(`Máquina del jurado desconectada: ${maquinaId}`);
      maquinasJurado.delete(socket.id);
    }

    if (maquinasVotacion.has(socket.id)) {
      const maquinaId = maquinasVotacion.get(socket.id);
      console.log(`Máquina de votación desconectada: ${maquinaId}`);
      maquinasVotacion.delete(socket.id);
    }
  });
});

// Endpoint de salud
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    connections: {
      total: io.engine.clientsCount,
      jurado: maquinasJurado.size,
      votacion: maquinasVotacion.size,
    },
    papeletasActivas: papeletasActivas.size,
  });
});

const PORT = Number(process.env.PORT) || 3001;
const HOST = "0.0.0.0"; // Escuchar en todas las interfaces

httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor Socket.IO ejecutándose en http://${HOST}:${PORT}`);
  console.log(`📊 Endpoint de salud: http://${HOST}:${PORT}/health`);
  console.log(`🗳️  Sistema de votación listo para recibir conexiones`);
});
