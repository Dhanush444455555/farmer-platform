import React, { useState, useEffect } from 'react';
import { CloudRain, ThermometerSun, Leaf, Activity, ChevronRight, Wind, Sun, MapPin } from 'lucide-react';
import { Card } from '../ui/Card';
import { CropYieldChart } from '../analytics/CropYieldChart';
import { useNavigate } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Phase {
  name: string;
  emoji: string;
  startDay: number;
  endDay: number;
  color: string;
  tasks: string[];
  description: string;
}

interface CropLifecycle {
  totalDays: number;
  phases: Phase[];
}

interface Crop {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
}

// ─── Full Lifecycle Data ───────────────────────────────────────────────────────
const LIFECYCLES: Record<string, CropLifecycle> = {
  papaya: {
    totalDays: 300,
    phases: [
      { name: 'Germination',       emoji: '🌱', startDay: 1,   endDay: 14,  color: '#bbf7d0', tasks: ['Keep seeds moist at 25–30°C', 'Use seedling trays with well-drained mix', 'Avoid direct sun at this stage'],             description: 'Seeds sprout and first roots establish.' },
      { name: 'Seedling',          emoji: '🌿', startDay: 15,  endDay: 45,  color: '#86efac', tasks: ['Partial shade, 4–5 hrs sun', 'Water gently every 2 days', 'Apply dilute NPK (10-10-10)'],                               description: 'True leaves appear. Transplant when 20cm tall.' },
      { name: 'Vegetative Growth', emoji: '🌳', startDay: 46,  endDay: 120, color: '#4ade80', tasks: ['Full sun (6+ hrs)', 'Water 3× per week deeply', 'Apply nitrogen-rich fertilizer monthly', 'Mulch base to retain moisture'], description: 'Rapid stem and leaf growth. Plant needs maximum nutrition.' },
      { name: 'Pre-Flowering',     emoji: '🌸', startDay: 121, endDay: 150, color: '#fcd34d', tasks: ['Reduce nitrogen, increase potassium', 'Watch for mealybugs', 'Maintain regular watering'],                                description: 'Flower buds begin to form at leaf axils.' },
      { name: 'Flowering',         emoji: '💐', startDay: 151, endDay: 190, color: '#fb923c', tasks: ['Ensure pollination (hand-pollinate if needed)', 'Water consistently — no drought stress', 'Spray neem oil for pests'],     description: 'Flowers open. Pollination determines fruit set.' },
      { name: 'Fruit Development', emoji: '🍈', startDay: 191, endDay: 250, color: '#f97316', tasks: ['Support heavy branches', 'Apply foliar potassium spray', 'Monitor for fruit flies', 'Reduce watering slightly'],          description: 'Fruits swell and develop. Critical nutrition stage.' },
      { name: 'Ripening',          emoji: '🟡', startDay: 251, endDay: 285, color: '#facc15', tasks: ['Stop fertilizing', 'Reduce watering to prevent splitting', 'Watch for color change (green→yellow)'],                      description: 'Fruits turn from green to yellow-orange. Check daily.' },
      { name: 'Harvest',           emoji: '✅', startDay: 286, endDay: 300, color: '#10b981', tasks: ['Harvest when 20–30% yellow', 'Use clean sharp knife', 'Store at room temp to ripen fully'],                              description: 'Ripe fruits ready for harvest. Remove spent plant after yield drops.' },
    ],
  },
  tomato: {
    totalDays: 80,
    phases: [
      { name: 'Germination',   emoji: '🌱', startDay: 1,  endDay: 7,  color: '#bbf7d0', tasks: ['Keep soil at 21–27°C', 'Water lightly daily'],                                                  description: 'Seeds germinate within 5–7 days.' },
      { name: 'Seedling',      emoji: '🌿', startDay: 8,  endDay: 20, color: '#86efac', tasks: ['Give 14–16 hrs of light', 'Thin to strongest seedling'],                                        description: 'First true leaves appear.' },
      { name: 'Vegetative',    emoji: '🌳', startDay: 21, endDay: 45, color: '#4ade80', tasks: ['Water daily at base', 'Stake plant for support', 'Prune suckers weekly', 'Apply nitrogen fertilizer'], description: 'Plant grows vigorously. Pinch suckers for better yield.' },
      { name: 'Flowering',     emoji: '🌼', startDay: 46, endDay: 58, color: '#fcd34d', tasks: ['Shake flowers gently to aid pollination', 'Maintain consistent soil moisture', 'Watch for blight'], description: 'Yellow flowers appear. Avoid overwatering.' },
      { name: 'Fruiting',      emoji: '🍅', startDay: 59, endDay: 72, color: '#f97316', tasks: ['Add support to heavy branches', 'Apply calcium to prevent blossom-end rot', 'Monitor for whitefly'], description: 'Small green tomatoes form and swell.' },
      { name: 'Harvest',       emoji: '✅', startDay: 73, endDay: 80, color: '#10b981', tasks: ['Harvest when fully red/colored', 'Pick every 2–3 days', 'Remove diseased fruits immediately'],      description: 'Tomatoes are ripe. Harvest before frost.' },
    ],
  },
  wheat: {
    totalDays: 130,
    phases: [
      { name: 'Germination',  emoji: '🌱', startDay: 1,  endDay: 10,  color: '#bbf7d0', tasks: ['Sow at 5–8 cm depth', 'Ensure soil moisture', 'Temperature: 12–25°C'],                         description: 'Seeds germinate and emerge from soil.' },
      { name: 'Tillering',    emoji: '🌿', startDay: 11, endDay: 40,  color: '#86efac', tasks: ['Apply first dose urea (30 days)', 'Light irrigation', 'Watch for aphids and rust'],             description: 'Multiple shoots develop from base.' },
      { name: 'Stem Growth',  emoji: '🌾', startDay: 41, endDay: 70,  color: '#4ade80', tasks: ['Apply second dose urea', 'Irrigate every 10–15 days', 'Monitor for yellow rust'],              description: 'Stems elongate rapidly (jointing stage).' },
      { name: 'Heading',      emoji: '🌸', startDay: 71, endDay: 90,  color: '#fcd34d', tasks: ['Critical irrigation needed', 'Watch for loose smut', 'Avoid lodging by reducing N'],            description: 'Ears emerge from the flag leaf.' },
      { name: 'Grain Filling', emoji: '🌾', startDay: 91, endDay: 115, color: '#fb923c', tasks: ['Irrigation if moisture is low', 'Stop applying fertilizer', 'Watch for harvest time'],         description: 'Grain fills and hardens (dough stage).' },
      { name: 'Harvest',      emoji: '✅', startDay: 116, endDay: 130, color: '#10b981', tasks: ['Harvest at 12–14% moisture', 'Use combine harvester or sickle', 'Dry grains before storage'], description: 'Grain is golden and dry. Time to harvest.' },
    ],
  },
  rice: {
    totalDays: 130,
    phases: [
      { name: 'Germination',  emoji: '🌱', startDay: 1,  endDay: 7,  color: '#bbf7d0', tasks: ['Pre-soak seeds 24 hrs', 'Keep nursery moist', 'Ideal temp: 25–35°C'],             description: 'Seeds germinate in nursery bed.' },
      { name: 'Nursery',      emoji: '🌿', startDay: 8,  endDay: 25, color: '#86efac', tasks: ['Keep nursery flooded 2cm', 'Apply DAP to nursery', 'Weed manually'],              description: 'Seedlings grow in nursery for 3 weeks.' },
      { name: 'Transplanting',emoji: '🌾', startDay: 26, endDay: 45, color: '#38bdf8', tasks: ['Transplant 2–3 seedlings per hill', 'Maintain 5cm flood', 'Apply basal fertilizer'], description: 'Seedlings transplanted to paddy field.' },
      { name: 'Vegetative',   emoji: '🌳', startDay: 46, endDay: 80, color: '#4ade80', tasks: ['Maintain flooding', 'Apply top dress nitrogen at 35 DAT', 'Check for stem borers'], description: 'Tillering and vegetative growth.' },
      { name: 'Reproductive', emoji: '🌸', startDay: 81, endDay: 105, color: '#fcd34d', tasks: ['Panicle initiation — critical water stage', 'Apply potash', 'Monitor for BPH'], description: 'Panicle emerges. Flowering occurs.' },
      { name: 'Maturity',     emoji: '🌾', startDay: 106, endDay: 125, color: '#fb923c', tasks: ['Drain field 2 weeks before harvest', 'Watch for grain discoloration'],           description: 'Grains fill and mature on panicle.' },
      { name: 'Harvest',      emoji: '✅', startDay: 126, endDay: 130, color: '#10b981', tasks: ['Harvest when 80% grains are golden', 'Dry to 14% moisture immediately'],         description: 'Harvest with sickle or combine.' },
    ],
  },
  banana: {
    totalDays: 330,
    phases: [
      { name: 'Planting',      emoji: '🌱', startDay: 1,   endDay: 30,  color: '#bbf7d0', tasks: ['Plant suckers at 30cm depth', 'Water immediately after planting', 'Apply FYM @ 10kg/pit'], description: 'Suckers establish root system.' },
      { name: 'Establishment', emoji: '🌿', startDay: 31,  endDay: 90,  color: '#86efac', tasks: ['Water every 3 days', 'Apply nitrogen monthly', 'Remove badly positioned suckers'],           description: 'Plant sends up new leaves rapidly.' },
      { name: 'Vegetative',    emoji: '🌳', startDay: 91,  endDay: 200, color: '#4ade80', tasks: ['Water every 2 days', 'Apply NPK monthly', 'Prop up leaning plants', 'Desuckering'],          description: 'Fast leaf production. 8–12 leaves needed for bunch.' },
      { name: 'Flower Shoot',  emoji: '🌸', startDay: 201, endDay: 240, color: '#fcd34d', tasks: ['Tie bunch to prop', 'Remove male bud after last hand sets', 'Bag bunch in blue polythene'],   description: 'Flower spike emerges and hands set.' },
      { name: 'Bunch Fill',    emoji: '🍌', startDay: 241, endDay: 305, color: '#fb923c', tasks: ['Maintain irrigation', 'Apply potassium spray', 'Remove dry leaves'],                          description: 'Bananas fill and fatten on the bunch.' },
      { name: 'Harvest',       emoji: '✅', startDay: 306, endDay: 330, color: '#10b981', tasks: ['Harvest when fingers are round and full', 'Cut entire bunch at once', 'Handle gently'],       description: 'Bunch cut and ripened off plant.' },
    ],
  },
  mango: {
    totalDays: 365,
    phases: [
      { name: 'Planting',      emoji: '🌱', startDay: 1,   endDay: 60,  color: '#bbf7d0', tasks: ['Plant grafted saplings in deep pits', 'Water daily for first month', 'Protect from wind'],   description: 'Young grafted tree establishes.' },
      { name: 'Juvenile',      emoji: '🌿', startDay: 61,  endDay: 180, color: '#86efac', tasks: ['Water 2× per week', 'Apply NPK quarterly', 'Train canopy shape by pruning'],                  description: 'Tree grows vegetatively. No flowering yet.' },
      { name: 'Tree Growth',   emoji: '🌳', startDay: 181, endDay: 300, color: '#4ade80', tasks: ['Reduce watering to encourage flower initiation', 'Apply potash before flowering season'],      description: 'Tree matures. Stress initiates flowering.' },
      { name: 'Flowering',     emoji: '🌸', startDay: 301, endDay: 340, color: '#fcd34d', tasks: ['Spray micronutrients at panicle emergence', 'Protect from rain (fungal issues)', 'Spray Bordeaux mixture'], description: 'Panicles emerge (Feb–Mar). Pollination by insects.' },
      { name: 'Fruit Set',     emoji: '🥭', startDay: 341, endDay: 365, color: '#fb923c', tasks: ['Thin excess fruitlets', 'Bag fruits to prevent fly attack', 'Irrigate carefully'],            description: 'Small fruits set and begin swelling.' },
    ],
  },
  corn: {
    totalDays: 90,
    phases: [
      { name: 'Germination', emoji: '🌱', startDay: 1,  endDay: 7,  color: '#bbf7d0', tasks: ['Sow 2–3 seeds per hill', 'Soil temp > 15°C', 'Thin to 1 plant after emergence'],    description: 'Corn emerges from soil within 5–7 days.' },
      { name: 'Seedling',    emoji: '🌿', startDay: 8,  endDay: 18, color: '#86efac', tasks: ['Water every 3 days', 'Apply starter fertilizer'],                                      description: 'Early leaf stages (V1–V3).' },
      { name: 'Vegetative',  emoji: '🌽', startDay: 19, endDay: 50, color: '#4ade80', tasks: ['Side-dress nitrogen at knee height (V6)', 'Water deeply', 'Watch for corn borers'],     description: 'Rapid growth from V3 to VT (tasseling).' },
      { name: 'Tasseling',   emoji: '🌸', startDay: 51, endDay: 62, color: '#fcd34d', tasks: ['Critical water stage — do not stress plant', 'Watch for silk emergence'],             description: 'Tassels shed pollen. Silks catch pollen for kernel set.' },
      { name: 'Grain Fill',  emoji: '🌽', startDay: 63, endDay: 80, color: '#fb923c', tasks: ['Maintain moisture', 'Watch for ear rot', 'No more fertilizer needed'],               description: 'Kernels fill from silk end to base.' },
      { name: 'Harvest',     emoji: '✅', startDay: 81, endDay: 90, color: '#10b981', tasks: ['Harvest when husks brown and kernels hard', 'Allow to field-dry if possible'],        description: 'Corn is ripe. Black layer forms at kernel base.' },
    ],
  },
};

