import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatCityName } from '../utils/city.js';

function getMarkerColor(aqi) {
  if (aqi <= 50) return '#16a34a';
  if (aqi <= 100) return '#ca8a04';
  if (aqi <= 150) return '#ea580c';
  return '#dc2626';
}

function createIcon(color) {
  return new L.DivIcon({
    className: 'custom-marker',
    html: `<span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:9999px;background:${color};color:white;font-size:18px;line-height:1;border:3px solid #ffffff;box-shadow:0 0 0 2px rgba(16,185,129,0.35);">AQI</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38]
  });
}

function MapFlyTo({ location, markerRef }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;

    map.flyTo([location.lat, location.lon], 12);
    window.setTimeout(() => {
      markerRef.current?.openPopup();
    }, 250);
  }, [location, map, markerRef]);

  return null;
}

function getAqiStatus(aqi) {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  return 'Unhealthy';
}

function MapView({ airQuality, selectedCity }) {
  const markerRef = useRef(null);
  const hasMarker = Number.isFinite(airQuality?.lat) && Number.isFinite(airQuality?.lon);
  const mapCenter = hasMarker ? [airQuality.lat, airQuality.lon] : [22.0, 78.0];
  const mapZoom = hasMarker ? 12 : 5;
  const aqi = Number(airQuality?.aqi) || 0;
  const aqiStatus = getAqiStatus(aqi);
  const displayCityName = formatCityName(airQuality?.cityName || selectedCity);

  return (
    <div className="relative h-[250px] overflow-hidden rounded-3xl border border-slate-700 shadow-sm md:h-96">
      <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={false} className="h-full w-full">
        {hasMarker && <MapFlyTo location={airQuality} markerRef={markerRef} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasMarker && (
          <Marker
            position={[airQuality.lat, airQuality.lon]}
            icon={createIcon(getMarkerColor(aqi))}
            ref={markerRef}
          >
            <Popup>
              <div className="space-y-2 text-sm">
                <div className="text-base font-semibold text-slate-900">{displayCityName}</div>
                {airQuality.stationName && (
                  <div className="text-xs text-slate-500">Nearest station: {airQuality.stationName}</div>
                )}
                <div>AQI: {airQuality.aqi ?? 'N/A'}</div>
                <div>PM2.5: {airQuality.pm25 || 'N/A'} ug/m3</div>
                <div>PM10: {airQuality.pm10 || 'N/A'} ug/m3</div>
                <div>NO2: {airQuality.no2 || 'N/A'} ppb</div>
                <div className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${aqi <= 50 ? 'bg-green-100 text-green-800' : aqi <= 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {aqiStatus}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;
