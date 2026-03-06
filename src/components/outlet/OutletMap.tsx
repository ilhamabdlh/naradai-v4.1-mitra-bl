import React, { useState, useEffect } from "react";
import { Map as MapIcon, AlertCircle } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

export interface OutletData {
  id: string;
  name: string;
  region: string;
  city: string;
  lat: number;
  lng: number;
  status: "critical" | "warning" | "good";
  satisfaction: number;
  reviews: number;
  issues: string[];
}

export const OUTLETS: OutletData[] = [
  { id: "o1",  name: "Jakarta Flagship",    region: "DKI Jakarta",   city: "Jakarta",    lat: -6.2088,  lng: 106.8456, status: "critical", satisfaction: 2.6, reviews: 4820, issues: ["Long wait times", "Staff attitude", "Overcrowding"] },
  { id: "o2",  name: "Jakarta Selatan",     region: "DKI Jakarta",   city: "Jakarta",    lat: -6.2615,  lng: 106.8106, status: "warning",  satisfaction: 3.2, reviews: 2140, issues: ["Parking difficulty", "Limited seating"] },
  { id: "o3",  name: "Bogor Sudirman",      region: "West Java",     city: "Bogor",      lat: -6.5971,  lng: 106.8060, status: "good",     satisfaction: 4.1, reviews: 1380, issues: [] },
  { id: "o4",  name: "Bandung Dago",        region: "West Java",     city: "Bandung",    lat: -6.8783,  lng: 107.6100, status: "good",     satisfaction: 4.6, reviews: 3100, issues: [] },
  { id: "o5",  name: "Bandung Buah Batu",   region: "West Java",     city: "Bandung",    lat: -6.9520,  lng: 107.6450, status: "warning",  satisfaction: 3.4, reviews: 980,  issues: ["Product availability", "Wait times"] },
  { id: "o6",  name: "Surabaya East",       region: "East Java",     city: "Surabaya",   lat: -7.2504,  lng: 112.7688, status: "warning",  satisfaction: 3.1, reviews: 2620, issues: ["Stock-outs", "Inconsistent quality"] },
  { id: "o7",  name: "Surabaya North",      region: "East Java",     city: "Surabaya",   lat: -7.2021,  lng: 112.7363, status: "good",     satisfaction: 3.9, reviews: 1450, issues: [] },
  { id: "o8",  name: "Malang Kota",         region: "East Java",     city: "Malang",     lat: -7.9797,  lng: 112.6304, status: "good",     satisfaction: 4.2, reviews: 870,  issues: [] },
  { id: "o9",  name: "Medan Central",       region: "North Sumatra", city: "Medan",      lat: 3.5952,   lng: 98.6722,  status: "critical", satisfaction: 2.4, reviews: 3340, issues: ["Overpricing", "Cleanliness", "Poor service"] },
  { id: "o10", name: "Medan Helvetia",      region: "North Sumatra", city: "Medan",      lat: 3.6185,   lng: 98.6318,  status: "warning",  satisfaction: 3.0, reviews: 920,  issues: ["Limited menu", "Parking"] },
  { id: "o11", name: "Palembang Ilir",      region: "South Sumatra", city: "Palembang",  lat: -2.9761,  lng: 104.7754, status: "good",     satisfaction: 4.0, reviews: 760,  issues: [] },
  { id: "o12", name: "Makassar Panakkukang",region: "South Sulawesi",city: "Makassar",   lat: -5.1477,  lng: 119.4327, status: "warning",  satisfaction: 3.3, reviews: 1140, issues: ["Delivery delays", "Temperature issues"] },
  { id: "o13", name: "Makassar Tanjung",    region: "South Sulawesi",city: "Makassar",   lat: -5.1356,  lng: 119.4066, status: "good",     satisfaction: 3.8, reviews: 680,  issues: [] },
  { id: "o14", name: "Semarang Simpang",    region: "Central Java",  city: "Semarang",   lat: -6.9932,  lng: 110.4203, status: "good",     satisfaction: 4.1, reviews: 1020, issues: [] },
  { id: "o15", name: "Yogyakarta Malioboro",region: "DIY",           city: "Yogyakarta", lat: -7.7956,  lng: 110.3695, status: "good",     satisfaction: 4.4, reviews: 2200, issues: [] },
  { id: "o16", name: "Denpasar Kuta",       region: "Bali",          city: "Denpasar",   lat: -8.7190,  lng: 115.1700, status: "good",     satisfaction: 4.3, reviews: 2840, issues: [] },
  { id: "o17", name: "Denpasar Sanur",      region: "Bali",          city: "Denpasar",   lat: -8.7034,  lng: 115.2607, status: "warning",  satisfaction: 3.5, reviews: 1120, issues: ["Tourist pricing complaints"] },
  { id: "o18", name: "Balikpapan Centre",   region: "East Kalimantan",city: "Balikpapan",lat: -1.2675,  lng: 116.8289, status: "critical", satisfaction: 2.8, reviews: 1460, issues: ["Staff shortage", "Supply chain delays"] },
];

function getStatusColor(status: string) {
  switch (status) {
    case "critical": return { bg: "#ef4444", border: "#b91c1c" };
    case "warning":  return { bg: "#f59e0b", border: "#d97706" };
    case "good":     return { bg: "#10b981", border: "#059669" };
    default:         return { bg: "#64748b", border: "#475569" };
  }
}

const MAP_HEIGHT = 560;
const INDONESIA_CENTER: [number, number] = [-2.5, 118];