// Default lifecycle for unknown crops
const defaultLifecycle = (totalDays: number): CropLifecycle => ({
  totalDays,
  phases: [
    { name: 'Germination',       emoji: '🌱', startDay: 1,                    endDay: Math.floor(totalDays * 0.1),  color: '#bbf7d0', tasks: ['Keep seeds moist', 'Maintain optimal temperature'],                     description: 'Seeds germinate and sprout.' },
    { name: 'Seedling',          emoji: '🌿', startDay: Math.floor(totalDays * 0.1) + 1, endDay: Math.floor(totalDays * 0.2), color: '#86efac', tasks: ['Give adequate sunlight', 'Water regularly'],                          description: 'Young plant establishes.' },
    { name: 'Vegetative Growth', emoji: '🌳', startDay: Math.floor(totalDays * 0.2) + 1, endDay: Math.floor(totalDays * 0.5), color: '#4ade80', tasks: ['Apply nitrogen fertilizer', 'Water deeply', 'Monitor for pests'],     description: 'Plant grows leaves and stem.' },
    { name: 'Flowering',         emoji: '🌸', startDay: Math.floor(totalDays * 0.5) + 1, endDay: Math.floor(totalDays * 0.7), color: '#fcd34d', tasks: ['Support pollination', 'Reduce nitrogen', 'Increase potassium'],       description: 'Plant flowers and sets fruit.' },
    { name: 'Maturity',          emoji: '🍀', startDay: Math.floor(totalDays * 0.7) + 1, endDay: Math.floor(totalDays * 0.9), color: '#fb923c', tasks: ['Maintain nutrition', 'Water carefully', 'Watch for ripening signs'], description: 'Crop reaches maturity.' },
    { name: 'Harvest',           emoji: '✅', startDay: Math.floor(totalDays * 0.9) + 1, endDay: totalDays,              color: '#10b981', tasks: ['Harvest at right time', 'Handle carefully', 'Store properly'],            description: 'Crop is ready for harvest.' },
  ],
});

