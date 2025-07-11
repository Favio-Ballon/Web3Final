import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  isOpen: boolean;
  onClose: () => void;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Libraries array must be outside component to avoid re-renders
const libraries: ("marker" | "geometry")[] = ["marker", "geometry"];

// Coordenadas por defecto de bolivia
const defaultCenter = {
  lat: -17.819308,
  lng: -63.183015, // Adjusted to a more central point in Bolivia
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLat,
  initialLng,
  isOpen,
  onClose,
}) => {
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
    return isNaN(parsed) ? undefined : parsed;
  };

  const [mapKey, setMapKey] = useState(0);
  const [markerKey, setMarkerKey] = useState(0);

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

  const [mapCenter, setMapCenter] = useState({
    lat: parsedInitialLat || defaultCenter.lat,
    lng: parsedInitialLng || defaultCenter.lng,
  });

  // Update selected position when modal opens with new initial coordinates
  useEffect(() => {
    console.log("LocationPicker - useEffect triggered:", {
      isOpen,
      initialLat,
      initialLng,
      typeOfLat: typeof initialLat,
      typeOfLng: typeof initialLng,
    });

    if (isOpen) {
      const newParsedLat = parseCoordinate(initialLat);
      const newParsedLng = parseCoordinate(initialLng);

      console.log("LocationPicker - Parsed coordinates:", {
        newParsedLat,
        newParsedLng,
        validCoords: newParsedLat !== undefined && newParsedLng !== undefined,
      });

      if (newParsedLat !== undefined && newParsedLng !== undefined) {
        console.log("LocationPicker - Setting initial position:", {
          lat: newParsedLat,
          lng: newParsedLng,
        });
        const newPosition = { lat: newParsedLat, lng: newParsedLng };
        setSelectedPosition(newPosition);
        setMapCenter(newPosition);
        setMapKey((prev) => prev + 1);
        setMarkerKey((prev) => prev + 1);
      } else {
        console.log("LocationPicker - No valid coordinates, using defaults");
        setSelectedPosition(null);
        setMapCenter(defaultCenter);
      }
    }
  }, [isOpen, initialLat, initialLng]);

  // Additional effect to ensure marker is always updated when modal opens
  useEffect(() => {
    if (isOpen && selectedPosition) {
      console.log(
        "LocationPicker - Modal opened with existing position:",
        selectedPosition
      );
      setMapCenter({ ...selectedPosition });
    }
  }, [isOpen, selectedPosition]);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      // Redondear a 6 decimales para evitar valores extremadamente largos
      const roundedLat = Math.round(lat * 1000000) / 1000000;
      const roundedLng = Math.round(lng * 1000000) / 1000000;

      // Validate coordinate ranges
      if (roundedLat < -90 || roundedLat > 90) {
        alert("Latitud fuera de rango válido (-90 a 90)");
        return;
      }
      if (roundedLng < -180 || roundedLng > 180) {
        alert("Longitud fuera de rango válido (-180 a 180)");
        return;
      }

      console.log("LocationPicker - Coordinates selected:", {
        lat: roundedLat,
        lng: roundedLng,
      });

      setSelectedPosition({ lat: roundedLat, lng: roundedLng });
    }
  }, []);

  const handleConfirm = () => {
    if (selectedPosition) {
      onLocationSelect(selectedPosition.lat, selectedPosition.lng);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card p-6 rounded-sm max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-heading font-heading mb-4">
          Seleccionar Ubicación
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Haz clic en el mapa para seleccionar la ubicación exacta del votante
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
              <div className="space-y-2">
                <p className="text-sm">
                  Introduce las coordenadas manualmente:
                </p>
                <div className="flex gap-2 justify-center">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Latitud"
                    className="border rounded px-2 py-1 w-24"
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat)) {
                        setSelectedPosition((prev) => ({
                          lat,
                          lng: prev?.lng || -56.1645,
                        }));
                      }
                    }}
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Longitud"
                    className="border rounded px-2 py-1 w-24"
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      if (!isNaN(lng)) {
                        setSelectedPosition((prev) => ({
                          lat: prev?.lat || -34.9011,
                          lng,
                        }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ) : !isLoaded ? (
            <div className="p-4 text-center">Cargando mapa...</div>
          ) : (
            <GoogleMap
              key={mapKey}
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={13}
              onClick={onMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: true,
                fullscreenControl: false,
              }}
            >
              {selectedPosition && isLoaded && (
                <Marker
                  key={`marker-${markerKey}-${selectedPosition.lat}-${selectedPosition.lng}`}
                  position={selectedPosition}
                  draggable={true}
                  onDragEnd={(event: google.maps.MapMouseEvent) => {
                    if (event.latLng) {
                      const lat = event.latLng.lat();
                      const lng = event.latLng.lng();

                      // Redondear a 6 decimales para evitar valores extremadamente largos
                      const roundedLat = Math.round(lat * 1000000) / 1000000;
                      const roundedLng = Math.round(lng * 1000000) / 1000000;

                      // Validate coordinate ranges
                      if (roundedLat < -90 || roundedLat > 90) {
                        alert("Latitud fuera de rango válido (-90 a 90)");
                        return;
                      }
                      if (roundedLng < -180 || roundedLng > 180) {
                        alert("Longitud fuera de rango válido (-180 a 180)");
                        return;
                      }

                      console.log("LocationPicker - Marker dragged to:", {
                        lat: roundedLat,
                        lng: roundedLng,
                      });

                      setSelectedPosition({
                        lat: roundedLat,
                        lng: roundedLng,
                      });
                    }
                  }}
                />
              )}
            </GoogleMap>
          )}
        </div>

        {selectedPosition && (
          <div className="bg-muted p-3 rounded-sm mb-4">
            <p className="text-sm">
              <strong>Coordenadas seleccionadas:</strong>
              <br />
              Latitud: {selectedPosition.lat.toFixed(6)}
              <br />
              Longitud: {selectedPosition.lng.toFixed(6)}
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
            disabled={!selectedPosition}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Ubicación
          </button>
        </div>
      </div>
    </div>
  );
};
