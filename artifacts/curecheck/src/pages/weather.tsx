import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wind, Droplets, Thermometer, MapPin, RefreshCw, AlertTriangle, Eye, Gauge } from "lucide-react";
import PageMeta from "@/components/page-meta";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";

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
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
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

          let city = "Your Location";
          let country = "India";
          if (geoRes.status === "fulfilled" && geoRes.value.ok) {
            const geo = await geoRes.value.json();
            city = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your Location";
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
          setError("Could not load weather data. Check your internet connection.");
        }
        setLoading(false);
      },
      (err) => {
        if (err.code === 1) setError("Location access denied. Please allow location permission to see local weather.");
        else setError("Could not get your location.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => { fetchWeather(); }, []);

  const aqiInfo = weather?.aqi !== null && weather?.aqi !== undefined ? aqiLevel(weather.aqi) : null;
  const tips = weather ? getHealthTips(weather) : [];

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 pb-24 lg:pb-10">
      <PageMeta
        title="Health Weather — Air Quality &amp; Allergy Alerts India"
        description="Real-time air quality index, pollen counts, and personalised health advisories based on your local weather across India."
        path="/weather"
      />
      <PageHeader
        icon={<span className="text-2xl">{weather ? wmoIcon(weather.code) : "🌤️"}</span>}
        title="Weather & Health Tips"
        subtitle="Real-time air quality and personalised health guidance based on your local weather."
        badge="Live"
      />

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

      {error && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel rounded-2xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchWeather} variant="outline" className="gap-2 rounded-full">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </motion.div>
      )}

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
                <p className="text-muted-foreground mt-1">{wmoLabel(weather.code)} · Feels like {weather.feelsLike}°C</p>
              </div>
              <button onClick={fetchWeather} className="p-2 rounded-xl hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Droplets, label: "Humidity", value: `${weather.humidity}%`, color: "text-sky-400" },
                { icon: Wind, label: "Wind", value: `${weather.windSpeed} km/h`, color: "text-teal-400" },
                ...(weather.visibility !== undefined ? [{ icon: Eye, label: "Visibility", value: `${weather.visibility} km`, color: "text-violet-400" }] : []),
                { icon: Thermometer, label: "Feels Like", value: `${weather.feelsLike}°C`, color: "text-orange-400" },
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
                  <span className="font-semibold text-foreground">Air Quality Index</span>
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
            <h2 className="font-semibold text-foreground mb-3">Today's Health Tips</h2>
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

          <p className="text-xs text-muted-foreground text-center px-4">
            Weather from Open-Meteo · Air quality from Open-Meteo AQ API · Location from Nominatim. Data updates on page load.
          </p>
        </motion.div>
      )}
    </div>
  );
}
