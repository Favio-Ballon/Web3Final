import React, { useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface MultiPointPickerProps {
  isOpen: boolean;
  initialPoints?: Array<{ lat: number; lng: number }>;
  onClose: () => void;
  onSave: (points: Array<{ lat: number; lng: number }>) => void;
}

const containerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: -17.819308, lng: -63.183015 };

export const MultiPointPicker: React.FC<MultiPointPickerProps> = ({
    isOpen,
    initialPoints = [],
    onClose,
    onSave,
  }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const [points, setPoints] = useState(initialPoints);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng !== null) {
      setPoints((pts) => [
        ...pts,
        { lat: e.latLng!.lat(), lng: e.latLng!.lng() },
      ]);
    }
  }, []);

  const handleRemove = (idx: number) => {
    setPoints((pts) => pts.filter((_, i) => i !== idx));
  };

  const handleSave = () => onSave(points);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-full max-w-xl">
        <h2 className="mb-2 text-lg">Seleccionar Múltiples Puntos</h2>
        {loadError ? (
          <p>Error cargando mapa: {loadError.message}</p>
        ) : !isLoaded ? (
          <p>Cargando mapa…</p>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={points[0] || defaultCenter}
            zoom={points.length ? 13 : 6}
            onClick={onMapClick}
          >
            {points.map((p, i) => (
              <Marker key={i} position={p} onRightClick={() => handleRemove(i)} />
            ))}
          </GoogleMap>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 border rounded">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Guardar ({points.length})
          </button>
        </div>
      </div>
    </div>
  );
};
