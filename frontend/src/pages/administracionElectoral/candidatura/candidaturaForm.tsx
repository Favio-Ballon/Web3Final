// src/pages/administracionElectoral/CandidaturaForm.tsx
import React, { useState, useEffect } from "react";
import { FiTrash2, FiEdit3, } from "react-icons/fi";
import { Eleccion } from "../../../models/Eleccion";
import { Cargo } from "../../../models/Cargo";
import { Candidatura } from "../../../models/Candidatura";
import { EleccionService } from "../../../services/EleccionService";
import { CargoService } from "../../../services/CargoService";
import { CandidaturaService } from "../../../services/CandidaturaService";
import AppHeader from "../../../components/AppHeader";

interface FormData {
  id?: number;
  sigla: string;
  candidato: string;
  eleccion: number | "";
  cargo: number | "";
  color: string;
  partido_politico: string;
}
interface FormErrors {
  sigla?: string;
  candidato?: string;
  eleccion?: string;
  cargo?: string;
  color?: string;
  partido_politico?: string;
}

export const CandidaturaForm: React.FC = () => {

  const [elecciones, setElecciones] = useState<Eleccion[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);

  const [formData, setFormData] = useState<FormData>({
    sigla: "",
    candidato: "",
    eleccion: "",
    cargo: "",
    color: "",
    partido_politico: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const eleccionService = new EleccionService();
  const cargoService = new CargoService();
  const candidaturaService = new CandidaturaService();

  // Carga inicial de dropdowns y list
  useEffect(() => {
    (async () => {
      const [eList, cList, cdList] = await Promise.all([
        eleccionService.getElecciones(),
        cargoService.getCargos(),
        candidaturaService.getCandidaturas(),
      ]);
      setElecciones(eList);
      setCargos(cList);
      setCandidaturas(cdList);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({
      sigla: "",
      candidato: "",
      eleccion: "",
      cargo: "",
      color: "",
      partido_politico: "",
    });
    setErrors({});
    setEditingId(null);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.sigla.trim()) errs.sigla = "Sigla requerida";
    if (!formData.candidato.trim()) errs.candidato = "Nombre requerido";
    if (formData.eleccion === "") errs.eleccion = "Seleccione elección";
    if (formData.cargo === "") errs.cargo = "Seleccione cargo";
    if (!formData.color.trim()) errs.color = "Color requerido";
    if (!formData.partido_politico.trim()) errs.partido_politico = "Partido requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: Candidatura = {
      id: editingId ?? 0,
      sigla: formData.sigla,
      candidato: formData.candidato,
      eleccion: elecciones.find(e => e.id === formData.eleccion as number)!,
      cargo: cargos.find(c => c.id === formData.cargo as number)!,
      color: formData.color,
      partido_politico: formData.partido_politico,
    };
    try {
      if (editingId) {
        await candidaturaService.editarCandidatura(payload);
      } else {
        await candidaturaService.crearCandidatura(payload);
      }
      const updated = await candidaturaService.getCandidaturas();
      setCandidaturas(updated);
      resetForm();
    } catch (e) {
      console.error("Error guardando candidatura", e);
    }
  };

  const handleEdit = (cd: Candidatura) => {
    setFormData({
      id: cd.id,
      sigla: cd.sigla,
      candidato: cd.candidato,
      eleccion: cd.eleccion.id,
      cargo: cd.cargo.id,
      color: cd.color,
      partido_politico: cd.partido_politico,
    });
    setEditingId(cd.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar esta candidatura?")) return;
    try {
      await candidaturaService.eliminarCandidatura(id);
      setCandidaturas(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error("Error eliminando candidatura", e);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <AppHeader />

      <main className="max-w-4xl mx-auto mt-6 space-y-8">
        {/* Formulario */}
        <div className="bg-card p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Editar" : "Nueva"} Candidatura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sigla */}
            <div>
              <input
                type="text"
                placeholder="Sigla"
                value={formData.sigla}
                onChange={e =>
                  setFormData(fd => ({ ...fd, sigla: e.target.value }))
                }
                className="w-full border p-2 rounded"
              />
              {errors.sigla && (
                <p className="text-destructive text-sm">{errors.sigla}</p>
              )}
            </div>
            {/* Candidato */}
            <div>
              <input
                type="text"
                placeholder="Nombre candidato"
                value={formData.candidato}
                onChange={e =>
                  setFormData(fd => ({ ...fd, candidato: e.target.value }))
                }
                className="w-full border p-2 rounded"
              />
              {errors.candidato && (
                <p className="text-destructive text-sm">{errors.candidato}</p>
              )}
            </div>

            {/* Elección */}
            <div>
              <select
                value={formData.eleccion}
                onChange={e =>
                  setFormData(fd => ({
                    ...fd,
                    eleccion: e.target.value ? +e.target.value : "",
                  }))
                }
                className="w-full border p-2 rounded"
              >
                <option value="">-- Selecciona elección --</option>
                {elecciones.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nombre} ({e.fecha})
                  </option>
                ))}
              </select>
              {errors.eleccion && (
                <p className="text-destructive text-sm">{errors.eleccion}</p>
              )}
            </div>
            {/* Cargo */}
            <div>
              <select
                value={formData.cargo}
                onChange={e =>
                  setFormData(fd => ({
                    ...fd,
                    cargo: e.target.value ? +e.target.value : "",
                  }))
                }
                className="w-full border p-2 rounded"
              >
                <option value="">-- Selecciona cargo --</option>
                {cargos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {errors.cargo && (
                <p className="text-destructive text-sm">{errors.cargo}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <input
                type="color"
                value={formData.color}
                onChange={e =>
                  setFormData(fd => ({ ...fd, color: e.target.value }))
                }
                className="w-full h-10 border p-1 rounded"
              />
              {errors.color && (
                <p className="text-destructive text-sm">{errors.color}</p>
              )}
            </div>

            {/* Partido político */}
            <div>
              <input
                type="text"
                placeholder="Partido político"
                value={formData.partido_politico}
                onChange={e =>
                  setFormData(fd => ({
                    ...fd,
                    partido_politico: e.target.value,
                  }))
                }
                className="w-full border p-2 rounded"
              />
              {errors.partido_politico && (
                <p className="text-destructive text-sm">
                  {errors.partido_politico}
                </p>
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

        {/* Tabla de candidaturas */}
        <div className="bg-card p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Candidaturas existentes</h3>
          <table className="w-full table-auto">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Sigla</th>
                <th className="px-4 py-2 text-left">Candidato</th>
                <th className="px-4 py-2 text-left">Elección</th>
                <th className="px-4 py-2 text-left">Cargo</th>
                <th className="px-4 py-2 text-left">Partido</th>
                <th className="px-4 py-2 text-left">Color</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {candidaturas.map(cd => (
                <tr key={cd.id} className="border-t">
                  <td className="px-4 py-2">{cd.sigla}</td>
                  <td className="px-4 py-2">{cd.candidato}</td>
                  <td className="px-4 py-2">{cd.eleccion.nombre}</td>
                  <td className="px-4 py-2">{cd.cargo.nombre}</td>
                  <td className="px-4 py-2">{cd.partido_politico}</td>
                  <td className="px-4 py-2">
                    <span
                      className="inline-block w-4 h-4 rounded"
                      style={{ backgroundColor: cd.color }}
                    />
                  </td>
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(cd)}
                      className="p-2 hover:bg-muted rounded"
                    >
                      <FiEdit3 />
                    </button>
                    <button
                      onClick={() => handleDelete(cd.id)}
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

export default CandidaturaForm;
