import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, MapPin, Loader2, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

const EMERGENCY = [
  { name: "Ambulance", number: "108", color: "text-red-400", bg: "bg-red-500/10" },
  { name: "Health Helpline", number: "104", color: "text-primary", bg: "bg-primary/10" },
  { name: "Mental Health iCall", number: "9152987821", color: "text-violet-400", bg: "bg-violet-500/10" },
];

interface Hospital { id: number; name: string; lat: number; lon: number; amenity: string; phone?: string; dist: number; }

async function fetchNearby(lat: number, lon: number): Promise<Hospital[]> {
  const q = `[out:json][timeout:20];(node["amenity"~"^(hospital|clinic|pharmacy|doctors)$"](around:5000,${lat},${lon}););out body;`;
  const r = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
  const d = await r.json();
  return (d.elements as Array<{ id: number; lat: number; lon: number; tags: Record<string, string> }>)
    .filter(e => e.tags?.name)
    .map(e => ({
      id: e.id, name: e.tags.name, lat: e.lat, lon: e.lon,
      amenity: e.tags.amenity, phone: e.tags.phone ?? e.tags["contact:phone"],
      dist: haversine(lat, lon, e.lat, e.lon),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 40);
}

function haversine(la1: number, lo1: number, la2: number, lo2: number) {
  const R = 6371, d2r = Math.PI / 180;
  const dLa = (la2 - la1) * d2r, dLo = (lo2 - lo1) * d2r;
  const a = Math.sin(dLa / 2) ** 2 + Math.cos(la1 * d2r) * Math.cos(la2 * d2r) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const AMENITY_ICON: Record<string, string> = { hospital: "🏥", clinic: "🩺", doctors: "🩺", pharmacy: "💊" };
const AMENITY_COLOR: Record<string, string> = { hospital: "#ef4444", clinic: "#3b82f6", doctors: "#8b5cf6", pharmacy: "#10b981" };

export default function HospitalFinder() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [phase, setPhase] = useState<"idle" | "locating" | "loading" | "ready" | "error">("idle");
  const [places, setPlaces] = useState<Hospital[]>([]);
  const [errMsg, setErrMsg] = useState("");
  const [filter, setFilter] = useState<"all" | "hospital" | "clinic" | "pharmacy">("all");

  const start = () => {
    setPhase("locating");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        setPhase("loading");
        try {
          const data = await fetchNearby(lat, lon);
          setPlaces(data);
          setPhase("ready");
          setTimeout(() => buildMap(lat, lon, data), 80);
        } catch { setErrMsg("Could not load hospital data. Try again."); setPhase("error"); }
      },
      () => { setErrMsg("Location access denied. Please allow it in your browser."); setPhase("error"); },
      { timeout: 12000 }
    );
  };

  const buildMap = async (lat: number, lon: number, data: Hospital[]) => {
    if (!mapEl.current) return;
    const L = (await import("leaflet")).default;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    const map = L.map(mapEl.current).setView([lat, lon], 14);
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);
    L.circleMarker([lat, lon], { radius: 10, fillColor: "#0d9488", color: "#fff", weight: 2, fillOpacity: 0.9 })
      .addTo(map).bindPopup("<b>📍 You are here</b>").openPopup();
    data.forEach(p => {
      const color = AMENITY_COLOR[p.amenity] ?? "#6b7280";
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:30px;height:30px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.35)">${AMENITY_ICON[p.amenity] ?? "🏨"}</div>`,
        iconSize: [30, 30], iconAnchor: [15, 15],
      });
      L.marker([p.lat, p.lon], { icon }).addTo(map)
        .bindPopup(`<b>${p.name}</b><br><span style="color:#888;font-size:11px">${p.amenity} · ${p.dist.toFixed(1)} km</span>${p.phone ? `<br>📞 ${p.phone}` : ""}`);
    });
  };

  useEffect(() => () => { mapRef.current?.remove(); }, []);

  const filtered = places.filter(p => filter === "all" || p.amenity === filter || (filter === "clinic" && p.amenity === "doctors"));

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
      <Link href="/"><span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Home</span></Link>

      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <span className="mono-label text-red-400/80 mb-1 block">Nearby Healthcare</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Hospital Finder</h1>
          <p className="text-sm text-muted-foreground mt-1">Hospitals, clinics &amp; pharmacies near you — free, no signup.</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 mb-5 grid grid-cols-3 gap-2">
        {EMERGENCY.map(e => (
          <a key={e.name} href={`tel:${e.number}`} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl ${e.bg} hover:opacity-80 transition-opacity`}>
            <Phone className={`w-4 h-4 ${e.color}`} />
            <span className={`text-sm font-700 tabular-nums ${e.color}`}>{e.number}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{e.name}</span>
          </a>
        ))}
      </div>

      {phase === "idle" && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="text-lg font-serif font-700 text-foreground mb-2">Find hospitals near you</p>
          <p className="text-sm text-muted-foreground mb-7 max-w-sm mx-auto">Shows hospitals, clinics &amp; pharmacies within 5 km using free OpenStreetMap data. No account needed.</p>
          <Button onClick={start} className="rounded-xl px-8"><MapPin className="w-4 h-4 mr-2" /> Allow Location &amp; Find</Button>
        </div>
      )}

      {(phase === "locating" || phase === "loading") && (
        <div className="glass-panel rounded-2xl p-14 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{phase === "locating" ? "Getting your location…" : "Loading nearby healthcare…"}</p>
        </div>
      )}

      {phase === "error" && (
        <div className="glass-panel rounded-2xl p-10 text-center border border-red-500/20">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-5">{errMsg}</p>
          <Button variant="outline" onClick={() => setPhase("idle")} className="rounded-xl">Try again</Button>
        </div>
      )}

      {phase === "ready" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div ref={mapEl} className="w-full h-[350px] rounded-2xl overflow-hidden border border-border/40" />

          <div className="flex gap-2 flex-wrap">
            {(["all", "hospital", "clinic", "pharmacy"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-700 border transition-all ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40"}`}>
                {f === "all" ? "All" : f === "hospital" ? "🏥 Hospitals" : f === "clinic" ? "🩺 Clinics" : "💊 Pharmacies"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.slice(0, 15).map(h => (
              <div key={h.id} className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{AMENITY_ICON[h.amenity] ?? "🏨"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-700 text-foreground truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{h.amenity} · {h.dist.toFixed(1)} km{h.phone ? ` · ${h.phone}` : ""}</p>
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-700 hover:bg-primary/20 transition-colors whitespace-nowrap">
                  Directions →
                </a>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No {filter !== "all" ? filter + "s" : "places"} found nearby.</p>}
          </div>
        </motion.div>
      )}
    </div>
  );
}
