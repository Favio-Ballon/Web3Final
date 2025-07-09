import { useState, useEffect } from "react";
import {
  Votante,
  VotanteCreateRequest,
  VotanteUpdateRequest,
} from "../../models/Votante";
import { PadronService } from "../../services/PadronService";
import { useAuth } from "../../hooks/useAuth";
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiMapPin } from "react-icons/fi";
import { LocationPicker } from "../../components/LocationPicker";

interface FormData {
  ci: string;
  nombre: string;
  apellido: string;
  direccion: string;
  fechaNacimiento: string;
  latitud: string;
  longitud: string;
  departamento: string;
  ciudad: string;
  provincia: string;
  foto?: File;
  ciReverso?: File;
  ciAnverso?: File;
}

interface FormErrors {
  ci?: string;
  nombre?: string;
  apellido?: string;
  direccion?: string;
  fechaNacimiento?: string;
  latitud?: string;
  longitud?: string;
  departamento?: string;
  ciudad?: string;
  provincia?: string;
  foto?: string;
  ciReverso?: string;
  ciAnverso?: string;
}

// Header temporal
const Header = () => {
  const { doLogout, email, first_name, last_name } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Sistema de Gestión</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {first_name && last_name ? `${first_name} ${last_name}` : email}
          </span>
          <button
            onClick={doLogout}
            className="flex items-center gap-2 px-3 py-1 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-sm transition-colors"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export const PadronForm = () => {
  const [votantes, setVotantes] = useState<Votante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [currentVotanteId, setCurrentVotanteId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    ci: "",
    nombre: "",
    apellido: "",
    direccion: "",
    fechaNacimiento: "",
    latitud: "",
    longitud: "",
    departamento: "",
    ciudad: "",
    provincia: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const getVotantes = async () => {
    try {
      setIsLoading(true);
      const data = await new PadronService().getVotantes();
      setVotantes(data || []); // Ensure we always set an array
    } catch (error) {
      console.error("Error al obtener los votantes:", error);
      setVotantes([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getVotantes();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.ci) newErrors.ci = "CI obligatorio";
    if (!formData.nombre) newErrors.nombre = "Nombre obligatorio";
    if (!formData.apellido) newErrors.apellido = "Apellido obligatorio";
    if (!formData.direccion) newErrors.direccion = "Dirección obligatoria";
    if (!formData.fechaNacimiento)
      newErrors.fechaNacimiento = "Fecha de nacimiento obligatoria";

    // Validación de coordenadas
    if (!formData.latitud) {
      newErrors.latitud = "Latitud obligatoria";
    } else {
      const lat = parseFloat(formData.latitud);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitud = "Latitud debe estar entre -90 y 90";
      }
    }

    if (!formData.longitud) {
      newErrors.longitud = "Longitud obligatoria";
    } else {
      const lng = parseFloat(formData.longitud);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitud = "Longitud debe estar entre -180 y 180";
      }
    }

    if (!formData.departamento)
      newErrors.departamento = "Departamento obligatorio";
    if (!formData.ciudad) newErrors.ciudad = "Ciudad obligatoria";
    if (!formData.provincia) newErrors.provincia = "Provincia obligatoria";

    if (isCreateModalOpen) {
      if (!formData.foto) newErrors.foto = "Foto obligatoria";
      if (!formData.ciReverso) newErrors.ciReverso = "CI reverso obligatorio";
      if (!formData.ciAnverso) newErrors.ciAnverso = "CI anverso obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (validateForm()) {
      try {
        // Parse and validate coordinates (convert comma to dot for parseFloat)
        const latStr = formData.latitud.replace(/,/g, ".");
        const lngStr = formData.longitud.replace(/,/g, ".");
        const latitud = parseFloat(latStr);
        const longitud = parseFloat(lngStr);

        // Additional validation
        if (isNaN(latitud) || latitud < -90 || latitud > 90) {
          alert("Latitud inválida. Debe estar entre -90 y 90.");
          return;
        }
        if (isNaN(longitud) || longitud < -180 || longitud > 180) {
          alert("Longitud inválida. Debe estar entre -180 y 180.");
          return;
        }

        console.log("PadronForm - Creating voter with coordinates:", {
          latitud,
          longitud,
        });

        const votanteData: VotanteCreateRequest = {
          ci: parseInt(formData.ci),
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.direccion,
          fechaNacimiento: formData.fechaNacimiento,
          latitud: latitud,
          longitud: longitud,
          departamento: formData.departamento,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          foto: formData.foto!,
          ciReverso: formData.ciReverso!,
          ciAnverso: formData.ciAnverso!,
        };

        await new PadronService().createVotante(votanteData);
        getVotantes();
        setIsCreateModalOpen(false);
        setFormData({
          ci: "",
          nombre: "",
          apellido: "",
          direccion: "",
          fechaNacimiento: "",
          latitud: "",
          longitud: "",
          departamento: "",
          ciudad: "",
          provincia: "",
        });
      } catch (error) {
        console.error("Error al crear votante:", error);
      }
    }
  };

  const handleEdit = async () => {
    if (validateForm() && currentVotanteId) {
      try {
        // Parse and validate coordinates (convert comma to dot for parseFloat)
        const latStr = formData.latitud.replace(/,/g, ".");
        const lngStr = formData.longitud.replace(/,/g, ".");
        const latitud = parseFloat(latStr);
        const longitud = parseFloat(lngStr);

        // Additional validation
        if (isNaN(latitud) || latitud < -90 || latitud > 90) {
          alert("Latitud inválida. Debe estar entre -90 y 90.");
          return;
        }
        if (isNaN(longitud) || longitud < -180 || longitud > 180) {
          alert("Longitud inválida. Debe estar entre -180 y 180.");
          return;
        }

        console.log("PadronForm - Updating voter with coordinates:", {
          latitud,
          longitud,
        });

        const votanteData: VotanteUpdateRequest = {
          ci: parseInt(formData.ci),
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.direccion,
          fechaNacimiento: formData.fechaNacimiento,
          latitud: latitud,
          longitud: longitud,
          departamento: formData.departamento,
          ciudad: formData.ciudad,
          provincia: formData.provincia,
          // Only include images if they are present
          ...(formData.foto && { foto: formData.foto }),
          ...(formData.ciReverso && { ciReverso: formData.ciReverso }),
          ...(formData.ciAnverso && { ciAnverso: formData.ciAnverso }),
        };

        await new PadronService().updateVotante(votanteData, currentVotanteId);
        getVotantes();
        setIsEditModalOpen(false);
        setCurrentVotanteId(null);
        setFormData({
          ci: "",
          nombre: "",
          apellido: "",
          direccion: "",
          fechaNacimiento: "",
          latitud: "",
          longitud: "",
          departamento: "",
          ciudad: "",
          provincia: "",
        });
      } catch (error) {
        console.error("Error al actualizar votante:", error);
      }
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    // Ensure proper formatting with 6 decimals and comma as decimal separator
    const latStr = lat.toFixed(6).replace(".", ",");
    const lngStr = lng.toFixed(6).replace(".", ",");

    console.log("PadronForm - Coordenadas seleccionadas:", {
      lat,
      lng,
      latStr,
      lngStr,
    });

    setFormData({
      ...formData,
      latitud: latStr,
      longitud: lngStr,
    });
  };

  const handleDelete = async () => {
    if (currentVotanteId) {
      try {
        await new PadronService().deleteVotante(currentVotanteId);
        getVotantes();
        setIsDeleteModalOpen(false);
        setCurrentVotanteId(null);
      } catch (error) {
        console.error("Error al eliminar votante:", error);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-heading font-heading mb-8 text-foreground">
            Gestión del Padrón Electoral
          </h1>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:bg-primary/90 flex items-center gap-2"
            >
              <FiPlus /> Registrar Votante
            </button>
          </div>

          <div className="bg-card shadow-sm rounded-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    CI
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Apellido
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-muted-foreground"
                    >
                      Cargando votantes...
                    </td>
                  </tr>
                ) : votantes && votantes.length > 0 ? (
                  votantes.map((votante, index) => (
                    <tr
                      key={votante.codigo || votante.ci + index}
                      className="border-t border-border hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {votante.ci}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {votante.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {votante.apellido}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {votante.direccion}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span className="inline-block bg-muted px-2 py-1 rounded-full text-xs">
                          {votante.departamento}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => {
                            setCurrentVotanteId(votante.codigo || index);
                            setFormData({
                              ci: votante.ci.toString(),
                              nombre: votante.nombre,
                              apellido: votante.apellido,
                              direccion: votante.direccion,
                              fechaNacimiento: votante.fechaNacimiento,
                              latitud: votante.latitud.toString(),
                              longitud: votante.longitud.toString(),
                              departamento: votante.departamento,
                              ciudad: votante.ciudad,
                              provincia: votante.provincia,
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="text-accent hover:text-primary p-1 rounded-sm"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentVotanteId(votante.codigo || index);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-accent hover:text-destructive p-1 rounded-sm"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-muted-foreground"
                    >
                      No hay votantes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modales Create/Edit */}
          {(isCreateModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 ">
              <div className="bg-card p-6 rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-heading font-heading mb-4">
                  {isCreateModalOpen ? "Registrar" : "Editar"} Votante
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CI */}
                  <div>
                    <input
                      type="number"
                      placeholder="CI"
                      value={formData.ci}
                      onChange={(e) =>
                        setFormData({ ...formData, ci: e.target.value })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.ci && (
                      <p className="text-destructive text-sm">{errors.ci}</p>
                    )}
                  </div>

                  {/* Nombre */}
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.nombre && (
                      <p className="text-destructive text-sm">
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  {/* Apellido */}
                  <div>
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={formData.apellido}
                      onChange={(e) =>
                        setFormData({ ...formData, apellido: e.target.value })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.apellido && (
                      <p className="text-destructive text-sm">
                        {errors.apellido}
                      </p>
                    )}
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div>
                    <input
                      type="date"
                      placeholder="Fecha de Nacimiento"
                      value={formData.fechaNacimiento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fechaNacimiento: e.target.value,
                        })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.fechaNacimiento && (
                      <p className="text-destructive text-sm">
                        {errors.fechaNacimiento}
                      </p>
                    )}
                  </div>

                  {/* Dirección */}
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Dirección"
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData({ ...formData, direccion: e.target.value })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.direccion && (
                      <p className="text-destructive text-sm">
                        {errors.direccion}
                      </p>
                    )}
                  </div>

                  {/* Coordenadas */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Ubicación Geográfica
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {/* Latitud */}
                      <div>
                        <input
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          placeholder="Latitud (-90 a 90)"
                          value={formData.latitud}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseFloat(value);
                            // Solo actualizar si el valor está en rango válido o está vacío
                            if (
                              value === "" ||
                              (!isNaN(numValue) &&
                                numValue >= -90 &&
                                numValue <= 90)
                            ) {
                              setFormData({
                                ...formData,
                                latitud: value,
                              });
                            }
                          }}
                          className="w-full border border-input rounded-sm p-2"
                        />
                        {errors.latitud && (
                          <p className="text-destructive text-sm">
                            {errors.latitud}
                          </p>
                        )}
                      </div>

                      {/* Longitud */}
                      <div>
                        <input
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          placeholder="Longitud (-180 a 180)"
                          value={formData.longitud}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = parseFloat(value);
                            // Solo actualizar si el valor está en rango válido o está vacío
                            if (
                              value === "" ||
                              (!isNaN(numValue) &&
                                numValue >= -180 &&
                                numValue <= 180)
                            ) {
                              setFormData({
                                ...formData,
                                longitud: value,
                              });
                            }
                          }}
                          className="w-full border border-input rounded-sm p-2"
                        />
                        {errors.longitud && (
                          <p className="text-destructive text-sm">
                            {errors.longitud}
                          </p>
                        )}
                      </div>

                      {/* Botón del mapa */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log(
                              "PadronForm - Opening LocationPicker with coordinates:",
                              {
                                latitud: formData.latitud,
                                longitud: formData.longitud,
                              }
                            );
                            setIsLocationPickerOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground border border-input rounded-sm hover:bg-secondary/80"
                        >
                          <FiMapPin size={16} />
                          Seleccionar en Mapa
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Departamento */}
                  <div>
                    <input
                      type="text"
                      placeholder="Departamento"
                      value={formData.departamento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departamento: e.target.value,
                        })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.departamento && (
                      <p className="text-destructive text-sm">
                        {errors.departamento}
                      </p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div>
                    <input
                      type="text"
                      placeholder="Ciudad"
                      value={formData.ciudad}
                      onChange={(e) =>
                        setFormData({ ...formData, ciudad: e.target.value })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.ciudad && (
                      <p className="text-destructive text-sm">
                        {errors.ciudad}
                      </p>
                    )}
                  </div>

                  {/* Provincia */}
                  <div>
                    <input
                      type="text"
                      placeholder="Provincia"
                      value={formData.provincia}
                      onChange={(e) =>
                        setFormData({ ...formData, provincia: e.target.value })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.provincia && (
                      <p className="text-destructive text-sm">
                        {errors.provincia}
                      </p>
                    )}
                  </div>

                  {/* Foto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Foto del Votante (Imagen)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setFormData({ ...formData, foto: e.target.files?.[0] })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.foto && (
                      <p className="text-destructive text-sm">{errors.foto}</p>
                    )}
                  </div>

                  {/* CI Anverso */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      CI Anverso (Imagen)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ciAnverso: e.target.files?.[0],
                        })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.ciAnverso && (
                      <p className="text-destructive text-sm">
                        {errors.ciAnverso}
                      </p>
                    )}
                  </div>

                  {/* CI Reverso */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      CI Reverso (Imagen)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ciReverso: e.target.files?.[0],
                        })
                      }
                      className="w-full border border-input rounded-sm p-2"
                    />
                    {errors.ciReverso && (
                      <p className="text-destructive text-sm">
                        {errors.ciReverso}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                      setFormData({
                        ci: "",
                        nombre: "",
                        apellido: "",
                        direccion: "",
                        fechaNacimiento: "",
                        latitud: "",
                        longitud: "",
                        departamento: "",
                        ciudad: "",
                        provincia: "",
                      });
                      setErrors({});
                    }}
                    className="px-4 py-2 border border-input rounded-sm hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={isCreateModalOpen ? handleCreate : handleEdit}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90"
                  >
                    {isCreateModalOpen ? "Registrar" : "Guardar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Delete */}
          {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-card p-6 rounded-sm max-w-md w-full">
                <h2 className="text-heading font-heading mb-4">
                  Confirmar Eliminación
                </h2>
                <p className="text-foreground mb-6">
                  ¿Está seguro que desea eliminar este votante del padrón
                  electoral?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-4 py-2 border border-input rounded-sm hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-sm hover:bg-destructive/90"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Location Picker Modal */}
          <LocationPicker
            isOpen={isLocationPickerOpen}
            onClose={() => {
              console.log("PadronForm - Closing LocationPicker");
              setIsLocationPickerOpen(false);
            }}
            onLocationSelect={handleLocationSelect}
            initialLat={
              formData.latitud
                ? (() => {
                    const parsed = parseFloat(
                      formData.latitud.replace(",", ".")
                    );
                    console.log("PadronForm - Passing initialLat:", {
                      original: formData.latitud,
                      parsed,
                    });
                    return parsed;
                  })()
                : undefined
            }
            initialLng={
              formData.longitud
                ? (() => {
                    const parsed = parseFloat(
                      formData.longitud.replace(",", ".")
                    );
                    console.log("PadronForm - Passing initialLng:", {
                      original: formData.longitud,
                      parsed,
                    });
                    return parsed;
                  })()
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
};
