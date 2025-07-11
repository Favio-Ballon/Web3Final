// src/pages/administracionElectoral/EleccionForm.tsx
import React, { useState, useEffect } from "react";
import { Eleccion } from "../../../models/Eleccion";
import { Seccion } from "../../../models/Seccion";
import { EleccionService } from "../../../services/EleccionService";
import { SeccionService } from "../../../services/SeccionService";
import { useAuth } from "../../../hooks/useAuth";
import { FiTrash2, FiEdit3, FiLogOut } from "react-icons/fi";

interface FormData {
  id?: number;
  nombre: string;
  fecha: string;
  seccion: number | null;
}
interface FormErrors {
  nombre?: string;
  fecha?: string;
  seccion?: string;
}

export const EleccionForm: React.FC = () => {
  const { doLogout, email } = useAuth();
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    fecha: "",
    seccion: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const secService = new SeccionService();
  const elecService = new EleccionService();

  // Carga inicial de secciones y elecciones
  useEffect(() => {
    (async () => {
      const secs = await secService.getSecciones();
      setSecciones(secs);
      const elecs = await elecService.getElecciones();
      setElecciones(elecs);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({ nombre: "", fecha: "", seccion: null });
    setErrors({});
    setEditingId(null);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.nombre.trim()) errs.nombre = "Nombre obligatorio";
    if (!formData.fecha) errs.fecha = "Fecha obligatoria";
    if (!formData.seccion) errs.seccion = "Selecciona una sección";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      id: editingId ?? 0,
      nombre: formData.nombre,
      fecha: formData.fecha,
      seccion: formData.seccion!,
    };
    try {
      if (editingId) {
        await elecService.editarEleccion(payload as unknown as Eleccion);
      } else {
        await elecService.crearEleccion(payload as unknown as Eleccion);
      }
      const updated = await elecService.getElecciones();
      setElecciones(updated);
      resetForm();
    } catch (e) {
      console.error("Error guardando elección", e);
    }
  };

  const handleEdit = (e: Eleccion) => {
    setFormData({
      id: e.id,
      nombre: e.nombre,
      fecha: e.fecha,
      seccion: e.seccion.id,
    });
    setEditingId(e.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta elección?")) return;
    try {
      await elecService.eliminarEleccion(id);
      setElecciones((prev) => prev.filter((el) => el.id !== id));
    } catch (e) {
      console.error("Error eliminando elección", e);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          {editingId ? "Editar" : "Crear"} Elección
        </h1>
        <div className="flex items-center gap-4">
          <span>{email}</span>
          <button onClick={doLogout} className="flex items-center gap-1">
            <FiLogOut /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-6 space-y-8">
        {/* Formulario */}
        <div className="bg-card p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Editar" : "Nueva"} Elección
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <input
                type="text"
                placeholder="Nombre de la elección"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, nombre: e.target.value }))
                }
                className="w-full border p-2 rounded"
              />
              {errors.nombre && (
                <p className="text-destructive text-sm">{errors.nombre}</p>
              )}
            </div>
            {/* Fecha */}
            <div>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData((fd) => ({ ...fd, fecha: e.target.value }))
                }
                className="w-full border p-2 rounded"
              />
              {errors.fecha && (
                <p className="text-destructive text-sm">{errors.fecha}</p>
              )}
            </div>
            {/* Sección */}
            <div className="md:col-span-2">
              <select
                value={formData.seccion ?? ""}
                onChange={(e) =>
                  setFormData((fd) => ({
                    ...fd,
                    seccion: e.target.value ? +e.target.value : null,
                  }))
                }
                className="w-full border p-2 rounded"
              >
                <option value="">-- Selecciona sección --</option>
                {secciones.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.tipo})
                  </option>
                ))}
              </select>
              {errors.seccion && (
                <p className="text-destructive text-sm">{errors.seccion}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-input rounded hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              {editingId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </div>

        {/* Tabla de Elecciones */}
        <div className="bg-card p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Elecciones existentes</h3>
          <table className="w-full table-auto">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Sección</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {elecciones.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="px-4 py-2">{e.nombre}</td>
                  <td className="px-4 py-2">{e.fecha}</td>
                  <td className="px-4 py-2">
                    {e.seccion.nombre} ({e.seccion.tipo})
                  </td>
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(e)}
                      className="p-2 hover:bg-muted rounded"
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-2 text-destructive hover:bg-muted rounded"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default EleccionForm;
