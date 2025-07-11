import { io, Socket } from "socket.io-client";
import { PapeletaHabilitacion, PapeletaVoto } from "../models/Papeleta";

class SocketService {
  private socket: Socket | null = null;
  private serverUrl =
    import.meta.env.VITE_SOCKET_SERVER_URL || "http://192.168.0.9:3001"; // Tu IP

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ["websocket"],
        timeout: 5000,
      });

      this.socket.on("connect", () => {
        console.log("Conectado al servidor Socket.IO");
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("Error de conexión:", error);
        reject(error);
      });

      this.socket.on("disconnect", () => {
        console.log("Desconectado del servidor Socket.IO");
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Eventos para máquina del jurado
  registrarMaquinaJurado(maquinaId: string): void {
    if (this.socket) {
      this.socket.emit("registrar_maquina_jurado", { maquinaId });
    }
  }

  habilitarPapeleta(datos: PapeletaHabilitacion): void {
    if (this.socket) {
      this.socket.emit("habilitar_papeleta", datos);
      console.log("Papeleta habilitada:", datos.papeletaId);
    }
  }

  // Eventos para máquina de votación
  registrarMaquinaVotacion(maquinaId: string): void {
    if (this.socket) {
      this.socket.emit("registrar_maquina_votacion", { maquinaId });
    }
  }

  registrarVoto(voto: PapeletaVoto): void {
    if (this.socket) {
      this.socket.emit("registrar_voto", voto);
      console.log("Voto registrado para papeleta:", voto.papeletaId);
    }
  }

  // Listeners de eventos
  onPapeletaHabilitada(callback: (datos: PapeletaHabilitacion) => void): void {
    if (this.socket) {
      this.socket.on("papeleta_habilitada", callback);
    }
  }

  onVotoRegistrado(
    callback: (datos: { papeletaId: string; exitoso: boolean }) => void
  ): void {
    if (this.socket) {
      this.socket.on("voto_registrado", callback);
    }
  }

  onPapeletaCerrada(callback: (papeletaId: string) => void): void {
    if (this.socket) {
      this.socket.on("papeleta_cerrada", callback);
    }
  }

  offAllListeners(): void {
    if (this.socket) {
      this.socket.off("papeleta_habilitada");
      this.socket.off("voto_registrado");
      this.socket.off("papeleta_cerrada");
    }
  }

  // Método para verificar el estado de conexión
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Método para cambiar el servidor (útil para desarrollo)
  setServerUrl(url: string): void {
    this.serverUrl = url;
  }
}

export const socketService = new SocketService();
