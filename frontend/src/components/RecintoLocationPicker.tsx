import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
} from "@react-google-maps/api";
import { Recinto } from "../models/Recinto";

interface RecintoLocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  onRecintoSelect: (recinto: Recinto) => void;
  initialLat?: number;
  initialLng?: number;
  isOpen: boolean;
  onClose: () => void;
  recintos: Recinto[];
  selectedRecinto?: Recinto | null;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Libraries array must be outside component to avoid re-renders
const libraries: ("marker" | "geometry")[] = ["marker", "geometry"];

// Coordenadas por defecto de Bolivia
const defaultCenter = {
  lat: -17.819308,
  lng: -63.183015,
};

export const RecintoLocationPicker: React.FC<RecintoLocationPickerProps> = ({
  onLocationSelect,
  onRecintoSelect,
  initialLat,
  initialLng,
  isOpen,
  onClose,
  recintos,
  selectedRecinto,
}) => {
  console.log("RecintoLocationPicker - Props recibidas:", {
    recintos: recintos?.length || 0,
    recintosData: recintos,
    isOpen,
    selectedRecinto,
  });

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey:
      (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "",
    libraries: libraries,
  });

  // Helper function to parse coordinates (handle comma decimal separator)
  const parseCoordinate = (coord: number | undefined): number | undefined => {
    if (coord === undefined) return undefined;
    if (typeof coord === "number") return coord;
    // If it's a string with comma, convert to number
    const coordStr = String(coord).replace(",", ".");
    const parsed = parseFloat(coordStr);
    console.log(
      `RecintoLocationPicker - Parsing coordinate: ${coord} -> ${parsed}`
    );
    return isNaN(parsed) ? undefined : parsed;
  };

  const [mapKey, setMapKey] = useState(0);

  const parsedInitialLat = parseCoordinate(initialLat);
  const parsedInitialLng = parseCoordinate(initialLng);

  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(
    parsedInitialLat && parsedInitialLng
      ? { lat: parsedInitialLat, lng: parsedInitialLng }
      : null
  );

  const [activeInfoWindow, setActiveInfoWindow] = useState<number | null>(null);
  const [currentSelectedRecinto, setCurrentSelectedRecinto] =
    useState<Recinto | null>(selectedRecinto || null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [mapCenter, setMapCenter] = useState(() => {
    // If we have initial coordinates, use them
    if (parsedInitialLat && parsedInitialLng) {
      return { lat: parsedInitialLat, lng: parsedInitialLng };
    }
    // If we have recintos, center on the first one
    if (recintos && recintos.length > 0) {
      console.log(
        "RecintoLocationPicker - Centering on first recinto:",
        recintos[0]
      );
      return { lat: recintos[0].latitud, lng: recintos[0].longitud };
    }
    // Default to Bolivia center
    return defaultCenter;
  });

  // Update selected position when modal opens with new initial coordinates
  useEffect(() => {
    console.log("RecintoLocationPicker - useEffect triggered:", {
      isOpen,
      initialLat,
      initialLng,
      recintos: recintos?.length,
    });

    if (isOpen) {
      const newParsedLat = parseCoordinate(initialLat);
      const newParsedLng = parseCoordinate(initialLng);

      if (newParsedLat !== undefined && newParsedLng !== undefined) {
        const newPosition = { lat: newParsedLat, lng: newParsedLng };
        setSelectedPosition(newPosition);
        setMapCenter(newPosition);
        setMapKey((prev) => prev + 1);
      } else if (recintos && recintos.length > 0) {
        // Center on first recinto if no initial coordinates
        setMapCenter({ lat: recintos[0].latitud, lng: recintos[0].longitud });
        setSelectedPosition(null);
      } else {
        setSelectedPosition(null);
        setMapCenter(defaultCenter);
      }
    }
  }, [isOpen, initialLat, initialLng, recintos]);

  // Update selected recinto when prop changes
  useEffect(() => {
    setCurrentSelectedRecinto(selectedRecinto || null);
  }, [selectedRecinto]);

  const handleRecintoClick = useCallback((recinto: Recinto) => {
    console.log("RecintoLocationPicker - Recinto selected:", recinto);
    setCurrentSelectedRecinto(recinto);
    setSelectedPosition({ lat: recinto.latitud, lng: recinto.longitud });
    setActiveInfoWindow(recinto.id || 0);
  }, []);

  const handleConfirm = () => {
    if (currentSelectedRecinto) {
      // If a recinto is selected, use the recinto callback
      onRecintoSelect(currentSelectedRecinto);
      onClose();
    } else if (selectedPosition) {
      // If a custom position is selected, use the location callback
      onLocationSelect(selectedPosition.lat, selectedPosition.lng);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card p-6 rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-heading font-heading mb-4">
          Seleccionar Recinto o Ubicación
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Haz clic en un recinto (marcadores azules) para seleccionarlo, o haz
          clic en cualquier lugar del mapa para una ubicación personalizada
        </p>

        <div className="border border-input rounded-sm overflow-hidden mb-4">
          {loadError ? (
            <div className="p-8 text-center">
              <p className="text-destructive mb-4">
                Error al cargar Google Maps:
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {loadError.message}
              </p>
            </div>
          ) : !isLoaded ? (
            <div className="p-4 text-center">Cargando mapa...</div>
          ) : (
            <GoogleMap
              key={mapKey}
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={12}
              onLoad={() => {
                console.log(
                  "RecintoLocationPicker - Google Map loaded successfully"
                );
                // wait for markers to render before setting mapLoaded
                setTimeout(() => {
                  setMapLoaded(true);
                }, 200);
              }}
              onUnmount={() => {
                console.log("RecintoLocationPicker - Google Map unmounted");
                setMapLoaded(false);
                setMapKey((prev) => prev + 1); // Reset key to remount map
                setSelectedPosition(null); // Reset selected position on unmount
                setActiveInfoWindow(null); // Reset active info window
              }}
              options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: false,
              }}
            >
              {/* Recinto markers */}
              {mapLoaded &&
                recintos.map((recinto) => {
                  console.log(
                    "RecintoLocationPicker - Renderizando marker para recinto:",
                    {
                      id: recinto.id,
                      nombre: recinto.nombre,
                      latitud: recinto.latitud,
                      longitud: recinto.longitud,
                      seccion: recinto.seccion,
                    }
                  );
                  return (
                    <Marker
                      key={`recinto-${recinto.id}`}
                      position={{ lat: recinto.latitud, lng: recinto.longitud }}
                      onClick={() => handleRecintoClick(recinto)}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: new google.maps.Size(32, 32),
                      }}
                    >
                      {activeInfoWindow === recinto.id && (
                        <InfoWindow
                          onCloseClick={() => setActiveInfoWindow(null)}
                        >
                          <div className="p-2">
                            <h3 className="font-semibold text-sm">
                              {recinto.nombre}
                            </h3>
                            <p className="text-xs text-gray-600">
                              Lat: {recinto.latitud.toFixed(6)}
                              <br />
                              Lng: {recinto.longitud.toFixed(6)}
                            </p>
                            <p className="text-xs text-gray-600">
                              Sección:{" "}
                              {typeof recinto.seccion === "object"
                                ? recinto.seccion.nombre
                                : recinto.seccion}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  );
                })}
            </GoogleMap>
          )}
        </div>

        {/* Selection info */}
        {currentSelectedRecinto ? (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-sm mb-4">
            <p className="text-sm">
              <strong>Recinto seleccionado:</strong>{" "}
              {currentSelectedRecinto.nombre}
              <br />
              <strong>Coordenadas:</strong>{" "}
              {currentSelectedRecinto.latitud.toFixed(6)},{" "}
              {currentSelectedRecinto.longitud.toFixed(6)}
              <br />
              <strong>Sección:</strong>{" "}
              {typeof currentSelectedRecinto.seccion === "object"
                ? currentSelectedRecinto.seccion.nombre
                : currentSelectedRecinto.seccion}
            </p>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm mb-4">
            <p className="text-sm text-gray-600">
              Selecciona un recinto (marcador azul) o haz clic en el mapa para
              una ubicación personalizada
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-input rounded-sm hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition && !currentSelectedRecinto}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Selección
          </button>
        </div>
      </div>
    </div>
  );
};
