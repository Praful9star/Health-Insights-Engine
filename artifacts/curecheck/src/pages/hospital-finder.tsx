import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageMeta from "@/components/page-meta";
import { Link } from "wouter";
import {
  ChevronLeft, MapPin, Loader2, AlertCircle, Phone,
  Navigation, Building2, FlaskConical, Clock, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

/* ─── HTML-escape helper (used in Leaflet innerHTML popups) ───────────── */
function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ─── Emergency contacts ──────────────────────────────────────────────── */
const EMERGENCY = [
  { name: "Ambulance", number: "108", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { name: "Health Helpline", number: "104", color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
  { name: "iCall Mental Health", number: "9152987821", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
];

/* ─── Types ───────────────────────────────────────────────────────────── */
interface Hospital {
  id: number;
  name: string;
  lat: number;
  lon: number;
  amenity: string;
  phone?: string;
  dist: number;
  openingHours?: string;
  operatorType?: string;
  operator?: string;
  website?: string;
}

type FilterKind = "all" | "hospital" | "clinic" | "pharmacy";
type FilterOwner = "all" | "government" | "private";
type Phase = "idle" | "locating" | "loading" | "ready" | "error";

/* ─── Overpass fetch ──────────────────────────────────────────────────── */
async function fetchNearby(lat: number, lon: number): Promise<Hospital[]> {
  const q = `[out:json][timeout:25];
(
  node["amenity"~"^(hospital|clinic|pharmacy|doctors)$"](around:5000,${lat},${lon});
  way["amenity"~"^(hospital|clinic|pharmacy|doctors)$"](around:5000,${lat},${lon});
);
out center tags;`;
  const r = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(q)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (!r.ok) throw new Error("Overpass API error");
  const d = await r.json();
  return (d.elements as Array<{
    id: number; lat?: number; lon?: number;
    center?: { lat: number; lon: number };
    tags: Record<string, string>;
  }>)
    .filter(e => e.tags?.name)
    .map(e => {
      const elat = e.lat ?? e.center?.lat ?? 0;
      const elon = e.lon ?? e.center?.lon ?? 0;
      const tags = e.tags;
      const rawOp = (tags["operator:type"] ?? "").toLowerCase();
      const operatorType =
        rawOp === "government" || rawOp === "public" || rawOp === "ngo"
          ? "government"
          : rawOp === "private"
          ? "private"
          : undefined;
      return {
        id: e.id,
        name: tags.name,
        lat: elat,
        lon: elon,
        amenity: tags.amenity,
        phone: tags.phone ?? tags["contact:phone"],
        dist: haversine(lat, lon, elat, elon),
        openingHours: tags.opening_hours,
        operatorType,
        operator: tags.operator,
        website: tags.website ?? tags["contact:website"],
      };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 60);
}

function haversine(la1: number, lo1: number, la2: number, lo2: number) {
  const R = 6371, d2r = Math.PI / 180;
  const dLa = (la2 - la1) * d2r, dLo = (lo2 - lo1) * d2r;
  const a =
    Math.sin(dLa / 2) ** 2 +
    Math.cos(la1 * d2r) * Math.cos(la2 * d2r) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const AMENITY_ICON: Record<string, string> = {
  hospital: "🏥", clinic: "🩺", doctors: "🩺", pharmacy: "💊",
};
const AMENITY_COLOR: Record<string, string> = {
  hospital: "#ef4444", clinic: "#3b82f6", doctors: "#8b5cf6", pharmacy: "#10b981",
};
const AMENITY_LABEL: Record<string, string> = {
  hospital: "Hospital", clinic: "Clinic", doctors: "Clinic", pharmacy: "Pharmacy",
};

/** Very lightweight opening_hours parser — handles "24/7" and common ranges */
function parseOpenStatus(oh?: string): { label: string; isOpen: boolean | null } {
  if (!oh) return { label: "Hours unknown", isOpen: null };
  const s = oh.trim();
  if (s === "24/7") return { label: "Open 24/7", isOpen: true };
  const now = new Date();
  const day = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][now.getDay()];
  const hm = now.getHours() * 60 + now.getMinutes();
  // Try to match time ranges like "09:00-21:00"
  const timeRange = s.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
  if (timeRange) {
    const open = parseInt(timeRange[1]) * 60 + parseInt(timeRange[2]);
    const close = parseInt(timeRange[3]) * 60 + parseInt(timeRange[4]);
    const isOpen = hm >= open && hm < close;
    return {
      label: `${timeRange[1]}:${timeRange[2]}–${timeRange[3]}:${timeRange[4]}`,
      isOpen,
    };
  }
  // Check if today is in range like "Mo-Sa"
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const todayIdx = dayNames.indexOf(day);
  const rangeMatch = s.match(/([A-Z][a-z])-([A-Z][a-z])/);
  if (rangeMatch) {
    const from = dayNames.indexOf(rangeMatch[1]);
    const to = dayNames.indexOf(rangeMatch[2]);
    const inRange = from <= to
      ? todayIdx >= from && todayIdx <= to
      : todayIdx >= from || todayIdx <= to;
    return { label: oh, isOpen: inRange ? null : false };
  }
  return { label: oh.length > 30 ? oh.slice(0, 28) + "…" : oh, isOpen: null };
}

function OpenBadge({ oh }: { oh?: string }) {
  const { label, isOpen } = parseOpenStatus(oh);
  if (!oh) {
    return (
      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Hours unknown
      </span>
    );
  }
  return (
    <span className={`text-[10px] flex items-center gap-1 font-600 ${isOpen === true ? "text-green-400" : isOpen === false ? "text-red-400" : "text-muted-foreground"}`}>
      <Clock className="w-3 h-3 flex-shrink-0" />
      {label}
    </span>
  );
}

function OwnerBadge({ operatorType }: { operatorType?: string }) {
  if (operatorType === "government") {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-700">Govt.</span>;
  }
  if (operatorType === "private") {
    return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 font-700">Private</span>;
  }
  return null;
}

function applyFilters(data: Hospital[], kind: FilterKind, owner: FilterOwner): Hospital[] {
  return data.filter(p => {
    const kindOk =
      kind === "all" ||
      p.amenity === kind ||
      (kind === "clinic" && p.amenity === "doctors");
    const ownerOk = owner === "all" || p.operatorType === owner;
    return kindOk && ownerOk;
  });
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function HospitalFinder() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [places, setPlaces] = useState<Hospital[]>([]);
  const [errMsg, setErrMsg] = useState("");
  const [filterKind, setFilterKind] = useState<FilterKind>("all");
  const [filterOwner, setFilterOwner] = useState<FilterOwner>("all");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Refs so buildMap/start always read the latest filter values without needing
  // to be recreated on every filter change (avoids stale closure issues).
  const filterKindRef = useRef<FilterKind>("all");
  const filterOwnerRef = useRef<FilterOwner>("all");
  filterKindRef.current = filterKind;
  filterOwnerRef.current = filterOwner;

  const buildMap = useCallback(async (lat: number, lon: number, data: Hospital[]) => {
    if (!mapEl.current) return;
    const L = (await import("leaflet")).default;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    const map = L.map(mapEl.current, { zoomControl: true }).setView([lat, lon], 14);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      className: "",
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#0d9488;border:3px solid #fff;box-shadow:0 0 0 4px rgba(13,148,136,.25)"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    L.marker([lat, lon], { icon: userIcon }).addTo(map).bindPopup("<b>📍 You are here</b>");

    // Hospital markers — all OSM field values are escaped before HTML injection
    data.forEach(p => {
      const color = AMENITY_COLOR[p.amenity] ?? "#6b7280";
      const emoji = AMENITY_ICON[p.amenity] ?? "🏨";
      const { label: ohLabel, isOpen } = parseOpenStatus(p.openingHours);

      const safeName = escHtml(p.name);
      const safePhone = p.phone ? escHtml(p.phone) : null;
      const safeOhLabel = p.openingHours ? escHtml(ohLabel) : null;
      const safeLat = encodeURIComponent(String(p.lat));
      const safeLon = encodeURIComponent(String(p.lon));
      const safeType = escHtml(AMENITY_LABEL[p.amenity] ?? p.amenity);
      const safeDist = escHtml(p.dist.toFixed(1));

      const openDot =
        isOpen === true
          ? `<span style="color:#4ade80;font-size:10px">● Open</span>`
          : isOpen === false
          ? `<span style="color:#f87171;font-size:10px">● Closed</span>`
          : "";

      const ownerTag =
        p.operatorType === "government"
          ? `<span style="background:#92400e22;color:#fbbf24;font-size:10px;padding:1px 5px;border-radius:4px;margin-left:4px">Govt.</span>`
          : p.operatorType === "private"
          ? `<span style="background:#1e3a8a22;color:#93c5fd;font-size:10px;padding:1px 5px;border-radius:4px;margin-left:4px">Private</span>`
          : "";

      const popup = `
        <div style="font-family:system-ui,sans-serif;min-width:170px">
          <b style="font-size:13px">${safeName}</b>${ownerTag}
          <div style="color:#9ca3af;font-size:11px;margin:2px 0">${safeType} · ${safeDist} km away</div>
          ${safePhone ? `<div style="font-size:11px;margin:2px 0">📞 ${safePhone}</div>` : ""}
          ${safeOhLabel ? `<div style="font-size:11px;margin:2px 0">🕐 ${safeOhLabel} ${openDot}</div>` : openDot}
          <a href="https://www.google.com/maps/dir/?api=1&amp;destination=${safeLat},${safeLon}"
            target="_blank" rel="noopener noreferrer"
            style="display:inline-block;margin-top:6px;padding:4px 10px;background:#0d9488;color:#fff;border-radius:6px;font-size:11px;text-decoration:none;font-weight:600">
            Get Directions →
          </a>
        </div>`;

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 10px rgba(0,0,0,.4);cursor:pointer">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([p.lat, p.lon], { icon }).addTo(map).bindPopup(popup);
    });
  }, []);

  const start = useCallback(() => {
    setPhase("locating");
    setPlaces([]);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lon } }) => {
        setPhase("loading");
        setCoords({ lat, lon });
        try {
          const data = await fetchNearby(lat, lon);
          setPlaces(data);
          setPhase("ready");
          // Apply current filters when building the map so list and markers stay in sync
          const visible = applyFilters(data, filterKindRef.current, filterOwnerRef.current);
          setTimeout(() => buildMap(lat, lon, visible), 80);
        } catch {
          setErrMsg("Could not load hospital data. The map service may be temporarily busy — try again.");
          setPhase("error");
        }
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location access denied. Please allow it in your browser settings and try again."
            : err.code === 3
            ? "Location request timed out. Please try again."
            : "Could not determine your location. Try again.";
        setErrMsg(msg);
        setPhase("error");
      },
      { timeout: 15000, maximumAge: 60000 }
    );
  }, [buildMap]);

  // Rebuild map whenever filters change while results are shown
  useEffect(() => {
    if (phase === "ready" && coords && places.length) {
      const visible = applyFilters(places, filterKind, filterOwner);
      void buildMap(coords.lat, coords.lon, visible);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKind, filterOwner]);

  useEffect(() => () => { mapRef.current?.remove(); }, []);

  const filtered = applyFilters(places, filterKind, filterOwner);
  const govCount = places.filter(p => p.operatorType === "government").length;
  const privCount = places.filter(p => p.operatorType === "private").length;

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
      <PageMeta
        title="Hospital Finder — Find Hospitals Near You in India"
        description="Find hospitals, clinics, and healthcare centres near you across India with ratings, specialties, and contact details. Uses your location."
        path="/hospitals"
      />
      {/* Back */}
      <Link href="/">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 cursor-pointer">
          <ChevronLeft className="w-4 h-4" /> Home
        </span>
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <span className="mono-label text-red-400/80 mb-1 block">Nearby Healthcare</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-800 text-foreground">Hospital Finder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real hospitals, clinics &amp; pharmacies within 5 km — powered by OpenStreetMap. No signup needed.
          </p>
        </div>
      </div>

      {/* Emergency numbers */}
      <div className="glass-panel rounded-2xl p-4 mb-6 grid grid-cols-3 gap-2">
        {EMERGENCY.map(e => (
          <a
            key={e.name}
            href={`tel:${e.number}`}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${e.bg} hover:opacity-80 transition-opacity`}
          >
            <Phone className={`w-4 h-4 ${e.color}`} />
            <span className={`text-sm font-700 tabular-nums ${e.color}`}>{e.number}</span>
            <span className="text-[10px] text-muted-foreground text-center leading-tight">{e.name}</span>
          </a>
        ))}
      </div>

      {/* Idle */}
      {phase === "idle" && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-14 text-center"
        >
          <p className="text-5xl mb-4">🗺️</p>
          <p className="text-lg font-serif font-700 text-foreground mb-2">Find hospitals near you</p>
          <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
            Shows hospitals, clinics &amp; pharmacies within 5 km using free OpenStreetMap data.
            Includes Government vs. Private distinction and open/closed status where available.
          </p>
          <Button onClick={start} className="rounded-xl px-8">
            <Navigation className="w-4 h-4 mr-2" /> Allow Location &amp; Find
          </Button>
        </motion.div>
      )}

      {/* Loading */}
      <AnimatePresence>
        {(phase === "locating" || phase === "loading") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel rounded-2xl p-14 text-center"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {phase === "locating" ? "Getting your location…" : "Loading nearby healthcare from OpenStreetMap…"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {phase === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel rounded-2xl p-10 text-center border border-red-500/20"
        >
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">{errMsg}</p>
          <Button variant="outline" onClick={() => setPhase("idle")} className="rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" /> Try again
          </Button>
        </motion.div>
      )}

      {/* Ready */}
      {phase === "ready" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Map */}
          <div
            ref={mapEl}
            className="w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-border/40 shadow-lg"
          />

          {/* Stats bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-700">{filtered.length}</span> places found
              {govCount > 0 && <span className="ml-2 text-amber-400">· {govCount} Govt.</span>}
              {privCount > 0 && <span className="ml-2 text-blue-400">· {privCount} Private</span>}
            </p>
            <button
              onClick={start}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {/* Kind filters */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "hospital", "clinic", "pharmacy"] as FilterKind[]).map(f => (
              <button
                key={f}
                onClick={() => setFilterKind(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-700 border transition-all ${
                  filterKind === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40"
                }`}
              >
                {f === "all" ? "All" : f === "hospital" ? "🏥 Hospitals" : f === "clinic" ? "🩺 Clinics" : "💊 Pharmacies"}
              </button>
            ))}
          </div>

          {/* Owner filters */}
          <div className="flex gap-2 flex-wrap">
            {([
              { key: "all" as FilterOwner, label: "Any Ownership", icon: null },
              { key: "government" as FilterOwner, label: "Government", icon: <Building2 className="w-3 h-3" /> },
              { key: "private" as FilterOwner, label: "Private", icon: <FlaskConical className="w-3 h-3" /> },
            ]).map(f => (
              <button
                key={f.key}
                onClick={() => setFilterOwner(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-700 border transition-all flex items-center gap-1.5 ${
                  filterOwner === f.key
                    ? f.key === "government"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : f.key === "private"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:border-primary/40"
                }`}
              >
                {f.icon}{f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {filtered.slice(0, 20).map(h => (
              <motion.div
                key={h.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 border border-transparent hover:border-border/60 transition-colors"
              >
                <span className="text-xl flex-shrink-0">{AMENITY_ICON[h.amenity] ?? "🏨"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-700 text-foreground truncate">{h.name}</p>
                    <OwnerBadge operatorType={h.operatorType} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground capitalize">
                      {AMENITY_LABEL[h.amenity] ?? h.amenity} · {h.dist.toFixed(1)} km
                    </span>
                    {h.phone && (
                      <span className="text-xs text-muted-foreground">· {h.phone}</span>
                    )}
                  </div>
                  <div className="mt-0.5">
                    <OpenBadge oh={h.openingHours} />
                  </div>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(String(h.lat))},${encodeURIComponent(String(h.lon))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-700 hover:bg-primary/20 transition-colors whitespace-nowrap"
                >
                  <Navigation className="w-3 h-3" />
                  Directions
                </a>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-10">
                No {filterKind !== "all" ? filterKind + "s" : "places"} found nearby with the selected filters.
              </p>
            )}
            {filtered.length > 20 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Showing top 20 of {filtered.length} results
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="glass-panel rounded-xl p-4 text-xs text-muted-foreground">
            <p className="font-700 text-foreground mb-2">Map legend</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {(["hospital", "clinic", "pharmacy"] as const).map(k => (
                <span key={k} className="flex items-center gap-1">
                  {AMENITY_ICON[k]} <span className="capitalize">{AMENITY_LABEL[k]}</span>
                </span>
              ))}
              <span className="flex items-center gap-1">📍 Your location</span>
            </div>
            <p className="mt-2 text-[11px]">
              Data from{" "}
              <a
                href="https://openstreetmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                OpenStreetMap
              </a>.
              Government/Private labels shown where tagged by the community. Not all hospitals are tagged.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