function OutletMapLeaflet({ outlets }: { outlets: OutletData[] }) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ outlets: OutletData[] }> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([import("react-leaflet"), import("leaflet")])
      .then(([RL, LeafletModule]) => {
        const { MapContainer, TileLayer, Marker, Popup } = RL;
        const L = (LeafletModule as { default?: typeof import("leaflet") }).default ?? LeafletModule;
        if (L?.Icon?.Default) {
          delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });
        }

        const StatusMarker = ({ outlet }: { outlet: OutletData }) => {
          const c = getStatusColor(outlet.status);
          const icon = L.divIcon({
            className: "outlet-marker",
            html: `<div style="width:22px;height:22px;border-radius:50%;background:${c.bg};border:3px solid ${c.border};box-shadow:0 2px 8px rgba(0,0,0,0.28);cursor:pointer;"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });
          return (
            <Marker position={[outlet.lat, outlet.lng]} icon={icon}>
              <Popup>
                <div className="min-w-[210px] p-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{outlet.city}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${outlet.status === "critical" ? "bg-red-100 text-red-600" : outlet.status === "warning" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"}`}>
                      {outlet.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{outlet.name}</h4>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${outlet.status === "critical" ? "bg-red-500" : outlet.status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${(outlet.satisfaction / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{outlet.satisfaction.toFixed(1)}/5</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{outlet.reviews.toLocaleString()} reviews</p>
                  {outlet.issues.length > 0 && (
                    <ul className="space-y-1">
                      {outlet.issues.map((issue, i) => (
                        <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        };

        const Inner = ({ outlets: out }: { outlets: OutletData[] }) => (
          <MapContainer
            center={INDONESIA_CENTER}
            zoom={5}
            style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {out.map((outlet) => (
              <StatusMarker key={outlet.id} outlet={outlet} />
            ))}
          </MapContainer>
        );

        setMapComponent(() => Inner);
      })
      .catch((err) => {
        setLoadError(err?.message ?? "Failed to load map.");
      });
  }, []);

  if (loadError) {
    return (
      <div className="w-full rounded-xl bg-slate-100 flex flex-col items-center justify-center gap-2" style={{ height: MAP_HEIGHT }}>
        <p className="text-slate-600 font-medium">Map unavailable</p>
        <p className="text-xs text-slate-500 max-w-sm text-center">{loadError}</p>
      </div>
    );
  }
  if (!MapComponent) {
    return (
      <div className="w-full rounded-xl bg-slate-100 flex items-center justify-center" style={{ height: MAP_HEIGHT }}>
        <p className="text-slate-500 font-medium">Loading map…</p>
      </div>
    );
  }
  return (
    <div className="w-full rounded-xl overflow-hidden z-0" style={{ height: MAP_HEIGHT }}>
      <MapComponent outlets={outlets} />
    </div>
  );
}

export function OutletMap() {
  const content = useDashboardContent();
  const outletMapData = content?.outletMapData ?? defaultDashboardContent.outletMapData ?? [];
  // Merge with OUTLETS to keep backward compatibility — prefer context data
  const outlets: OutletData[] = outletMapData.length > 0
    ? outletMapData.map((o) => ({
        id: o.id,
        name: o.name,
        region: o.region,
        city: o.city,
        lat: o.lat,
        lng: o.lng,
        status: o.status,
        satisfaction: o.satisfaction,
        reviews: o.reviews,
        issues: o.issues,
      }))
    : OUTLETS;

  const critical = outlets.filter((o) => o.status === "critical");
  const warning  = outlets.filter((o) => o.status === "warning");
  const good     = outlets.filter((o) => o.status === "good");

  return (
    <div id="outlet-map" className="space-y-5" style={{ isolation: "isolate", position: "relative", zIndex: 0 }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <MapIcon className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Geographical Map</h2>
          <p className="text-sm text-slate-500">Outlet locations and performance status across Indonesia</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5" style={{ isolation: "isolate" }}>
        {/* Map */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative overflow-hidden" style={{ isolation: "isolate" }}>
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="relative z-0" style={{ height: MAP_HEIGHT }}>
            <OutletMapLeaflet outlets={outlets} />
          </div>
          {/* Legend */}
          <div className="absolute bottom-7 left-7 z-[1000]">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 shadow-lg flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Critical ({critical.length})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Warning ({warning.length})</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Good ({good.length})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Critical alerts panel */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-900/20 flex flex-col">
          <div className="flex items-center gap-2 mb-5 opacity-70">
            <AlertCircle className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Alerts ({critical.length + warning.length})
            </span>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto pr-1">
            {[...critical, ...warning].length === 0 ? (
              <p className="text-xs text-slate-500 text-center mt-4">Tidak ada alert saat ini.</p>
            ) : (
              [...critical, ...warning].map((outlet) => {
                const isCritical = outlet.status === "critical";
                const accent     = isCritical ? "text-red-400"   : "text-amber-400";
                const badge      = isCritical
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/30";
                const statusLabel = isCritical ? "Critical" : "Warning";
                return (
                  <div key={outlet.id} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className={`text-sm font-bold transition-colors leading-tight ${accent}`}>{outlet.name}</h3>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase whitespace-nowrap ml-2 ${badge}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{outlet.city} · {outlet.region}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Satisfaction</p>
                        <p className={`text-sm font-bold ${accent}`}>{outlet.satisfaction.toFixed(2)}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Reviews</p>
                        <p className="text-sm font-bold text-slate-300">{outlet.reviews.toLocaleString()}</p>
                      </div>
                    </div>
                    {outlet.issues.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {outlet.issues.map((issue, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-medium border border-white/5">
                            {issue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <button className="w-full mt-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98]">
            View All Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
