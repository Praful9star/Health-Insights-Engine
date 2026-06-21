import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Wind, Droplets, Thermometer, MapPin, RefreshCw,
  AlertTriangle, Eye, Gauge, Search, RotateCcw,
} from "lucide-react";
import PageMeta from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import { useLanguage } from "@/contexts/language-context";
import { useLocationConsent } from "@/hooks/use-location-consent";
import { LocationConsentModal } from "@/components/location-consent-modal";

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  code: number;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  visibility?: number;
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

function aqiLevel(aqi: number): { label: string; color: string; bg: string; advice: string } {
  if (aqi <= 20) return { label: "Good", color: "text-emerald-400", bg: "bg-emerald-500/10", advice: "Air quality is excellent. Great day for outdoor activities." };
  if (aqi <= 40) return { label: "Fair", color: "text-lime-400", bg: "bg-lime-500/10", advice: "Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exertion." };
  if (aqi <= 60) return { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/10", advice: "Moderate air quality. People with respiratory issues should reduce outdoor exposure." };
  if (aqi <= 80) return { label: "Poor", color: "text-orange-400", bg: "bg-orange-500/10", advice: "Unhealthy for sensitive groups. Wear an N95 mask outdoors and avoid heavy exercise outside." };
  if (aqi <= 100) return { label: "Very Poor", color: "text-red-400", bg: "bg-red-500/10", advice: "Everyone may experience health effects. Wear a mask, use an air purifier indoors." };
  return { label: "Hazardous", color: "text-rose-400", bg: "bg-rose-500/10", advice: "Health warning — stay indoors with windows closed. Avoid all outdoor activity." };
}

function getHealthTips(w: WeatherData): string[] {
  const tips: string[] = [];
  if (w.aqi !== null && w.aqi > 60) tips.push("Wear an N95/FFP2 mask when stepping outdoors today.");
  if (w.temp >= 38) tips.push("Severe heat — drink at least 3 litres of water, stay indoors during 11am–4pm.");
  else if (w.temp >= 32) tips.push("Hot weather — drink water every 30 minutes, wear light cotton clothing.");
  if (w.temp <= 10) tips.push("Cold weather — drink warm fluids, keep warm layers on, watch for cold/flu symptoms.");
  if (w.humidity >= 80 && w.temp >= 30) tips.push("High heat and humidity can cause heat exhaustion — rest frequently and take ORS if sweating heavily.");
  if (w.humidity >= 80 && w.temp <= 20) tips.push("High humidity increases risk of fungal infections — keep skin dry and change damp clothing.");
  if (w.code >= 80) tips.push("Rain and wet weather — avoid waterlogged areas, watch for mosquito breeding, and wash hands frequently.");
  if (w.code >= 95) tips.push("Thunderstorm warning — stay indoors, away from windows, and avoid flooded roads.");
  if (w.windSpeed >= 30) tips.push("High winds — people with asthma or dust allergies should stay indoors and keep inhalers handy.");
  if (tips.length === 0) tips.push("Good weather conditions — ideal for a morning walk or outdoor exercise.");
  tips.push("Drink at least 8 glasses of water daily regardless of season.");
  return tips.slice(0, 4);
}

export default function WeatherPage() {
  const { language, t } = useLanguage();
  const { consent, grant, deny, reset } = useLocationConsent();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [citySearching, setCitySearching] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch by coords ──────────────────────────────────────────────────────

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, aqiRes, geoRes] = await Promise.allSettled([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,visibility&timezone=auto`
        ),
        fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm2_5,pm10`
        ),
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        ),
      ]);

      let city = t("Your Location", "आपका स्थान");
      let country = "India";
      if (geoRes.status === "fulfilled" && geoRes.value.ok) {
        const geo = await geoRes.value.json();
        city = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || t("Your Location", "आपका स्थान");
        country = geo.address?.country || "India";
      }

      if (weatherRes.status !== "fulfilled" || !weatherRes.value.ok) throw new Error("Weather API failed");
      const wd = await weatherRes.value.json();
      const c = wd.current;

      let aqi: number | null = null;
      let pm25: number | null = null;
      let pm10: number | null = null;
      if (aqiRes.status === "fulfilled" && aqiRes.value.ok) {
        const aqiData = await aqiRes.value.json();
        aqi = aqiData.current?.european_aqi ?? null;
        pm25 = aqiData.current?.pm2_5 ?? null;
        pm10 = aqiData.current?.pm10 ?? null;
      }

      setWeather({
        city, country,
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        code: c.weather_code,
        aqi, pm25, pm10,
        visibility: c.visibility ? Math.round(c.visibility / 1000) : undefined,
      });
    } catch {
      setError(t("Could not load weather data. Check your internet connection.", "Weather data load नहीं हो सका। Internet connection check करें।"));
    }
    setLoading(false);
  }, [t]);

  // ── Browser geolocation ──────────────────────────────────────────────────

  const requestGeoLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError(t("Geolocation is not supported by your browser.", "आपका browser geolocation support नहीं करता।"));
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        if (err.code === 1) {
          setError(t(
            "Location access denied. You can search by city name below.",
            "Location access deny हो गई। नीचे city name से search करें।",
          ));
        } else {
          setError(t("Could not get your location. Try searching by city name.", "Location नहीं मिली। City name से search करें।"));
        }
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, [fetchWeatherByCoords, t]);

  // ── City name search fallback ────────────────────────────────────────────

  const searchByCity = useCallback(async () => {
    const q = cityQuery.trim();
    if (!q) return;
    setCitySearching(true);
    setError(null);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`
      );
      const data = await res.json();
      const loc = data.results?.[0];
      if (!loc) throw new Error("Not found");
      await fetchWeatherByCoords(loc.latitude, loc.longitude);
    } catch {
      setError(t("City not found. Please try a different name (e.g. Mumbai, Delhi).", "City नहीं मिली। दूसरा नाम try करें (जैसे Mumbai, Delhi)।"));
    }
    setCitySearching(false);
  }, [cityQuery, fetchWeatherByCoords, t]);

  // ── Init ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (consent === "granted") {
      requestGeoLocation();
    } else if (consent === null) {
      setConsentModalOpen(true);
    }
    // denied → show city search (no fetch, no modal)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAllow = () => {
    grant();
    setConsentModalOpen(false);
    requestGeoLocation();
  };

  const handleDeny = () => {
    deny();
    setConsentModalOpen(false);
    setTimeout(() => cityInputRef.current?.focus(), 120);
  };

  const handleReset = () => {
    reset();
    setWeather(null);
    setError(null);
    setConsentModalOpen(true);
  };

  const aqiInfo = weather?.aqi !== null && weather?.aqi !== undefined ? aqiLevel(weather.aqi) : null;
  const tips = weather ? getHealthTips(weather) : [];
  const showCitySearch = !loading && !weather && consent !== null;

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-24 lg:pb-10">
      <PageMeta
        title="Health Weather — Air Quality &amp; Allergy Alerts India"
        description="Real-time air quality index, pollen counts, and personalised health advisories based on your local weather across India."
        path="/weather"
      />

      <LocationConsentModal
        open={consentModalOpen}
        onAllow={handleAllow}
        onDeny={handleDeny}
        language={language as "en" | "hi"}
      />

      <PageHeader
        icon={<span className="text-2xl">{weather ? wmoIcon(weather.code) : "🌤️"}</span>}
        title={t("Weather & Health Tips", "मौसम और Health Tips")}
        subtitle={t("Real-time air quality and personalised health guidance based on your local weather.", "आपके local weather के अनुसार real-time air quality और health guidance।")}
        badge={t("Live", "Live")}
      />

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-muted/40 rounded w-32 mb-3" />
              <div className="h-8 bg-muted/40 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* City search — shown when consent denied or after a location error */}
      {showCitySearch && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-6 mb-4"
        >
          <p className="font-serif font-700 text-foreground mb-1">
            {t("Search by city", "City से खोजें")}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {consent === "denied"
              ? t("Location access is off. Enter a city name to see local weather.", "Location access बंद है। City का नाम enter करें।")
              : t("Enter a city name to see local weather.", "City का नाम enter करें।")}
          </p>
          <div className="flex gap-2">
            <input
              ref={cityInputRef}
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchByCity()}
              placeholder={t("e.g. Mumbai, Delhi, Bengaluru", "जैसे Mumbai, Delhi, Bengaluru")}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button
              onClick={searchByCity}
              disabled={citySearching || !cityQuery.trim()}
              className="rounded-xl gap-2 px-4"
            >
              {citySearching
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />}
              {t("Search", "खोजें")}
            </Button>
          </div>
          {consent === "denied" && (
            <button
              onClick={handleReset}
              className="mt-3 text-xs text-primary underline underline-offset-2 hover:opacity-80"
            >
              {t("Re-enable location access", "Location access फिर से enable करें")}
            </button>
          )}
        </motion.div>
      )}

      {/* Error */}
      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{error}</p>
              {consent === "granted" && (
                <Button onClick={requestGeoLocation} variant="outline" size="sm" className="gap-2 rounded-full mt-3">
                  <RefreshCw className="w-3.5 h-3.5" /> {t("Try again", "फिर try करें")}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Weather results */}
      {weather && !loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          <div className="glass-panel rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{weather.city}, {weather.country}</span>
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-foreground">{weather.temp}°C</span>
                  <span className="text-5xl">{wmoIcon(weather.code)}</span>
                </div>
                <p className="text-muted-foreground mt-1">{wmoLabel(weather.code)} · {t("Feels like", "Feels like")} {weather.feelsLike}°C</p>
              </div>
              <button
                onClick={consent === "granted" ? requestGeoLocation : searchByCity}
                className="p-2 rounded-xl hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
                aria-label={t("Refresh", "Refresh")}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Droplets, label: t("Humidity", "Humidity"), value: `${weather.humidity}%`, color: "text-sky-400" },
                { icon: Wind, label: t("Wind", "Wind"), value: `${weather.windSpeed} km/h`, color: "text-teal-400" },
                ...(weather.visibility !== undefined ? [{ icon: Eye, label: t("Visibility", "Visibility"), value: `${weather.visibility} km`, color: "text-violet-400" }] : []),
                { icon: Thermometer, label: t("Feels Like", "Feels Like"), value: `${weather.feelsLike}°C`, color: "text-orange-400" },
              ].map((item) => (
                <div key={item.label} className="bg-muted/20 rounded-xl p-3">
                  <item.icon className={`w-4 h-4 ${item.color} mb-1`} />
                  <div className="text-sm font-semibold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {weather.aqi !== null && aqiInfo && (
            <div className={`glass-panel rounded-2xl p-5 ${aqiInfo.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{t("Air Quality Index", "Air Quality Index")}</span>
                </div>
                <span className={`text-sm font-bold ${aqiInfo.color} px-2.5 py-0.5 rounded-full bg-black/20`}>
                  {weather.aqi} · {aqiInfo.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{aqiInfo.advice}</p>
              {(weather.pm25 !== null || weather.pm10 !== null) && (
                <div className="flex gap-4 text-sm">
                  {weather.pm25 !== null && (
                    <div><span className="text-muted-foreground">PM2.5 </span><span className="font-medium text-foreground">{weather.pm25.toFixed(1)} μg/m³</span></div>
                  )}
                  {weather.pm10 !== null && (
                    <div><span className="text-muted-foreground">PM10 </span><span className="font-medium text-foreground">{weather.pm10.toFixed(1)} μg/m³</span></div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="glass-panel rounded-2xl p-5">
            <h2 className="font-semibold text-foreground mb-3">{t("Today's Health Tips", "आज के Health Tips")}</h2>
            <div className="space-y-3">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">{i + 1}</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {consent === "denied" && (
            <div className="flex items-center justify-between px-1">
              <p className="text-xs text-muted-foreground">
                {t("Showing weather for searched city.", "Searched city का weather दिखा रहे हैं।")}
              </p>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-primary hover:opacity-80">
                <RotateCcw className="w-3 h-3" />
                {t("Use my location", "मेरा location use करें")}
              </button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center px-4">
            {t(
              "Weather from Open-Meteo · Air quality from Open-Meteo AQ API · Location from Nominatim. Data updates on page load.",
              "Weather: Open-Meteo · Air quality: Open-Meteo AQ API · Location: Nominatim। Data page load पर update होता है।",
            )}
          </p>
        </motion.div>
      )}
    </div>
  );
  }
