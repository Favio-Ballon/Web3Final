import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mesa } from "../../../models/Mesa";
import { User } from "../../../models/User";
import { Recinto } from "../../../models/Recinto";
import { RecintoService } from "../../../services/RecintoService";
import { UserService } from "../../../services/UserService";
import { useAuth } from "../../../hooks/useAuth";
import { FiLogOut, FiArrowLeft, FiUser } from "react-icons/fi";

export const MesasList = () => {
  const { recintoId } = useParams<{ recintoId: string }>();
  const navigate = useNavigate();
  const { doLogout, email } = useAuth();

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [recinto, setRecinto] = useState<Recinto | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!recintoId) return;

      try {
        setLoading(true);
        const recintoService = new RecintoService();
        const userService = new UserService();

        // Load mesas, users, and recinto info
        const [mesasData, usersData] = await Promise.all([
          recintoService.getMesaByRecintoId(Number(recintoId)),
          userService.getJurados(),
        ]);

        setMesas(mesasData || []);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [recintoId]);

  const handleAssignJefe = async (mesaId: number, jefeId: number | null) => {
    try {
      const recintoService = new RecintoService();
      await recintoService.updateMesaJefe(mesaId, jefeId);

      // Update local state after successful API call
      setMesas((prev) =>
        prev.map((mesa) =>
          mesa.id === mesaId ? { ...mesa, jefe_id: jefeId } : mesa
        )
      );
    } catch (error) {
      console.error("Error assigning jefe:", error);
      // You could add a toast notification here
    }
  };

  const getUserName = (userId: number | null) => {
    if (!userId) return "Sin asignar";
    const user = users.find((u) => u.id === userId);
    return user
      ? `${user.first_name} ${user.last_name}`
      : "Usuario no encontrado";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando mesas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/administracion-electoral/recintos")}
            className="flex items-center gap-1 hover:bg-primary/90 p-2 rounded"
          >
            <FiArrowLeft /> Volver
          </button>
          <h1 className="text-xl font-bold">
            Gestión de Mesas - {recinto?.nombre || "Recinto"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span>{email}</span>
          <button onClick={doLogout} className="flex items-center gap-1">
            <FiLogOut /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-6">
        <div className="bg-card p-6 rounded shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Mesas del Recinto ({mesas.length} mesas)
            </h2>
            {recinto && (
              <div className="text-sm text-muted-foreground">
                <p>
                  Ubicación: {recinto.latitud.toFixed(6)},{" "}
                  {recinto.longitud.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {mesas.length === 0 ? (
            <div className="text-center py-8">
              <FiUser className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay mesas configuradas para este recinto
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Mesa N°</th>
                    <th className="px-4 py-3 text-left">Jefe de Mesa</th>
                    <th className="px-4 py-3 text-left">Cantidad</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {mesas.map((mesa) => (
                    <tr key={mesa.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">
                        Mesa {mesa.numero}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            mesa.jefe_id ? "text-green-600" : "text-red-500"
                          }
                        >
                          {getUserName(mesa.jefe_id)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{mesa.cantidad}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            mesa.jefe_id
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {mesa.jefe_id ? "Asignado" : "Sin asignar"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={mesa.jefe_id || ""}
                          onChange={(e) =>
                            handleAssignJefe(
                              mesa.id,
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="">-- Sin asignar --</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.first_name} {user.last_name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {mesas.filter((m) => m.jefe_id).length} de {mesas.length} mesas
              tienen jefe asignado
            </div>
            <button
              onClick={() => navigate("/administracion-electoral/recintos")}
              className="px-4 py-2 border border-input rounded hover:bg-muted"
            >
              Volver a Recintos
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MesasList;