function getLifecycle(cropName: string): CropLifecycle {
  const n = cropName.toLowerCase().trim();
  if (n.includes('papaya') || n.includes('pappaya')) return LIFECYCLES.papaya;
  if (n.includes('tomato')) return LIFECYCLES.tomato;
  if (n.includes('wheat')) return LIFECYCLES.wheat;
  if (n.includes('rice') || n.includes('paddy')) return LIFECYCLES.rice;
  if (n.includes('banana')) return LIFECYCLES.banana;
  if (n.includes('mango')) return LIFECYCLES.mango;
  if (n.includes('corn') || n.includes('maize')) return LIFECYCLES.corn;
  if (n.includes('cotton')) return defaultLifecycle(180);
  if (n.includes('groundnut')) return defaultLifecycle(110);
  if (n.includes('onion')) return defaultLifecycle(110);
  if (n.includes('potato')) return defaultLifecycle(90);
  if (n.includes('sugarcane')) return defaultLifecycle(365);
  return defaultLifecycle(100);
}

function getCropEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes('papaya') || n.includes('pappaya')) return '🍈';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('wheat')) return '🌾';
  if (n.includes('rice') || n.includes('paddy')) return '🌾';
  if (n.includes('corn') || n.includes('maize')) return '🌽';
  if (n.includes('potato')) return '🥔';
  if (n.includes('mango')) return '🥭';
  if (n.includes('banana')) return '🍌';
  if (n.includes('cotton')) return '🪴';
  if (n.includes('onion')) return '🧅';
  return '🌱';
}

