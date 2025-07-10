import { useState } from "react";
import { Link } from "react-router-dom";
import { VotantePublic } from "../models/Votante";
import { PadronService } from "../services/PadronService";
import { URLS } from "../navigation/CONSTANTS";
import {
  FiSearch,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiHome,
} from "react-icons/fi";

interface VerificationState {
  isLoading: boolean;
  votante: VotantePublic | null;
  error: string | null;
  searched: boolean;
}

export const VerificacionPadron = () => {
  const [ci, setCi] = useState<string>("");
  const [verification, setVerification] = useState<VerificationState>({
    isLoading: false,
    votante: null,
    error: null,
    searched: false,
  });

  const handleSearch = async () => {
    if (!ci.trim()) {
      setVerification({
        isLoading: false,
        votante: null,
        error: "Por favor ingrese un número de CI válido",
        searched: false,
      });
      return;
    }

    const ciNumber = parseInt(ci.trim());
    if (isNaN(ciNumber) || ciNumber <= 0) {
      setVerification({
        isLoading: false,
        votante: null,
        error: "El CI debe ser un número válido",
        searched: false,
      });
      return;
    }

    setVerification({
      isLoading: true,
      votante: null,
      error: null,
      searched: false,
    });

    try {
      const votante = await new PadronService().getVotanteByCi(ciNumber);
      setVerification({
        isLoading: false,
        votante,
        error: null,
        searched: true,
      });
    } catch (error) {
      console.error("Error al verificar CI:", error);
      setVerification({
        isLoading: false,
        votante: null,
        error:
          "No se encontró ningún votante con el CI ingresado o ocurrió un error en la consulta",
        searched: true,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const calculateAge = (birthDate: string): number => {
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      return age;
    } catch {
      return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary to-muted">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Verificación del Padrón Electoral
              </h1>
              <p className="text-muted-foreground">
                Consulte su estado de registro en el padrón electoral
              </p>
            </div>
            <Link
              to={URLS.LOGIN}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FiHome className="h-4 w-4" />
              Ir al Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <div className="text-center mb-6">
            <FiUser className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Ingrese su Número de CI
            </h2>
            <p className="text-muted-foreground">
              Para verificar su estado en el padrón electoral, ingrese su número
              de cédula de identidad
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="number"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: 12345678"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  disabled={verification.isLoading}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={verification.isLoading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {verification.isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                ) : (
                  <FiSearch className="h-4 w-4" />
                )}
                {verification.isLoading ? "Verificando..." : "Verificar"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {verification.searched && (
          <div className="bg-card rounded-lg shadow-md p-6">
            {verification.error && (
              <div className="text-center py-8">
                <FiXCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  {verification.error}
                </p>
                <div className="bg-chart-4/10 border border-chart-4/30 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-accent-foreground">
                    <strong>¿No aparece en el padrón?</strong>
                    <br />
                    Contacte con las autoridades electorales correspondientes
                    para verificar su registro.
                  </p>
                </div>
              </div>
            )}

            {verification.votante && (
              <div>
                <div className="text-center mb-6">
                  <FiCheckCircle className="mx-auto h-16 w-16 text-chart-2 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    ¡Registrado en el Padrón Electoral!
                  </h3>
                  <p className="text-muted-foreground">
                    Sus datos han sido encontrados en el sistema
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Datos Personales */}
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FiUser className="h-5 w-5 text-primary" />
                      Datos Personales
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          CI:
                        </span>
                        <p className="text-foreground">
                          {verification.votante.ci}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Nombre Completo:
                        </span>
                        <p className="text-foreground">
                          {verification.votante.nombre}{" "}
                          {verification.votante.apellido}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          <FiCalendar className="h-4 w-4" />
                          Fecha de Nacimiento:
                        </span>
                        <p className="text-foreground">
                          {formatDate(verification.votante.fechaNacimiento)}
                          <span className="text-sm text-muted-foreground ml-2">
                            (
                            {calculateAge(verification.votante.fechaNacimiento)}{" "}
                            años)
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información de Recinto */}
                  <div className="bg-secondary rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FiMapPin className="h-5 w-5 text-primary" />
                      Información de Recinto
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Departamento:
                        </span>
                        <p className="text-foreground">
                          {verification.votante.departamento}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Ciudad:
                        </span>
                        <p className="text-foreground">
                          {verification.votante.ciudad}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Provincia:
                        </span>
                        <p className="text-foreground">
                          {verification.votante.provincia}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="mt-6 bg-chart-2/10 border border-chart-2/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="h-5 w-5 text-chart-2" />
                    <div>
                      <p className="font-medium text-accent-foreground">
                        Estado: Habilitado para Votar
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Usted está registrado en el padrón electoral y puede
                        ejercer su derecho al voto
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="mt-4 bg-chart-3/10 border border-chart-3/30 rounded-lg p-4">
                  <h5 className="font-medium text-accent-foreground mb-2">
                    Información Importante:
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • El día de la elección, deberá presentarse en el recinto
                      correspondiente a su registro
                    </li>
                    <li>
                      • Es obligatorio portar su cédula de identidad vigente
                    </li>
                    <li>• Verifique los horarios de votación establecidos</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
