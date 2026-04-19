import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { useNavigate } from "react-router-dom";

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// UC Berkeley campus center as default fallback.
const DEFAULT_CENTER = [37.8719, -122.2585];
const DEFAULT_ZOOM = 16;

export default function MapView({ spots }) {
  const navigate = useNavigate();
  const withCoords = spots.filter(
    (s) => typeof s.lat === "number" && typeof s.lng === "number",
  );
  const center = withCoords.length > 0 ? [withCoords[0].lat, withCoords[0].lng] : DEFAULT_CENTER;

  return (
    <div className="w-full h-[60vh] rounded-2xl overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((spot) => (
          <Marker key={spot.id} position={[spot.lat, spot.lng]}>
            <Popup>
              <div style={{ fontFamily: "'Jost', sans-serif" }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{spot.name}</p>
                {spot.hours && (
                  <p style={{ fontSize: 12, color: "#5C4033" }}>{spot.hours}</p>
                )}
                <button
                  onClick={() => navigate(`/study-spots/${spot.id}`)}
                  style={{
                    marginTop: 6,
                    padding: "4px 10px",
                    background: "#fcd34d",
                    borderRadius: 10,
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  View
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {withCoords.length === 0 && (
        <p
          className="text-xs text-[#5C4033] text-center mt-2"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          No spots have coordinates yet.
        </p>
      )}
    </div>
  );
}
