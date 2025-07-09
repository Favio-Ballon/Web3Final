import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LoginRequest } from "../models/dto/LoginRequest";
import { AuthService } from "../services/AuthService";
import { URLS } from "../navigation/CONSTANTS";
import { useAuth } from "../hooks/useAuth";
import { useAppSelector } from "../redux/hooks";

type Inputs = {
  username: string;
  password: string;
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const { doLogin } = useAuth();
  const [formData, setFormData] = useState<Inputs>({
    username: "",
    password: "",
  });
  const email = useAppSelector((state) => state.auth.email);
  const rol = useAppSelector((state) => state.auth.rol);

  useEffect(() => {
    console.log("Email from state:", email);
    console.log("Role from state:", rol);

    if (email && rol) {
      console.log("User authenticated, navigating based on role:", rol);

      if (rol === "super_admin") {
        navigate(URLS.GESTIONUSUARIOS);
      } else if (rol === "admin_padron") {
        navigate(URLS.PADRONELECTORAL);
      } else if (rol === "admin_elecciones") {
        navigate(URLS.ADMINISTRACIONELECTORAL);
      } else if (rol === "jurado") {
        navigate(URLS.VOTACION);
      } else {
        navigate(URLS.HOME);
      }
    }
  }, [email, rol, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    const login: LoginRequest = {
      username: data.username,
      password: data.password,
    };

    try {
      const response = await new AuthService().login(
        login.username,
        login.password
      );
      console.log("Login successful", response);

      // Obtener información del usuario después del login
      const userInfo = await new AuthService().me();
      console.log("User info:", userInfo);

      // Guardar en Redux con toda la información del usuario
      doLogin({
        access_token: response.access,
        refresh_token: response.refresh,
        email: userInfo.email,
        rol: userInfo.rol,
        first_name: userInfo.first_name,
        last_name: userInfo.last_name,
      });

      // La navegación se hará automáticamente por el useEffect que escucha los cambios en email/rol
    } catch (error) {
      console.error("Login failed", error);
      alert("Error en el inicio de sesión. Verifica tus credenciales.");
    }
  };

  const [isLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/30">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-[1.02]">
        <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
          Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="username"
              {...register("username", { required: true })}
              name="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className={`w-full px-4 py-2 border ${
                errors.username ? "border-destructive" : "border-input"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-transparent peer placeholder-transparent`}
              placeholder="Username"
              aria-label="Username"
            />
            <label
              htmlFor="username"
              className="absolute left-4 -top-2.5 bg-card px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm text-accent"
            >
              Username
            </label>
            {errors.username && (
              <p className="mt-1 text-sm text-destructive">
                Este campo es requerido
              </p>
            )}
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              {...register("password", { required: true })}
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full px-4 py-2 border ${
                errors.password ? "border-destructive" : "border-input"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-transparent peer placeholder-transparent pr-10`}
              placeholder="Password"
              aria-label="Password"
            />
            <label
              htmlFor="password"
              className="absolute left-4 -top-2.5 bg-card px-1 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm text-accent"
            >
              Password
            </label>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                Este campo es requerido
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-center text-accent">
            No tienes una cuenta?{" "}
            <a href="/register" className="text-primary hover:underline">
              Registrate
            </a>
          </p>

          {/* Enlace para verificación pública del padrón */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-2">
              ¿Quieres verificar tu estado en el padrón electoral?
            </p>
            <Link
              to={URLS.VERIFICACION_PADRON}
              className="block w-full py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors duration-200 text-center"
            >
              Verificar Padrón Electoral
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
