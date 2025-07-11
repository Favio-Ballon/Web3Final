// src/pages/administracionElectoral/CargoForm.tsx
import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit3 } from "react-icons/fi";
import { Seccion } from "../../../models/Seccion";
import { Cargo } from "../../../models/Cargo";
import { SeccionService } from "../../../services/SeccionService";
import { CargoService } from "../../../services/CargoService";
import AppHeader from "../../../components/AppHeader";

interface FormData {
  id?: number;
  nombre: string;
  seccion: number | "";
}
interface FormErrors {
  nombre?: string;
  seccion?: string;
}

export const CargoForm: React.FC = () => {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [formData, setFormData] = useState<FormData>({ nombre: "", seccion: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const secService = new SeccionService();
  const cargoService = new CargoService();

  // Carga inicial
  useEffect(() => {
    (async () => {
      const secs = await secService.getSecciones();
      setSecciones(secs);
      const cars = await cargoService.getCargos();
      setCargos(cars);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({ nombre: "", seccion: "" });
    setErrors({});
    setEditingId(null);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.nombre.trim()) errs.nombre = "Nombre obligatorio";
    if (formData.seccion === "") errs.seccion = "Selecciona una sección";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      id: editingId ?? 0,
      nombre: formData.nombre,
      seccion: formData.seccion,
    };
    try {
      if (editingId) {
        await cargoService.editarCargo(payload as unknown as Cargo);
      } else {
        await cargoService.crearCargo(payload as unknown as Cargo);
      }
      const updated = await cargoService.getCargos();
      setCargos(updated);
      resetForm();
    } catch (e) {
      console.error("Error guardando cargo", e);
    }
  };

  const handleEdit = (c: Cargo) => {
    setFormData({
      id: c.id,
      nombre: c.nombre,
      seccion: c.seccion.id,
    });
    setEditingId(c.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este cargo?")) return;
    try {
      await cargoService.eliminarCargo(id);
      setCargos((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error("Error eliminando cargo", e);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <AppHeader/>

      <main className="max-w-4xl mx-auto mt-6 space-y-8">
        {/* Formulario de Cargo */}
        <div className="bg-card p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Editar" : "Nuevo"} Cargo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <input
                type="text"
                placeholder="Nombre del cargo"
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
            {/* Sección */}
            <div>
              <select
                value={formData.seccion}
                onChange={(e) =>
                  setFormData((fd) => ({
                    ...fd,
                    seccion: e.target.value ? +e.target.value : "",
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

        {/* Tabla de Cargos */}
        <div className="bg-card p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Cargos existentes</h3>
          <table className="w-full table-auto">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Sección</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargos.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-2">{c.nombre}</td>
                  <td className="px-4 py-2">
                    {c.seccion.nombre} ({c.seccion.tipo})
                  </td>
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-2 hover:bg-muted rounded"
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
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

export default CargoForm;
