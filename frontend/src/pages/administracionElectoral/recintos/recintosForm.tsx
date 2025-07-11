import { useState, useEffect } from 'react';
import { Recinto } from '../../../models/Recinto';
import { RecintoService } from '../../../services/RecintoService';
import { SeccionService } from '../../../services/SeccionService';
import { useAuth } from '../../../hooks/useAuth';
import { FiTrash2, FiEdit3, FiLogOut, FiMapPin } from 'react-icons/fi';
import { LocationPicker } from '../../../components/LocationPicker';
import { Seccion } from '../../../models/Seccion';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { FiMap } from 'react-icons/fi';

interface FormData {
  nombre: string;
  latitud: number | null;
  longitud: number | null;
  seccion: number | null;
}
interface FormErrors {
  nombre?: string;
  latitud?: string;
  longitud?: string;
  seccion?: string;
}

export const RecintoForm = () => {
  const { doLogout, email } = useAuth();
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [viewLocation, setViewLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: "google-map-script",                 // mismo id que en LocationPicker
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ["marker", "geometry"],       // mismas librerías
  });


  const [recintos, setRecintos] = useState<Recinto[]>([]);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    latitud: null,
    longitud: null,
    seccion: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Carga inicial de secciones y recintos
  useEffect(() => {
    (async () => {
      const secData = await new SeccionService().getSecciones();
      setSecciones(secData || []);
      const recData = await new RecintoService().getRecintos();
      setRecintos(recData || []);
    })();
  }, []);

  const resetForm = () => {
    setFormData({ nombre: '', latitud: null, longitud: null, seccion: null });
    setErrors({});
    setEditingId(null);
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.nombre.trim()) errs.nombre = 'Nombre obligatorio';
    if (formData.latitud === null) errs.latitud = 'Latitud requerida';
    if (formData.longitud === null) errs.longitud = 'Longitud requerida';
    if (!formData.seccion) errs.seccion = 'Debe seleccionar sección';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = {
        nombre: formData.nombre,
        latitud: formData.latitud!,
        longitud: formData.longitud!,
        seccion: formData.seccion!,
        id: editingId ?? undefined,
      };
      if (editingId) {
        await new RecintoService().editarRecinto(payload);
      } else {
        await new RecintoService().crearRecinto(payload);
      }
      const updated = await new RecintoService().getRecintos();
      setRecintos(updated || []);
      resetForm();
    } catch (e) {
      console.error('Error guardando recinto', e);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await new RecintoService().eliminarRecinto(id);
      setRecintos(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error('Error eliminando recinto', e);
    }
  };

  const handleEdit = (r: Recinto) => {
    setFormData({
      nombre: r.nombre,
      latitud: r.latitud,
      longitud: r.longitud,
      seccion: r.seccion,
    });
    setEditingId(r.id ?? null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Gestión de Recintos</h1>
        <div className="flex items-center gap-4">
          <span>{email}</span>
          <button onClick={doLogout} className="flex items-center gap-1">
            <FiLogOut /> Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-6 space-y-8">
        {/* Formulario de creación/edición */}
        <div className="bg-card p-6 rounded shadow">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar' : 'Crear'} Recinto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Nombre del recinto"
                value={formData.nombre}
                onChange={e => setFormData(fd => ({ ...fd, nombre: e.target.value }))}
                className="w-full border p-2 rounded"
              />
              {errors.nombre && <p className="text-destructive text-sm">{errors.nombre}</p>}
            </div>
            <div>
              <select
                value={formData.seccion || ''}
                onChange={e => setFormData(fd => ({ ...fd, seccion: Number(e.target.value) }))}
                className="w-full border p-2 rounded"
              >
                <option value="">-- Selecciona sección --</option>
                {secciones.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
              {errors.seccion && <p className="text-destructive text-sm">{errors.seccion}</p>}
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-medium mb-2">Ubicación geográfica</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPickerOpen(true)}
                className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
              >
                <FiMapPin /> Seleccionar punto
              </button>
              <span>
                {formData.latitud?.toFixed(6)}, {formData.longitud?.toFixed(6)}
              </span>
            </div>
            {(errors.latitud || errors.longitud) && (
              <p className="text-destructive text-sm">{errors.latitud || errors.longitud}</p>
            )}
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
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Tabla de recintos */}
        <div className="bg-card p-4 rounded shadow">
          <h3 className="font-semibold mb-4">Recintos existentes</h3>
          <table className="w-full table-auto">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Sección</th>
                <th className="px-4 py-2 text-left">Latitud</th>
                <th className="px-4 py-2 text-left">Longitud</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recintos.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.nombre}</td>
                  <td className="px-4 py-2">{r.seccion}</td>
                  <td className="px-4 py-2">{r.latitud.toFixed(6)}</td>
                  <td className="px-4 py-2">{r.longitud.toFixed(6)}</td>
                  <td className="px-4 py-2 text-center flex justify-center gap-2">
                    <button onClick={() => handleEdit(r)} className="p-2 hover:bg-muted rounded">
                      <FiEdit3 />
                    </button>
                    <button
                      onClick={() => { if (r.id !== undefined) handleDelete(r.id); }}
                      className="p-2 text-destructive hover:bg-muted rounded"
                    >
                      <FiTrash2 />
                    </button>
                    <button
                      onClick={() => setViewLocation({ lat: r.latitud, lng: r.longitud })}
                      className="p-2 hover:bg-muted rounded"
                    >
                      <FiMap />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <LocationPicker
        isOpen={isPickerOpen}
        initialLat={formData.latitud ?? undefined}
        initialLng={formData.longitud ?? undefined}
        onLocationSelect={(lat, lng) => setFormData(fd => ({ ...fd, latitud: lat, longitud: lng }))}
        onClose={() => setIsPickerOpen(false)}
      />
      {viewLocation && isMapLoaded && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-4 rounded max-w-md w-full">
            <h2 className="text-lg font-semibold mb-2">Ubicación del Recinto</h2>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '300px' }}
              center={viewLocation}
              zoom={15}
              options={{ streetViewControl: false, mapTypeControl: true }}
            >
              <Marker position={viewLocation} />
            </GoogleMap>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewLocation(null)}
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

export default RecintoForm;