const LS_KEY = 'farm_my_crops';

export const DashboardWidget: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const navigate = useNavigate();

  // Weather state
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');
  const [locationName, setLocationName] = useState('Fetching location...');

  const API_KEY = 'ad116b7e51dafe1666378a0e4a2bc587';

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') as Crop[];
      setCrops(stored);
      if (stored.length > 0) setSelectedCrop(stored[0]);
    } catch { /**/ }
  }, []);

  // Fetch Weather Effect (Switched to Open-Meteo to avoid API key issues)
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        setWeatherLoading(true);
        // 1. Fetch Weather without API key
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        const weatherData = await weatherRes.json();
        
        // 2. Fetch Location Name (Reverse Geocode) without API key
        try {
          const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (locRes.ok) {
            const locData = await locRes.json();
            setLocationName(locData.address?.city || locData.address?.town || locData.address?.village || locData.address?.county || 'Your Farm');
          }
        } catch {
          setLocationName('Your Farm');
        }

        // Map WMO weather codes to simple strings for UI
        const code = weatherData.current.weather_code;
        let main = 'Clear';
        let desc = 'Clear sky';
        if (code >= 1 && code <= 3) { main = 'Clouds'; desc = 'Partly cloudy'; }
        if (code >= 45 && code <= 48) { main = 'Clouds'; desc = 'Foggy'; }
        if (code >= 51 && code <= 67) { main = 'Rain'; desc = 'Rain / Drizzle'; }
        if (code >= 71 && code <= 77) { main = 'Snow'; desc = 'Snow'; }
        if (code >= 80 && code <= 82) { main = 'Rain'; desc = 'Rain showers'; }
        if (code >= 95) { main = 'Rain'; desc = 'Thunderstorm'; }

        setWeather({
           temp: weatherData.current.temperature_2m,
           humidity: weatherData.current.relative_humidity_2m,
           windSpeed: weatherData.current.wind_speed_10m,
           main,
           desc
        });
        setWeatherError('');
      } catch (err) {
        console.error("Weather App Error:", err);
        setWeatherError('Failed to load weather');
      } finally {
        setWeatherLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        (error) => {
          console.warn("Geolocation denied, using default (New Delhi).", error);
          fetchWeather(28.6139, 77.2090);
        }
      );
    } else {
       fetchWeather(28.6139, 77.2090);
    }
  }, []);

  const renderLifecycleRoadmap = () => {
    if (!selectedCrop) return null;
    const lifecycle = getLifecycle(selectedCrop.name);
    const daysSincePlanting = Math.max(0, Math.floor((Date.now() - new Date(selectedCrop.createdAt).getTime()) / 86400000));
    const currentDay = Math.min(daysSincePlanting + 1, lifecycle.totalDays);
    const progressPct = Math.min(100, (currentDay / lifecycle.totalDays) * 100);

    const currentPhaseIndex = lifecycle.phases.findIndex(
      p => currentDay >= p.startDay && currentDay <= p.endDay
    );
    const currentPhase = currentPhaseIndex >= 0 ? lifecycle.phases[currentPhaseIndex] : lifecycle.phases[lifecycle.phases.length - 1];
    const daysToHarvest = Math.max(0, lifecycle.totalDays - currentDay);

    return (
      <div className="db-lifecycle">
        {/* Stats row */}
        <div className="db-stats-row">
          <div className="db-stat-badge db-stat-green">
            <span>📅</span> Day {currentDay} of {lifecycle.totalDays}
          </div>
          <div className="db-stat-badge db-stat-blue">
            <span>📍</span> {currentPhase.emoji} {currentPhase.name}
          </div>
          <div className="db-stat-badge db-stat-orange">
            <span>🏁</span> {daysToHarvest > 0 ? `${daysToHarvest} days to harvest` : 'Ready to harvest!'}
          </div>
          <div className="db-stat-badge db-stat-purple">
            <span>📊</span> {progressPct.toFixed(0)}% complete
          </div>
        </div>

        {/* Master progress bar */}
        <div className="db-master-progress-wrap">
          <div className="db-master-progress-bar" style={{ width: `${progressPct}%` }}>
            <span className="db-progress-dot">{currentPhase.emoji}</span>
          </div>
          <div className="db-progress-labels">
            <span>🌱 Planted</span>
            <span>🏁 Harvest</span>
          </div>
        </div>

        {/* Phase timeline cards — horizontal scroll */}
        <div className="db-phase-scroll">
          {lifecycle.phases.map((phase, idx) => {
            const isCompleted = currentDay > phase.endDay;
            const isCurrent   = idx === currentPhaseIndex;
            const isUpcoming  = currentDay < phase.startDay;
            return (
              <div
                key={idx}
                className={`db-phase-card ${isCurrent ? 'db-phase-current' : ''} ${isCompleted ? 'db-phase-done' : ''} ${isUpcoming ? 'db-phase-upcoming' : ''}`}
              >
                {/* Connector line */}
                {idx < lifecycle.phases.length - 1 && (
                  <div className={`db-connector ${isCompleted ? 'db-connector-done' : ''}`} />
                )}

                {/* Phase circle indicator */}
                <div className={`db-phase-circle ${isCurrent ? 'db-circle-current' : ''} ${isCompleted ? 'db-circle-done' : ''}`}>
                  {isCompleted ? '✓' : phase.emoji}
                </div>
                {isCurrent && <div className="db-current-pulse" />}

                <div className="db-phase-name">{phase.name}</div>
                <div className="db-phase-days">Day {phase.startDay}–{phase.endDay}</div>

                {/* Task list shown for current + adjacent phases */}
                {(isCurrent || Math.abs(idx - currentPhaseIndex) <= 1) && (
                  <div className={`db-phase-tasks ${isCurrent ? 'db-tasks-current' : ''}`}>
                    {phase.tasks.slice(0, 2).map((t, ti) => (
                      <div key={ti} className="db-phase-task">• {t.replace(/^\p{Emoji}+\s*/u, '').slice(0, 32)}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current phase detail card */}
        <div className="db-current-phase-detail" style={{ borderLeft: `4px solid ${currentPhase.color}` }}>
          <div className="db-cpd-header">
            <span className="db-cpd-emoji">{currentPhase.emoji}</span>
            <div>
              <div className="db-cpd-title">Currently in: {currentPhase.name} Stage</div>
              <div className="db-cpd-desc">{currentPhase.description}</div>
            </div>
          </div>
          <div className="db-cpd-tasks">
            <div className="db-cpd-tasks-label">✅ What to do right now:</div>
            {currentPhase.tasks.map((t, i) => (
              <div key={i} className="db-cpd-task-item">{t}</div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <style>{`
        /* ─── Lifecycle Roadmap ─────────────────────────────────────────────── */
        .db-crops-roadmap {
          background: white;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          overflow: hidden;
          margin-top: 2rem;
        }
        .db-roadmap-header {
          background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
          padding: 1.25rem 1.5rem;
          display: flex; align-items: center; justify-content: space-between; color: white;
        }
        .db-roadmap-header-left { display: flex; align-items: center; gap: 0.85rem; }
        .db-roadmap-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.15); display: flex;
          align-items: center; justify-content: center; font-size: 1.4rem;
        }
        .db-roadmap-title { font-size: 1.1rem; font-weight: 800; margin: 0; }
        .db-roadmap-sub   { font-size: 0.8rem; opacity: 0.8; margin: 3px 0 0; }
        .db-view-all {
          display: flex; align-items: center; gap: 0.3rem;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
          color: white; font-size: 0.82rem; font-weight: 700;
          padding: 0.4rem 0.9rem; border-radius: 999px; cursor: pointer;
          transition: background 0.15s;
        }
        .db-view-all:hover { background: rgba(255,255,255,0.25); }

        /* Crop tabs */
        .db-crop-tabs {
          display: flex; gap: 0.5rem;
          padding: 1rem 1.5rem 0;
          overflow-x: auto; scrollbar-width: none;
          border-bottom: 1px solid #f1f5f9;
        }
        .db-crop-tabs::-webkit-scrollbar { display: none; }
        .db-crop-tab {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1.1rem; border-radius: 999px;
          border: 1.5px solid #e2e8f0;
          background: white; cursor: pointer; white-space: nowrap;
          font-size: 0.85rem; font-weight: 600; color: #64748b;
          transition: all 0.15s; flex-shrink: 0; margin-bottom: 0.75rem;
        }
        .db-crop-tab:hover { border-color: #a7f3d0; color: #059669; background: #f0fdf4; }
        .db-crop-tab.db-tab-active {
          background: #065f46; color: white; border-color: #065f46;
          box-shadow: 0 4px 12px rgba(6,95,70,0.3);
        }

        /* Lifecycle container */
        .db-lifecycle { padding: 1.25rem 1.5rem 1.5rem; }

        /* Stats row */
        .db-stats-row {
          display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem;
        }
        .db-stat-badge {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.4rem 0.9rem; border-radius: 999px;
          font-size: 0.8rem; font-weight: 700;
        }
        .db-stat-green  { background: #dcfce7; color: #166534; }
        .db-stat-blue   { background: #dbeafe; color: #1d4ed8; }
        .db-stat-orange { background: #fed7aa; color: #c2410c; }
        .db-stat-purple { background: #ede9fe; color: #6d28d9; }

        /* Master progress bar */
        .db-master-progress-wrap {
          margin-bottom: 1.5rem;
        }
        .db-master-progress-bg {
          background: #f1f5f9; border-radius: 999px; height: 14px;
          overflow: visible; position: relative;
        }
        .db-master-progress-bar {
          background: linear-gradient(90deg, #10b981, #059669);
          height: 14px; border-radius: 999px;
          position: relative; transition: width 0.6s ease;
          display: flex; align-items: center; justify-content: flex-end;
          min-width: 20px;
        }
        .db-progress-dot {
          position: absolute; right: -12px; top: 50%;
          transform: translateY(-50%);
          font-size: 1.3rem; z-index: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .db-progress-labels {
          display: flex; justify-content: space-between;
          font-size: 0.72rem; color: #94a3b8; margin-top: 0.4rem;
          font-weight: 600;
        }
        /* Progress track */
        .db-master-progress-wrap {
          background: #f1f5f9; border-radius: 999px; height: 14px;
          overflow: hidden; position: relative; margin-bottom: 0.4rem;
        }
        .db-master-progress-wrap + .db-progress-labels {
          display: flex; justify-content: space-between;
          font-size: 0.72rem; color: #94a3b8; margin-bottom: 1.5rem;
          font-weight: 600;
        }

        /* Phase timeline horizontal scroll */
        .db-phase-scroll {
          display: flex; align-items: flex-start;
          gap: 0; overflow-x: auto;
          padding-bottom: 0.75rem;
          scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent;
          margin-bottom: 1.25rem;
        }
        .db-phase-scroll::-webkit-scrollbar { height: 4px; }
        .db-phase-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 999px; }

        /* Individual phase card */
        .db-phase-card {
          flex-shrink: 0; width: 130px;
          display: flex; flex-direction: column; align-items: center;
          position: relative; padding-top: 0.75rem;
        }
        /* Connector line between phases */
        .db-connector {
          position: absolute; top: 24px; left: calc(50% + 18px);
          width: calc(100% - 36px); height: 2px;
          background: #e2e8f0; z-index: 0;
        }
        .db-connector-done { background: #10b981; }

        /* Phase circle */
        .db-phase-circle {
          width: 36px; height: 36px; border-radius: 50%;
          background: #f1f5f9; border: 2px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; z-index: 1; position: relative;
          transition: all 0.2s;
        }
        .db-circle-done {
          background: #10b981; border-color: #10b981;
          color: white; font-size: 0.85rem; font-weight: 800;
        }
        .db-circle-current {
          background: white; border: 3px solid #10b981;
          box-shadow: 0 0 0 4px rgba(16,185,129,0.15);
        }
        /* Pulse ring for current phase */
        .db-current-pulse {
          position: absolute; top: 10px;
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid #10b981;
          animation: db-pulse 1.8s ease-out infinite; z-index: 0;
        }
        @keyframes db-pulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }

        .db-phase-name {
          font-size: 0.72rem; font-weight: 800; color: #0f172a;
          text-align: center; margin-top: 0.5rem; line-height: 1.2;
        }
        .db-phase-days {
          font-size: 0.65rem; color: #94a3b8; margin-top: 2px; text-align: center;
        }
        .db-phase-current .db-phase-name { color: #059669; }
        .db-phase-done .db-phase-name    { color: #94a3b8; }
        .db-phase-upcoming .db-phase-circle { opacity: 0.45; }
        .db-phase-upcoming .db-phase-name  { color: #cbd5e1; }
        .db-phase-upcoming .db-phase-days  { color: #e2e8f0; }

        /* Task mini list under phase card */
        .db-phase-tasks {
          margin-top: 0.5rem;
          background: #f8fafc; border-radius: 8px;
          padding: 0.4rem 0.5rem;
          border: 1px solid #e2e8f0;
          width: 120px;
        }
        .db-tasks-current {
          background: #f0fdf4; border: 1px solid #a7f3d0;
        }
        .db-phase-task {
          font-size: 0.6rem; color: #475569; line-height: 1.5;
        }
        .db-tasks-current .db-phase-task { color: #065f46; }

        /* Current phase detail card */
        .db-current-phase-detail {
          background: #f8fafc;
          border-radius: 14px;
          padding: 1rem 1.25rem;
          border: 1px solid #e2e8f0;
        }
        .db-cpd-header {
          display: flex; align-items: flex-start; gap: 1rem;
          margin-bottom: 0.85rem;
        }
        .db-cpd-emoji { font-size: 2rem; flex-shrink: 0; }
        .db-cpd-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; }
        .db-cpd-desc  { font-size: 0.82rem; color: #64748b; margin-top: 3px; }
        .db-cpd-tasks-label {
          font-size: 0.75rem; font-weight: 800; color: #059669;
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }
        .db-cpd-task-item {
          font-size: 0.85rem; color: #374151;
          padding: 0.4rem 0.75rem;
          background: white; border-radius: 8px;
          border: 1px solid #e2e8f0;
          margin-bottom: 0.35rem;
        }

        /* Empty state */
        .db-empty {
          padding: 2.5rem; text-align: center; color: #94a3b8;
        }
        .db-empty-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          margin-top: 1rem; background: #065f46; color: white;
          border: none; border-radius: 10px; padding: 0.65rem 1.25rem;
          font-weight: 700; font-size: 0.9rem; cursor: pointer;
          transition: all 0.15s;
        }
        .db-empty-btn:hover { background: #047857; transform: translateY(-1px); }
      `}</style>

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Farmer Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's an overview of your farm metrics.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
           <MapPin size={16} color="var(--color-primary)" />
           <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
             {weatherLoading ? 'Locating...' : locationName}
           </span>
        </div>
      </div>

      {/* Metric Cards (Live Weather Integration) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Current Temp</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
                {weatherLoading ? '...' : weatherError ? '--' : `${Math.round(weather?.temp)}°C`}
              </h2>
              {!weatherLoading && !weatherError && weather?.desc && (
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                     {weather.desc}
                  </p>
              )}
            </div>
             {weather?.main === 'Rain' ? (
                <CloudRain size={32} color="#3b82f6" />
              ) : weather?.main === 'Clear' ? (
                <Sun size={32} color="#f59e0b" />
              ) : (
                <ThermometerSun size={32} color="var(--color-accent)" />
              )}
          </div>
        </Card>
        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Humidity</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
                {weatherLoading ? '...' : weatherError ? '--' : `${weather?.humidity}%`}
              </h2>
            </div>
            <CloudRain size={32} color="#0284c7" />
          </div>
        </Card>
        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Wind Speed</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>
                {weatherLoading ? '...' : weatherError ? '--' : `${Math.round(weather?.windSpeed)} km/h`}
              </h2>
            </div>
            <Wind size={32} color="#fcd34d" />
          </div>
        </Card>
        <Card hoverable className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Active Crops</p>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{crops.length}</h2>
            </div>
            <Leaf size={32} color="var(--color-primary)" />
          </div>
        </Card>
      </div>

      {/* ── Full Lifecycle Roadmap ── */}
      <div className="db-crops-roadmap">
        <div className="db-roadmap-header">
          <div className="db-roadmap-header-left">
            <div className="db-roadmap-icon">🗺️</div>
            <div>
              <p className="db-roadmap-title">Full Crop Lifecycle Roadmap</p>
              <p className="db-roadmap-sub">
                {crops.length > 0
                  ? `${crops.length} crop${crops.length > 1 ? 's' : ''} tracked · from planting to harvest`
                  : 'Add crops to track their full lifecycle'}
              </p>
            </div>
          </div>
          <button className="db-view-all" onClick={() => navigate('/my-crops')}>
            My Crops <ChevronRight size={14} />
          </button>
        </div>

        {crops.length === 0 ? (
          <div className="db-empty">
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🌱</div>
            <p style={{ margin: 0, fontWeight: '700', color: '#475569', fontSize: '1rem' }}>No active crops yet</p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
              Add a crop from My Crops page and its full lifecycle will appear here automatically.
            </p>
            <button className="db-empty-btn" onClick={() => navigate('/my-crops')}>
              <Leaf size={16} /> Add Your First Crop
            </button>
          </div>
        ) : (
          <>
            {/* Crop tabs */}
            <div className="db-crop-tabs">
              {crops.map(crop => (
                <button
                  key={crop._id}
                  className={`db-crop-tab ${selectedCrop?._id === crop._id ? 'db-tab-active' : ''}`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <span>{getCropEmoji(crop.name)}</span>
                  {crop.name}
                </button>
              ))}
            </div>

            {/* Lifecycle roadmap for selected crop */}
            {renderLifecycleRoadmap()}
          </>
        )}
      </div>

      {/* Analytics Chart */}
      <div style={{ marginTop: '2rem' }}>
        <CropYieldChart />
      </div>

      {/* AI Insights */}
      <Card title="AI Insights" style={{ marginTop: '2rem' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Based on recent weather patterns, we recommend increasing irrigation for your Tomato crops by 15% today.
        </p>
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 'var(--border-radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
          ✅ Optimal time to water: 6:00 PM - 8:00 PM
        </div>
      </Card>
    </div>
  );
};
