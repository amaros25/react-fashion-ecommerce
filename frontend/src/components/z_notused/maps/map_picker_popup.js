import React, { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ⚠️ Leaflet Default Icon Fix für React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function MapPickerPopup({ initialPosition, onClose }) {
  const [markerPosition, setMarkerPosition] = useState(initialPosition);

  const handleConfirm = () => {
    onClose(markerPosition); // liefert ausgewählte Position
  };

  const handleCancel = () => {
    onClose(null); // abgebrochen
  };

  return (
    <div className="map-popup-overlay">
      <div className="map-popup">
        <h3>Ziehe den Marker auf deine genaue Position</h3>
        <MapContainer
          center={markerPosition}
          zoom={16}
          style={{ height: "300px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            position={markerPosition}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                setMarkerPosition([
                  marker.getLatLng().lat,
                  marker.getLatLng().lng,
                ]);
              },
            }}
          />
        </MapContainer>
        <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
          <button onClick={handleConfirm}>✅ Bestätigen</button>
          <button onClick={handleCancel}>❌ Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

export default MapPickerPopup;
