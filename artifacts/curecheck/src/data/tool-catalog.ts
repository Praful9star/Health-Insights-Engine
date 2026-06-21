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
      { href: "/report-explainer", icon: FileSearch, en: "Report Explainer", hi: "रिपोर्ट समझें", desc: { en: "Decode any blood test or lab report in plain language", hi: "ब्लड टेस्ट को सरल भाषा में समझें" }, accent: "text-primary", bg: "bg-primary/10" },
      { href: "/medicine-explainer", icon: Pill, en: "Medicine Guide", hi: "दवा गाइड", desc: { en: "Uses, side effects and best timing for any medicine", hi: "किसी भी दवा के उपयोग और दुष्प्रभाव जानें" }, accent: "text-violet-400", bg: "bg-violet-500/10" },
      { href: "/symptom-checker", icon: Stethoscope, en: "Symptom Checker", hi: "लक्षण जांच", desc: { en: "Describe your symptoms and get possible causes", hi: "लक्षण बताएं और संभावित कारण जानें" }, accent: "text-sky-400", bg: "bg-sky-500/10" },
      { href: "/disease-journey", icon: Activity, en: "Disease Journey", hi: "रोग यात्रा", desc: { en: "Understand a diagnosis from symptoms to recovery", hi: "निदान से ठीक होने तक की यात्रा समझें" }, accent: "text-violet-400", bg: "bg-violet-500/10" },
      { href: "/claim-checker", icon: FlaskConical, en: "Claim Checker", hi: "दावा जांच", desc: { en: "Verify health claims from WhatsApp forwards with science", hi: "WhatsApp forwards को विज्ञान से जांचें" }, accent: "text-rose-400", bg: "bg-rose-500/10" },
      { href: "/drug-interaction", icon: Pill, en: "Drug Interactions", hi: "दवा इंटरेक्शन", desc: { en: "Check if medicines are safe to take together", hi: "दवाएं एक साथ लेना सुरक्षित है या नहीं" }, accent: "text-red-400", bg: "bg-red-500/10" },
      { href: "/doctor-prep", icon: BookOpen, en: "Doctor Visit Prep", hi: "डॉक्टर तैयारी", desc: { en: "Prepare the right questions before your appointment", hi: "डॉक्टर से मिलने से पहले सही सवाल तैयार करें" }, accent: "text-indigo-400", bg: "bg-indigo-500/10" },
    ],
  },
  {
    key: "daily",
    label: { en: "Daily Health", hi: "दैनिक स्वास्थ्य" },
    accent: "text-amber-400",
    tools: [
      { href: "/fitness-hub", icon: Dumbbell, en: "Fitness Hub", hi: "फिटनेस हब", desc: { en: "Daily fitness score, streak tracker and Indian diet plans", hi: "रोज़ फिटनेस स्कोर, स्ट्रीक और डाइट प्लान" }, accent: "text-amber-400", bg: "bg-amber-500/10" },
      { href: "/health-timeline", icon: Clock, en: "Health Timeline", hi: "स्वास्थ्य टाइमलाइन", desc: { en: "Track your Hemoglobin, Blood Sugar and other values over time", hi: "हीमोग्लोबिन और शुगर के रुझान ट्रैक करें" }, accent: "text-emerald-400", bg: "bg-emerald-500/10" },
      { href: "/calculators", icon: Calculator, en: "Health Calculators", hi: "कैलकुलेटर", desc: { en: "BMI, ideal weight, calorie needs and other health numbers", hi: "BMI, वजन, कैलोरी और अन्य स्वास्थ्य संख्याएं" }, accent: "text-teal-400", bg: "bg-teal-500/10" },
      { href: "/myth-buster", icon: TrendingUp, en: "Myth Buster", hi: "मिथक बस्टर", desc: { en: "Bust common health myths with real science", hi: "आम स्वास्थ्य मिथकों को विज्ञान से तोड़ें" }, accent: "text-rose-400", bg: "bg-rose-500/10" },
      { href: "/weather", icon: Wind, en: "Weather & Health", hi: "मौसम", desc: { en: "Health tips personalised to today's weather and air quality", hi: "आज के मौसम के अनुसार स्वास्थ्य सुझाव" }, accent: "text-sky-400", bg: "bg-sky-500/10" },
    ],
  },
  {
    key: "reference",
    label: { en: "Reference", hi: "संदर्भ" },
    accent: "text-emerald-400",
    tools: [
      { href: "/hospitals", icon: MapPin, en: "Hospital Finder", hi: "अस्पताल खोजें", desc: { en: "Locate hospitals, clinics and specialists near you", hi: "नजदीकी अस्पताल और विशेषज्ञ खोजें" }, accent: "text-emerald-400", bg: "bg-emerald-500/10" },
      { href: "/vaccines", icon: Syringe, en: "Vaccine Schedule", hi: "टीकाकरण", desc: { en: "India's recommended vaccines by age group", hi: "उम्र के अनुसार भारत का अनुशंसित टीकाकरण" }, accent: "text-cyan-400", bg: "bg-cyan-500/10" },
      { href: "/ayurveda", icon: Leaf, en: "Ayurveda Guide", hi: "आयुर्वेद", desc: { en: "Classical Ayurvedic remedies, herbs and wellness tips", hi: "आयुर्वेदिक उपचार, जड़ी-बूटियां और मार्गदर्शन" }, accent: "text-lime-400", bg: "bg-lime-500/10" },
      { href: "/insurance", icon: Shield, en: "Insurance Guide", hi: "बीमा गाइड", desc: { en: "Understand health insurance, claims and Ayushman Bharat", hi: "स्वास्थ्य बीमा और आयुष्मान भारत समझें" }, accent: "text-indigo-400", bg: "bg-indigo-500/10" },
      { href: "/pregnancy", icon: Baby, en: "Pregnancy Tracker", hi: "गर्भावस्था", desc: { en: "Week-by-week milestones, tests and care tips", hi: "सप्ताह-दर-सप्ताह गर्भावस्था मील के पत्थर" }, accent: "text-pink-400", bg: "bg-pink-500/10" },
    ],
  },
  {
    key: "emergency",
    label: { en: "Emergency & Support", hi: "आपातकाल" },
    accent: "text-rose-400",
    tools: [
      { href: "/emergency", icon: PhoneCall, en: "Emergency & First Aid", hi: "आपातकाल", desc: { en: "India emergency numbers and step-by-step first aid guides", hi: "भारत के आपातकालीन नंबर और प्राथमिक उपचार" }, accent: "text-orange-400", bg: "bg-orange-500/10" },
      { href: "/mental-health", icon: Brain, en: "Mental Health", hi: "मानसिक स्वास्थ्य", desc: { en: "Resources, helplines and guidance for mental wellbeing", hi: "मानसिक स्वास्थ्य के लिए संसाधन और हेल्पलाइन" }, accent: "text-purple-400", bg: "bg-purple-500/10" },
      { href: "/news", icon: Newspaper, en: "Health News", hi: "स्वास्थ्य समाचार", desc: { en: "Latest India health news, alerts and public health updates", hi: "भारत की ताजा स्वास्थ्य खबरें और अलर्ट" }, accent: "text-amber-400", bg: "bg-amber-500/10" },
    ],
  },
];

export const ALL_TOOLS = TOOL_CATEGORIES.flatMap(c => c.tools);
