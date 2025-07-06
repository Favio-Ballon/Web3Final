import { useState, useEffect } from "react";
import { User } from "../../models/User";
import { UserService } from "../../services/UserService";
import { useAuth } from "../../hooks/useAuth";
import { FiPlus, FiEdit2, FiTrash2, FiLogOut } from "react-icons/fi";

interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
  rol: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  rol?: string;
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

export const UsuariosForm = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    username: "",
    rol: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const getUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await new UserService().getUsers();
      setUsuarios(data || []); // Ensure we always set an array
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      setUsuarios([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsuarios();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = "Email obligatorio";
    if (!formData.first_name) newErrors.first_name = "Nombre obligatorio";
    if (!formData.last_name) newErrors.last_name = "Apellido obligatorio";
    if (!formData.username) newErrors.username = "Username obligatorio";
    if (!formData.rol) newErrors.rol = "Rol obligatorio";
    if (isCreateModalOpen && !formData.password)
      newErrors.password = "Contraseña obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (validateForm()) {
      try {
        await new UserService().createUser(formData);
        getUsuarios();
        setIsCreateModalOpen(false);
        setFormData({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          username: "",
          rol: "",
        });
      } catch (error) {
        console.error("Error al crear usuario:", error);
      }
    }
  };

  const handleEdit = async () => {
    if (validateForm() && currentUserId) {
      try {
        await new UserService().updateUser(formData, currentUserId);
        getUsuarios();
        setIsEditModalOpen(false);
        setCurrentUserId(null);
        setFormData({
          email: "",
          password: "",
          first_name: "",
          last_name: "",
          username: "",
          rol: "",
        });
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (currentUserId) {
      try {
        await new UserService().deleteUser(currentUserId);
        getUsuarios();
        setIsDeleteModalOpen(false);
        setCurrentUserId(null);
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-heading font-heading mb-8 text-foreground">
            Gestión de Usuarios
          </h1>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:bg-primary/90 flex items-center gap-2"
            >
              <FiPlus /> Crear Usuario
            </button>
          </div>

          <div className="bg-card shadow-sm rounded-sm overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted">
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Apellido
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-heading text-foreground">
                    Rol
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
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : usuarios && usuarios.length > 0 ? (
                  usuarios.map((usuario, index) => (
                    <tr
                      key={usuario.id || usuario.email + index}
                      className="border-t border-border hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        {usuario.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {usuario.first_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {usuario.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {usuario.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <span className="inline-block bg-muted px-2 py-1 rounded-full text-xs">
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => {
                            setCurrentUserId(usuario.id || index); // Use actual ID if available, fallback to index
                            setFormData({
                              email: usuario.email,
                              password: "", // Don't pre-fill password for security
                              first_name: usuario.first_name,
                              last_name: usuario.last_name,
                              username: usuario.username,
                              rol: usuario.rol,
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="text-accent hover:text-primary p-1 rounded-sm"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentUserId(usuario.id || index);
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
                      No hay usuarios disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Modales Create/Edit */}
          {(isCreateModalOpen || isEditModalOpen) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 ">
              <div className="bg-card p-6 rounded-sm max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-heading font-heading mb-4">
                  {isCreateModalOpen ? "Crear" : "Editar"} Usuario
                </h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full border border-input rounded-sm p-2"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}

                  <input
                    type="text"
                    placeholder="Nombre"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    className="w-full border border-input rounded-sm p-2"
                  />
                  {errors.first_name && (
                    <p className="text-destructive text-sm">
                      {errors.first_name}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Apellido"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full border border-input rounded-sm p-2"
                  />
                  {errors.last_name && (
                    <p className="text-destructive text-sm">
                      {errors.last_name}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full border border-input rounded-sm p-2"
                  />
                  {errors.username && (
                    <p className="text-destructive text-sm">
                      {errors.username}
                    </p>
                  )}

                  <input
                    type="password"
                    placeholder={
                      isEditModalOpen
                        ? "Nueva contraseña (opcional)"
                        : "Contraseña"
                    }
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full border border-input rounded-sm p-2"
                  />
                  {errors.password && (
                    <p className="text-destructive text-sm">
                      {errors.password}
                    </p>
                  )}

                  <select
                    value={formData.rol}
                    onChange={(e) =>
                      setFormData({ ...formData, rol: e.target.value })
                    }
                    className="w-full border border-input rounded-sm p-2"
                  >
                    <option value="">Seleccionar Rol</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin_padron">Admin Padrón</option>
                    <option value="admin_elecciones">Admin Elecciones</option>
                    <option value="jurado">Jurado</option>
                  </select>
                  {errors.rol && (
                    <p className="text-destructive text-sm">{errors.rol}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      setIsEditModalOpen(false);
                      setFormData({
                        email: "",
                        password: "",
                        first_name: "",
                        last_name: "",
                        username: "",
                        rol: "",
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
                    {isCreateModalOpen ? "Crear" : "Guardar"}
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
                  ¿Está seguro que desea eliminar este usuario?
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
        </div>
      </div>
    </>
  );
};
