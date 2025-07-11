import { useState, useEffect } from "react";
import {
  Votante,
  VotanteCreateRequest,
  VotanteUpdateRequest,
} from "../../models/Votante";
import { PadronService } from "../../services/PadronService";
import { useAuth } from "../../hooks/useAuth";
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiMapPin } from "react-icons/fi";
import { RecintoLocationPicker } from "../../components/RecintoLocationPicker";
import { RecintoService } from "../../services/RecintoService";
import { Recinto } from "../../models/Recinto";
import { EleccionService } from "../../services/EleccionService";

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
  recinto?: string; // Error for recinto selection
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
  const [recintos, setRecintos] = useState<Recinto[]>([]);
  const [recintoSeleccionado, setRecintoSeleccionado] =
    useState<Recinto | null>(null);
  const [isRecintoLocationPickerOpen, setIsRecintoLocationPickerOpen] =
    useState(false);

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

  const getRecintos = async () => {
    try {
      const data = await new RecintoService().getRecintos();
      console.log("Recintos obtenidos:", data);
      setRecintos(data || []); // Ensure we always set an array
    } catch (error) {
      console.error("Error al obtener los recintos:", error);
      setRecintos([]); // Set empty array on error
    }
  };

  useEffect(() => {
    getVotantes();
    getRecintos();
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

    if (!recintoSeleccionado) {
      newErrors.recinto = "Recinto obligatorio";
    }

    if (isCreateModalOpen) {
      if (!formData.foto) newErrors.foto = "Foto obligatoria";
      if (!formData.ciReverso) newErrors.ciReverso = "CI reverso obligatorio";
      if (!formData.ciAnverso) newErrors.ciAnverso = "CI anverso obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    console.log(recintoSeleccionado);
    if (validateForm()) {
      try {
        const votanteData: VotanteCreateRequest = {
          ci: parseInt(formData.ci),
          nombre: formData.nombre,
          apellido: formData.apellido,
          direccion: formData.direccion,
          fechaNacimiento: formData.fechaNacimiento,
          latitud: 0,
          longitud: 0,
          departamento:
            recintoSeleccionado &&
            typeof recintoSeleccionado.seccion === "object" &&
            recintoSeleccionado.seccion.tipo === "Departamento"
              ? recintoSeleccionado.seccion.nombre
              : formData.departamento,
          ciudad:
            recintoSeleccionado &&
            typeof recintoSeleccionado.seccion === "object" &&
            recintoSeleccionado.seccion.tipo === "Ciudadana"
              ? recintoSeleccionado.seccion.nombre
              : formData.ciudad,
          provincia:
            recintoSeleccionado &&
            typeof recintoSeleccionado.seccion === "object" &&
            recintoSeleccionado.seccion.tipo === "Provincial"
              ? recintoSeleccionado.seccion.nombre
              : formData.provincia,
          foto: formData.foto!,
          ciReverso: formData.ciReverso!,
          ciAnverso: formData.ciAnverso!,
          recinto: recintoSeleccionado?.id?.toString() || "", // Ensure recinto is a string
        };

        console.log("PadronForm - Creating voter with data:", votanteData);

        await new PadronService().createVotante(votanteData);
        getVotantes();
        // await new EleccionService().distribuirMesas( 
        //   parseInt(recintoSeleccionado?.seccion.id),
        //   parseInt(votantes)
        // );
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
          recinto: recintoSeleccionado?.id?.toString() || "",
          departamento:
            recintoSeleccionado &&
            typeof recintoSeleccionado.seccion === "object" &&
            recintoSeleccionado.seccion.tipo === "Departamento"
              ? recintoSeleccionado.seccion.nombre
              : formData.departamento,
          ciudad:
            recintoSeleccionado &&
            typeof recintoSeleccionado.seccion === "object" &&
            recintoSeleccionado.seccion.tipo === "Ciudadana"
              ? recintoSeleccionado.seccion.nombre
              : formData.ciudad,
          provincia:
            recintoSeleccionado &&
            typeof recintoSeleccionado.seccion === "object" &&
            recintoSeleccionado.seccion.tipo === "Provincial"
              ? recintoSeleccionado.seccion.nombre
              : formData.provincia,
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
    setRecintoSeleccionado(null); // Clear recinto selection when selecting custom location
  };

  const handleRecintoSelect = (recinto: Recinto) => {
    console.log("PadronForm - Recinto seleccionado:", recinto);

    // Set the coordinates from the selected recinto
    const latStr = recinto.latitud.toFixed(6).replace(".", ",");
    const lngStr = recinto.longitud.toFixed(6).replace(".", ",");

    // Determine which fields to update based on seccion tipo
    let departamento = formData.departamento;
    let ciudad = formData.ciudad;
    let provincia = formData.provincia;

    if (typeof recinto.seccion === "object" && recinto.seccion) {
      switch (recinto.seccion.tipo) {
        case "Departamento":
          departamento = recinto.seccion.nombre;
          ciudad = " "; // Clear other fields
          provincia = " ";
          break;
        case "Ciudadana":
          ciudad = recinto.seccion.nombre;
          departamento = " "; // Clear other fields
          provincia = " ";
          break;
        case "Provincial":
          provincia = recinto.seccion.nombre;
          departamento = " "; // Clear other fields
          ciudad = " ";
          break;
      }
    }

    setFormData({
      ...formData,
      latitud: latStr,
      longitud: lngStr,
    });

    setRecintoSeleccionado(recinto);
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
                    Seccion
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
                          {votante.departamento ? votante.departamento : ""}
                          {votante.ciudad ? votante.ciudad : ""}
                          {votante.provincia ? votante.provincia : ""}
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

                    {/* Show selected recinto info if any */}
                    {recintoSeleccionado && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-sm">
                        <p className="text-sm text-blue-800">
                          <strong>Recinto seleccionado:</strong>{" "}
                          {recintoSeleccionado.nombre}
                          {` (Sección: ${
                            typeof recintoSeleccionado.seccion === "object" &&
                            recintoSeleccionado.seccion !== null
                              ? recintoSeleccionado.seccion.nombre
                              : recintoSeleccionado.seccion
                          })`}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {/* Botón del mapa con recintos */}
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            console.log(
                              "PadronForm - Opening RecintoLocationPicker with recintos:",
                              recintos
                            );
                            setIsRecintoLocationPickerOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground border border-input rounded-sm hover:bg-primary/90"
                        >
                          <FiMapPin size={16} />
                          Ver Recintos
                        </button>
                      </div>
                    </div>
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

          {/* Recinto Location Picker Modal */}
          <RecintoLocationPicker
            isOpen={isRecintoLocationPickerOpen}
            onClose={() => {
              console.log("PadronForm - Closing RecintoLocationPicker");
              setIsRecintoLocationPickerOpen(false);
            }}
            onLocationSelect={handleLocationSelect}
            onRecintoSelect={handleRecintoSelect}
            recintos={(() => {
              console.log(
                "PadronForm - Pasando recintos al RecintoLocationPicker:",
                {
                  count: recintos.length,
                  data: recintos,
                }
              );
              return recintos;
            })()}
            selectedRecinto={recintoSeleccionado}
            initialLat={
              formData.latitud
                ? (() => {
                    const parsed = parseFloat(
                      formData.latitud.replace(",", ".")
                    );
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
