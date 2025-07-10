import { useState, useEffect } from "react";
import { Seccion } from '../../../models/Seccion';
import { SeccionService } from "../../../services/SeccionService";
import { useAuth } from "../../../hooks/useAuth";
import { FiTrash2, FiLogOut, FiMapPin } from "react-icons/fi";
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from "@react-google-maps/api";

import { MultiPointPicker } from "../../../components/MultipointPicker";

interface Punto {
  latitud: number;
  longitud: number;
}

interface FormData {
  nombre: string;
  tipo: string;
  puntos: Punto[];
}

interface FormErrors {
  nombre?: string;
  tipo?: string;
  puntos?: string;
}

export const SeccionForm = () => {
  const { doLogout, email } = useAuth();
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    tipo: "",
    puntos: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewMapPoints, setViewMapPoints] = useState<Punto[] | null>(null);

  // Carga inicial de secciones
    useEffect(() => {
      (async () => {
        const raw = await new SeccionService().getSecciones()
        const parsed: Seccion[] = (raw || []).map(s => ({
          ...s,
          puntos: s.puntos.map(p => ({
            latitud: parseFloat(String(p.latitud).replace(',', '.')),
            longitud: parseFloat(String(p.longitud).replace(',', '.')),
          }))
        }))
        setSecciones(parsed)
      })()
    }, [])


  const resetForm = () => {
    setFormData({ nombre: "", tipo: "", puntos: [] });
    setErrors({});
  };

  

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.nombre.trim()) errs.nombre = "Nombre obligatorio";
    if (!formData.tipo.trim()) errs.tipo = "Tipo obligatorio";
    if (formData.puntos.length === 0)
      errs.puntos = "Debes seleccionar al menos un punto";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await new SeccionService().crearSecciones({
        id: 0,
        nombre: formData.nombre,
        tipo: formData.tipo,
        puntos: formData.puntos,
      });
      const data = await new SeccionService().getSecciones();
      setSecciones(data || []);
      resetForm();
    } catch (e) {
      console.error("Error creando sección", e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await new SeccionService().eliminarSeccion(id);
      setSecciones((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      console.error("Error eliminando sección", e);
    }
  };

  // Loader de Google Maps para el modal de ver ruta
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Gestión de Secciones</h1>
        <div className="flex items-center gap-4">
          <span>{email}</span>
          <button onClick={doLogout} className="flex items-center gap-1">
            <FiLogOut /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-6 space-y-8">
        {/* Formulario de creación */}
        <div className="bg-card p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">Crear Sección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <input
                type="text"
                placeholder="Nombre de la sección"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full border p-2 rounded"
              />
              {errors.nombre && (
                <p className="text-destructive text-sm">{errors.nombre}</p>
              )}
            </div>
            {/* Tipo */}
            <div>
              <select
                value={formData.tipo}
                onChange={(e) =>
                  setFormData({ ...formData, tipo: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">-- Selecciona tipo --</option>
                <option value="Departamento">Departamento</option>
                <option value="Provincial">Provincial</option>
                <option value="Ciudadana">Ciudadana</option>
              </select>
              {errors.tipo && (
                <p className="text-destructive text-sm">{errors.tipo}</p>
              )}
            </div>
          </div>

          {/* Listado de puntos */}
          <div className="mt-4">
            <label className="block font-medium mb-2">Puntos geográficos</label>
            {formData.puntos.map((p, i) => (
              <div
                key={`${p.latitud}-${p.longitud}-${i}`}
                className="flex items-center justify-between mb-1"
              >
                <span>
                  {p.latitud.toFixed(6)}, {p.longitud.toFixed(6)}
                </span>
                <button
                  onClick={() =>
                    setFormData((fd) => ({
                      ...fd,
                      puntos: fd.puntos.filter((_, idx) => idx !== i),
                    }))
                  }
                  className="text-destructive"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            {errors.puntos && (
              <p className="text-destructive text-sm">{errors.puntos}</p>
            )}
            <button
              onClick={() => setIsPickerOpen(true)}
              className="mt-2 flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
            >
              <FiMapPin /> Agregar Punto
            </button>
          </div>

          {/* Botones */}
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
              Guardar
            </button>
          </div>
        </div>

        {/* Tabla de secciones */}
        <div className="bg-card p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Secciones existentes</h3>
          <table className="w-full table-auto">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Mapa</th>
                <th className="px-4 py-2">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {secciones.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">{s.nombre}</td>
                  <td className="px-4 py-2">{s.tipo}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setViewMapPoints(s.puntos)}
                      className="px-4 py-2 border border-input rounded hover:bg-muted"
                    >
                      Ver Mapa
                    </button>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    > Eliminar Seccion </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ---------------------------- */}
      {/* …en tu render de SeccionForm */}
      <MultiPointPicker
        key={isPickerOpen ? "picker-open" : "picker-closed"}  // <— aquí
        isOpen={isPickerOpen}
        initialPoints={formData.puntos.map((p) => ({
          lat: p.latitud,
          lng: p.longitud,
        }))}
        onClose={() => setIsPickerOpen(false)}
        onSave={(pts) => {
          setFormData((fd) => ({
            ...fd,
            puntos: pts.map(({ lat, lng }) => ({
              latitud: lat,
              longitud: lng,
            })),
          }));
          setIsPickerOpen(false);
        }}
      />

      {/* ---------------------------- */}

      {/* Modal de ver ruta (polyline) */}
      {viewMapPoints && isLoaded && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-card p-4 rounded max-w-2xl w-full max-h-[90vh] overflow-auto">
      <h2 className="text-lg font-semibold mb-2">Ruta de la Sección</h2>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={{
          lat: viewMapPoints[0].latitud,
          lng: viewMapPoints[0].longitud,
        }}
        zoom={13}
        options={{ streetViewControl: false, mapTypeControl: true }}
      >
        <Polyline
          path={viewMapPoints.map(p => ({
            lat: p.latitud,
            lng: p.longitud,
          }))}
          options={{ strokeColor: "#3b82f6", strokeWeight: 4 }}
        />
        {viewMapPoints.map((p, i) => (
          <Marker
            key={i}
            position={{ lat: p.latitud, lng: p.longitud }}
          />
        ))}
      </GoogleMap>

      <div className="flex justify-end mt-4">
        <button
          onClick={() => setViewMapPoints(null)}
          className="px-4 py-2 border rounded hover:bg-muted"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default SeccionForm;
