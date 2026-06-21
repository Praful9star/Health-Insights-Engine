import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Wind, Droplets, Thermometer, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { useLocationConsent } from "@/hooks/use-location-consent";
import { LocationConsentModal } from "@/components/location-consent-modal";

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  code: number;
  aqi: number | null;
}

function wmoLabel(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function wmoIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌩️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

function aqiLabel(aqi: number): { label: string; color: string } {
  if (aqi <= 20) return { label: "Good", color: "text-emerald-400" };
  if (aqi <= 40) return { label: "Fair", color: "text-lime-400" };
  if (aqi <= 60) return { label: "Moderate", color: "text-yellow-400" };
  if (aqi <= 80) return { label: "Poor", color: "text-orange-400" };
  if (aqi <= 100) return { label: "Very Poor", color: "text-red-400" };
  return { label: "Hazardous", color: "text-rose-500" };
}

function getHealthTip(w: WeatherData): string {
  if (w.aqi !== null && w.aqi > 80) return "Air quality is poor today. Wear a mask outdoors and avoid strenuous exercise outside.";
  if (w.temp >= 38) return "Heat alert — stay hydrated, drink water every 30 minutes and avoid direct sun between 11am–4pm.";
  if (w.temp <= 10) return "Cold weather — stay warm, drink warm fluids, and wash hands frequently to avoid seasonal infections.";
  if (w.humidity >= 80 && w.temp >= 30) return "High heat and humidity can cause heat exhaustion. Rest often, drink ORS if sweating heavily.";
  if (w.code >= 80 && w.code <= 82) return "Heavy showers today — avoid waterlogged areas and watch for mosquito breeding post-rain.";
  if (w.code >= 95) return "Thunderstorm warning — stay indoors and away from windows. Avoid flooded roads.";
  if (w.code >= 51 && w.code <= 65) return "Rainy weather — good day to stay indoors, drink warm ginger tea, and check your vitamin D levels.";
  if (w.aqi !== null && w.aqi <= 20 && w.temp >= 18 && w.temp <= 32) return "Great air quality and weather — ideal day for outdoor exercise and a morning walk.";
  return "Stay hydrated, take your medicines on time, and enjoy the day.";
}

export default function WeatherWidget() {
  const { consent, grant, deny } = useLocationConsent();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);

  const fetchWeather = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const [weatherRes, aqiRes, geoRes] = await Promise.allSettled([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
            ),
            fetch(
              `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            ),
          ]);

          let city = "Your Location";
          if (geoRes.status === "fulfilled" && geoRes.value.ok) {
            const geo = await geoRes.value.json();
            city = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your Location";
          }

          if (weatherRes.status !== "fulfilled" || !weatherRes.value.ok) throw new Error("Weather fetch failed");
          const wd = await weatherRes.value.json();
          const c = wd.current;

          let aqi: number | null = null;
          if (aqiRes.status === "fulfilled" && aqiRes.value.ok) {
            const aqiData = await aqiRes.value.json();
            aqi = aqiData.current?.european_aqi ?? null;
          }

          setWeather({
            city,
            temp: Math.round(c.temperature_2m),
            feelsLike: Math.round(c.apparent_temperature),
            humidity: c.relative_humidity_2m,
            windSpeed: Math.round(c.wind_speed_10m),
            code: c.weather_code,
            aqi,
          });
        } catch {
          setError("Could not load weather data");
        }
        setLoading(false);
      },
      () => {
        setError("Location permission denied");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  // Only auto-fetch if user has already granted consent
  useEffect(() => {
    if (consent === "granted") {
      fetchWeather();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAllow = () => {
    grant();
    setConsentModalOpen(false);
    fetchWeather();
  };

  const handleDeny = () => {
    deny();
    setConsentModalOpen(false);
  };

  // ── Consent not yet given — show a prompt card ───────────────────────────
  if (consent === null) {
    return (
      <>
        <LocationConsentModal
          open={consentModalOpen}
          onAllow={handleAllow}
          onDeny={handleDeny}
        />
        <button
          onClick={() => setConsentModalOpen(true)}
          className="glass-panel rounded-2xl p-4 flex items-center gap-3 w-full text-left hover:border-primary/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-600 text-foreground">See local weather &amp; AQI</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tap to enable · location never stored</p>
          </div>
          <span className="text-xs font-600 text-primary bg-primary/10 px-2.5 py-1 rounded-full flex-shrink-0">Enable</span>
        </button>
      </>
    );
  }

  // ── Consent denied — show a placeholder linking to the weather page ───────
  if (consent === "denied") {
    return (
      <Link href="/weather">
        <div className="glass-panel rounded-2xl p-4 flex items-center gap-3 w-full text-left hover:border-primary/30 transition-colors cursor-pointer">
          <span className="text-2xl">🌤️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-600 text-foreground">Weather &amp; Health Tips</p>
            <p className="text-xs text-muted-foreground mt-0.5">Open to search by city name</p>
          </div>
        </div>
      </Link>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl p-4 flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-muted/40" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-muted/40 rounded w-24" />
          <div className="h-3 bg-muted/40 rounded w-40" />
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !weather) {
    return (
      <button
        onClick={fetchWeather}
        className="glass-panel rounded-2xl p-4 flex items-center gap-3 w-full text-left hover:border-primary/30 transition-colors"
      >
        <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground">{error || "Weather unavailable"}</span>
        <RefreshCw className="w-4 h-4 text-muted-foreground ml-auto" />
      </button>
    );
  }

  // ── Weather card ──────────────────────────────────────────────────────────
  const aqiInfo = weather.aqi !== null ? aqiLabel(weather.aqi) : null;
  const tip = getHealthTip(weather);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      <Link href="/weather">
        <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{wmoIcon(weather.code)}</span>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{weather.city}</span>
                </div>
                <div className="text-2xl font-bold text-foreground leading-none">
                  {weather.temp}°C
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{wmoLabel(weather.code)} · Feels {weather.feelsLike}°C</div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                <Droplets className="w-3 h-3 text-sky-400" />
                <span>{weather.humidity}%</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                <Wind className="w-3 h-3 text-teal-400" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              {aqiInfo && (
                <div className="flex items-center gap-1 text-xs justify-end">
                  <Thermometer className="w-3 h-3 text-orange-400" />
                  <span className={aqiInfo.color}>AQI {weather.aqi} · {aqiInfo.label}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border/40 flex items-start gap-2">
            <span className="text-primary text-xs mt-0.5 flex-shrink-0">+</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
      }
