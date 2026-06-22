import {
  FileSearch, Pill, Stethoscope, Activity, FlaskConical,
  Dumbbell, Clock, Calculator, TrendingUp, Wind,
  MapPin, Syringe, Leaf, Shield, Baby,
  PhoneCall, Brain, Newspaper, BookOpen,
} from "lucide-react";
import type { ElementType } from "react";

export interface Tool {
  href: string;
  icon: ElementType;
  en: string;
  hi: string;
  desc: { en: string; hi: string };
  accent: string;
  bg: string;
  /** Synonyms and clinical terms that map this tool to real-world queries. */
  keywords: string[];
}

export interface ToolCategory {
  key: string;
  label: { en: string; hi: string };
  accent: string;
  defaultOpen?: boolean;
  tools: Tool[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    key: "ai",
    label: { en: "AI Tools", hi: "AI टूल्स" },
    accent: "text-primary",
    defaultOpen: true,
    tools: [
      { href: "/report-explainer", icon: FileSearch, en: "Report Explainer", hi: "रिपोर्ट समझें", desc: { en: "Decode any blood test or lab report in plain language", hi: "ब्लड टेस्ट को सरल भाषा में समझें" }, accent: "text-primary", bg: "bg-primary/10", keywords: ["blood test", "lab report", "cbc", "thyroid", "hemoglobin", "haemoglobin", "cholesterol", "creatinine", "glucose", "blood sugar", "hba1c", "lipid", "liver function", "kidney", "vitamin d", "iron", "anemia", "anaemia", "platelet", "wbc", "rbc", "blood count", "pathology", "diagnostic", "test result", "bilirubin", "uric acid", "sgot", "sgpt", "tsh", "t3", "t4", "esr", "ferritin", "calcium", "sodium", "potassium"] },
      { href: "/medicine-explainer", icon: Pill, en: "Medicine Guide", hi: "दवा गाइड", desc: { en: "Uses, side effects and best timing for any medicine", hi: "किसी भी दवा के उपयोग और दुष्प्रभाव जानें" }, accent: "text-violet-400", bg: "bg-violet-500/10", keywords: ["tablet", "capsule", "drug", "medication", "prescription", "dose", "dosage", "side effect", "paracetamol", "metformin", "atorvastatin", "amlodipine", "antibiotic", "medicine", "dolo", "crocin", "pantoprazole", "omeprazole", "azithromycin", "amoxicillin", "cetirizine", "aspirin", "ibuprofen", "thyronorm", "levothyroxine", "insulin", "inhaler"] },
      { href: "/symptom-checker", icon: Stethoscope, en: "Symptom Checker", hi: "लक्षण जांच", desc: { en: "Describe your symptoms and get possible causes", hi: "लक्षण बताएं और संभावित कारण जानें" }, accent: "text-sky-400", bg: "bg-sky-500/10", keywords: ["fever", "pain", "cough", "cold", "headache", "stomach ache", "nausea", "vomiting", "diarrhea", "loose motion", "chest pain", "breathe", "shortness of breath", "fatigue", "tired", "dizziness", "rash", "swelling", "sore throat", "runny nose", "back pain", "joint pain", "weakness", "burning", "itching", "symptom", "sick", "illness", "unwell", "body ache"] },
      { href: "/disease-journey", icon: Activity, en: "Disease Journey", hi: "रोग यात्रा", desc: { en: "Understand a diagnosis from symptoms to recovery", hi: "निदान से ठीक होने तक की यात्रा समझें" }, accent: "text-violet-400", bg: "bg-violet-500/10", keywords: ["diabetes", "hypertension", "blood pressure", "cancer", "asthma", "arthritis", "heart disease", "thyroid", "condition", "diagnosis", "chronic", "stage", "treatment", "recovery", "dengue", "malaria", "tuberculosis", "tb", "hiv", "copd", "alzheimer", "parkinson", "epilepsy", "pcod", "pcos"] },
      { href: "/claim-checker", icon: FlaskConical, en: "Claim Checker", hi: "दावा जांच", desc: { en: "Verify health claims from WhatsApp forwards with science", hi: "WhatsApp forwards को विज्ञान से जांचें" }, accent: "text-rose-400", bg: "bg-rose-500/10", keywords: ["whatsapp", "forward", "fake news", "health claim", "turmeric", "haldi", "giloy", "ayurveda", "verify", "fact check", "home remedy", "myth", "true or false", "viral message", "misinformation", "is it true"] },
      { href: "/drug-interaction", icon: Pill, en: "Drug Interactions", hi: "दवा इंटरेक्शन", desc: { en: "Check if medicines are safe to take together", hi: "दवाएं एक साथ लेना सुरक्षित है या नहीं" }, accent: "text-red-400", bg: "bg-red-500/10", keywords: ["drug interaction", "medicine combination", "safe together", "contraindication", "combine medicine", "two medicines", "multiple medicines", "mixing drugs", "medicine reaction", "combination"] },
      { href: "/doctor-prep", icon: BookOpen, en: "Doctor Visit Prep", hi: "डॉक्टर तैयारी", desc: { en: "Prepare the right questions before your appointment", hi: "डॉक्टर से मिलने से पहले सही सवाल तैयार करें" }, accent: "text-indigo-400", bg: "bg-indigo-500/10", keywords: ["doctor appointment", "doctor visit", "consultation", "questions for doctor", "prepare for doctor", "hospital visit", "specialist", "OPD", "what to ask doctor", "appointment prep"] },
    ],
  },
  {
    key: "daily",
    label: { en: "Daily Health", hi: "दैनिक स्वास्थ्य" },
    accent: "text-amber-400",
    tools: [
      { href: "/fitness-hub", icon: Dumbbell, en: "Fitness Hub", hi: "फिटनेस हब", desc: { en: "Daily fitness score, streak tracker and Indian diet plans", hi: "रोज़ फिटनेस स्कोर, स्ट्रीक और डाइट प्लान" }, accent: "text-amber-400", bg: "bg-amber-500/10", keywords: ["exercise", "workout", "diet", "nutrition", "calories", "weight loss", "bmi", "steps", "yoga", "gym", "fitness", "health goals", "daily fitness", "walk", "run", "jogging", "Indian diet", "keto", "protein", "lose weight", "gain weight", "strength"] },
      { href: "/health-timeline", icon: Clock, en: "Health Timeline", hi: "स्वास्थ्य टाइमलाइन", desc: { en: "Track your Hemoglobin, Blood Sugar and other values over time", hi: "हीमोग्लोबिन और शुगर के रुझान ट्रैक करें" }, accent: "text-emerald-400", bg: "bg-emerald-500/10", keywords: ["track health", "health history", "past report", "previous test", "trend", "hemoglobin trend", "blood sugar trend", "timeline", "history", "over time", "health record", "monitor", "log"] },
      { href: "/calculators", icon: Calculator, en: "Health Calculators", hi: "कैलकुलेटर", desc: { en: "BMI, ideal weight, calorie needs and other health numbers", hi: "BMI, वजन, कैलोरी और अन्य स्वास्थ्य संख्याएं" }, accent: "text-teal-400", bg: "bg-teal-500/10", keywords: ["bmi", "body mass index", "calorie calculator", "ideal weight", "calorie need", "water intake", "heart rate", "calculate", "overweight", "obesity", "tdee", "calories per day"] },
      { href: "/myth-buster", icon: TrendingUp, en: "Myth Buster", hi: "मिथक बस्टर", desc: { en: "Bust common health myths with real science", hi: "आम स्वास्थ्य मिथकों को विज्ञान से तोड़ें" }, accent: "text-rose-400", bg: "bg-rose-500/10", keywords: ["myth", "turmeric cure", "giloy", "home remedy", "ayurveda myth", "health myth", "science", "fact", "debunk", "is it true", "misconception", "old wives tale", "popular belief"] },
      { href: "/weather", icon: Wind, en: "Weather & Health", hi: "मौसम", desc: { en: "Health tips personalised to today's weather and air quality", hi: "आज के मौसम के अनुसार स्वास्थ्य सुझाव" }, accent: "text-sky-400", bg: "bg-sky-500/10", keywords: ["air quality", "aqi", "pollution", "weather health", "pollen", "humidity", "heat", "monsoon health", "smog", "cold weather", "hot weather", "season", "dust allergy"] },
    ],
  },
  {
    key: "reference",
    label: { en: "Reference", hi: "संदर्भ" },
    accent: "text-emerald-400",
    tools: [
      { href: "/hospitals", icon: MapPin, en: "Hospital Finder", hi: "अस्पताल खोजें", desc: { en: "Locate hospitals, clinics and specialists near you", hi: "नजदीकी अस्पताल और विशेषज्ञ खोजें" }, accent: "text-emerald-400", bg: "bg-emerald-500/10", keywords: ["hospital", "clinic", "doctor near me", "specialist near", "opd", "emergency hospital", "find hospital", "aiims", "government hospital", "private hospital", "nursing home", "dispensary", "health centre", "nearby"] },
      { href: "/vaccines", icon: Syringe, en: "Vaccine Schedule", hi: "टीकाकरण", desc: { en: "India's recommended vaccines by age group", hi: "उम्र के अनुसार भारत का अनुशंसित टीकाकरण" }, accent: "text-cyan-400", bg: "bg-cyan-500/10", keywords: ["vaccine", "vaccination", "immunization", "immunisation", "covid vaccine", "polio", "hepatitis", "flu shot", "booster", "tetanus", "schedule", "children vaccine", "baby vaccine", "mmr", "typhoid vaccine", "rabies", "hpv", "cervical cancer vaccine"] },
      { href: "/ayurveda", icon: Leaf, en: "Ayurveda Guide", hi: "आयुर्वेद", desc: { en: "Classical Ayurvedic remedies, herbs and wellness tips", hi: "आयुर्वेदिक उपचार, जड़ी-बूटियां और मार्गदर्शन" }, accent: "text-lime-400", bg: "bg-lime-500/10", keywords: ["ayurveda", "herbal", "home remedy", "neem", "ashwagandha", "triphala", "giloy", "tulsi", "brahmi", "shilajit", "traditional medicine", "natural remedy", "jadi booti", "panchakarma", "vata pitta kapha"] },
      { href: "/insurance", icon: Shield, en: "Insurance Guide", hi: "बीमा गाइड", desc: { en: "Understand health insurance, claims and Ayushman Bharat", hi: "स्वास्थ्य बीमा और आयुष्मान भारत समझें" }, accent: "text-indigo-400", bg: "bg-indigo-500/10", keywords: ["health insurance", "mediclaim", "ayushman bharat", "pmjay", "insurance claim", "policy", "coverage", "premium", "tpa", "cashless", "reimbursement", "network hospital", "ESI", "CGHS"] },
      { href: "/pregnancy", icon: Baby, en: "Pregnancy Tracker", hi: "गर्भावस्था", desc: { en: "Week-by-week milestones, tests and care tips", hi: "सप्ताह-दर-सप्ताह गर्भावस्था मील के पत्थर" }, accent: "text-pink-400", bg: "bg-pink-500/10", keywords: ["pregnancy", "pregnant", "antenatal", "prenatal", "trimester", "delivery", "baby", "fetal", "maternity", "ANC", "ultrasound", "due date", "morning sickness", "labour", "c-section", "breastfeeding", "newborn", "delivery date"] },
    ],
  },
  {
    key: "emergency",
    label: { en: "Emergency & Support", hi: "आपातकाल" },
    accent: "text-rose-400",
    tools: [
      { href: "/emergency", icon: PhoneCall, en: "Emergency & First Aid", hi: "आपातकाल", desc: { en: "India emergency numbers and step-by-step first aid guides", hi: "भारत के आपातकालीन नंबर और प्राथमिक उपचार" }, accent: "text-orange-400", bg: "bg-orange-500/10", keywords: ["emergency", "first aid", "ambulance", "108", "112", "poison", "accident", "heart attack", "stroke", "CPR", "choking", "burn", "bleeding", "fracture", "unconscious", "snake bite", "drowning", "crisis", "urgent"] },
      { href: "/mental-health", icon: Brain, en: "Mental Health", hi: "मानसिक स्वास्थ्य", desc: { en: "Resources, helplines and guidance for mental wellbeing", hi: "मानसिक स्वास्थ्य के लिए संसाधन और हेल्पलाइन" }, accent: "text-purple-400", bg: "bg-purple-500/10", keywords: ["mental health", "depression", "anxiety", "stress", "helpline", "therapy", "counseling", "counselling", "suicide", "panic attack", "ptsd", "trauma", "iCall", "vandrevala", "loneliness", "mood", "phobia", "ocd", "bipolar", "schizophrenia", "emotional"] },
      { href: "/news", icon: Newspaper, en: "Health News", hi: "स्वास्थ्य समाचार", desc: { en: "Latest India health news, alerts and public health updates", hi: "भारत की ताजा स्वास्थ्य खबरें और अलर्ट" }, accent: "text-amber-400", bg: "bg-amber-500/10", keywords: ["news", "health news", "medical news", "India health", "drug approval", "outbreak", "epidemic", "pandemic", "health update", "latest", "today", "alert", "advisory"] },
    ],
  },
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap(c => c.tools);

/**
 * Score-ranked tool search over the full catalog.
 *
 * Scoring tiers (additive per matching word):
 *   Full query matches tool name exactly  → +200
 *   Full query substring in tool name     → +100
 *   Individual word in tool name          → +50
 *   Individual word in description        → +25
 *   Individual word in keywords array     → +15
 *
 * Returns up to 6 results sorted highest-score first.
 */
export function searchTools(query: string): Tool[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Split into words, discard single-char tokens (articles, etc.)
  const words = q.split(/\s+/).filter(w => w.length >= 2);
  if (!words.length) return [];

  const scored = ALL_TOOLS.map(tool => {
    const name = tool.en.toLowerCase();
    const desc = tool.desc.en.toLowerCase();
    const kw   = tool.keywords.join(" ").toLowerCase();

    let score = 0;

    // Exact full-query match against name
    if (name === q) score += 200;
    // Full query is a substring of name
    if (name.includes(q)) score += 100;
    // Full query is a substring of keywords blob
    if (kw.includes(q)) score += 60;

    // Per-word scoring
    for (const w of words) {
      if (name.includes(w)) score += 50;
      if (desc.includes(w)) score += 25;
      if (kw.includes(w))   score += 15;
    }

    return { tool, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(s => s.tool);
}
