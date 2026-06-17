import { Router, type IRouter } from "express";
import { GetDiseaseJourneyBody, GetDiseaseJourneyResponse } from "@workspace/api-zod";
import { groqChat, isAiAvailable } from "../lib/groq";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are CureCheck's Disease Journey Guide — a non-diagnostic AI assistant that helps Indian patients and families understand what typically happens after a medical diagnosis.

You NEVER diagnose, prescribe, or replace a doctor. You provide EDUCATIONAL information only.

Respond ONLY with a JSON object matching this exact schema:
{
  "disease": <string>,
  "ageGroup": <string>,
  "overview": <string — 2-3 sentence overview of the condition>,
  "phases": [
    {
      "phase": <"initial"|"monitoring"|"treatment"|"recovery"|"ongoing_management">,
      "title": <string — short title for this phase>,
      "description": <string — 2-3 sentences about what happens in this phase>,
      "duration": <string — typical duration, e.g. "2-4 weeks">,
      "commonExperiences": <string[] — 4-5 things patients commonly experience>,
      "warningSignsToWatch": <string[] — 3-4 warning signs that require immediate attention>
    }
  ],
  "commonQuestions": <string[] — 5-6 questions patients commonly ask about this disease>,
  "supportResources": <string[] — 3-4 types of support available in India>,
  "disclaimer": "This information is educational only and describes general patterns. Every patient's journey is unique. Always follow the guidance of your treating physician."
}

Guidelines:
- Include 4-5 meaningful phases relevant to the specific disease
- Be realistic and empathetic — acknowledge emotional and practical challenges, not just medical facts
- Include India-specific context (e.g. cost considerations, government health schemes like PMJAY, specialist availability in tier 2/3 cities)
- Use simple, accessible language — avoid excessive medical jargon
- For pediatric (child/teen) age groups, include family guidance and school considerations
- For senior age groups, include caregiver guidance and comorbidity considerations`;

function getMockDiseaseJourney(disease: string, ageGroup: string) {
  const diseaseLower = disease.toLowerCase();
  const isTypeTwo = diseaseLower.includes("diabetes") || diseaseLower.includes("type 2");
  const isThyroid = diseaseLower.includes("thyroid") || diseaseLower.includes("hypothyroid");
  const isHypertension =
    diseaseLower.includes("hypertension") ||
    diseaseLower.includes("high blood pressure") ||
    diseaseLower.includes("bp");

  if (isTypeTwo || disease.toLowerCase() === "diabetes") {
    return {
      disease: "Type 2 Diabetes",
      ageGroup,
      overview:
        "Type 2 diabetes is a chronic condition where the body either does not produce enough insulin or does not use it effectively, leading to high blood sugar levels. It is highly manageable with the right lifestyle changes and medication. Many people in India are diagnosed between ages 40-60, though younger diagnoses are increasingly common.",
      phases: [
        {
          phase: "initial",
          title: "Diagnosis and First Steps",
          description:
            "After diagnosis through blood tests (HbA1c, fasting glucose), you will typically meet with a physician or endocrinologist to understand your numbers and start an initial management plan. This is often an emotionally challenging time as you process the news.",
          duration: "First 4-8 weeks",
          commonExperiences: [
            "Shock, anxiety, or denial about the diagnosis",
            "Learning what blood sugar levels mean",
            "Starting dietary modifications — reducing refined carbs and sugars",
            "Beginning prescribed medication (often Metformin)",
            "Home blood glucose monitoring setup",
          ],
          warningSignsToWatch: [
            "Blood sugar consistently above 300 mg/dL",
            "Unusual fatigue, extreme thirst, or frequent urination that worsens",
            "Any signs of diabetic ketoacidosis: fruity breath, nausea, confusion",
          ],
        },
        {
          phase: "monitoring",
          title: "Regular Monitoring Phase",
          description:
            "Once initial treatment begins, regular monitoring becomes your routine. You will track blood glucose at home and visit your doctor every 3 months for HbA1c testing. This phase helps establish your baseline and fine-tune your management plan.",
          duration: "Ongoing from diagnosis",
          commonExperiences: [
            "Learning to use a glucometer for daily readings",
            "HbA1c test every 3 months",
            "Annual eye exam (retinopathy screening)",
            "Kidney function tests (creatinine, urine microalbumin)",
            "Foot examination every 6-12 months",
          ],
          warningSignsToWatch: [
            "HbA1c consistently above 8% despite medication",
            "Hypoglycemia symptoms: sweating, trembling, confusion",
            "Changes in vision or any foot wounds that heal slowly",
          ],
        },
        {
          phase: "treatment",
          title: "Treatment Optimization",
          description:
            "For many patients, treatment may need to be adjusted over time. Some patients do well with oral medications alone, while others may eventually need insulin. This phase involves working closely with your doctor to find the right combination.",
          duration: "Ongoing — may evolve over years",
          commonExperiences: [
            "Medication adjustments based on HbA1c results",
            "Working with a dietitian for a personalized Indian meal plan",
            "Starting or increasing exercise — even 30 min walking daily helps",
            "Some patients starting insulin injections",
            "Learning to handle sick days and medication timing",
          ],
          warningSignsToWatch: [
            "Frequent hypoglycemia episodes",
            "Unexplained weight loss or gain",
            "New symptoms like numbness, tingling, or burning in feet",
          ],
        },
        {
          phase: "ongoing_management",
          title: "Long-Term Management and Prevention of Complications",
          description:
            "Diabetes is a lifelong condition, but with good management, you can live a full, healthy life and significantly reduce the risk of complications like neuropathy, nephropathy, and retinopathy. The goal shifts to sustaining your progress and protecting your organs.",
          duration: "Lifelong",
          commonExperiences: [
            "Annual comprehensive diabetes review with your doctor",
            "Building a sustainable diet that fits Indian food culture",
            "Community support — diabetes support groups are available in most cities",
            "Managing diabetes during festivals and family occasions",
            "Maintaining mental health — diabetes distress is common and treatable",
          ],
          warningSignsToWatch: [
            "Any new vision problems or eye pain",
            "Swelling in legs or foamy urine (kidney signs)",
            "Chest pain or shortness of breath (cardiac risk)",
            "Non-healing wounds especially on feet",
          ],
        },
      ],
      commonQuestions: [
        "Can I ever stop taking diabetes medication?",
        "Is diabetes genetic? Will my children get it?",
        "What is a good HbA1c target for me?",
        "Can I eat rice and roti? What foods should I avoid?",
        "Is diabetes covered under Ayushman Bharat (PMJAY)?",
        "How do I manage diabetes during Navratri fasting or Ramadan?",
      ],
      supportResources: [
        "Diabetes India (diabetesindia.com) — national patient community and resources",
        "Ayushman Bharat PMJAY — government scheme that covers some diabetes complications",
        "Dietitian consultation — essential for Indian-diet-specific guidance",
        "Endocrinologist referral — most government hospitals have endocrinology departments",
      ],
      disclaimer:
        "This information is educational only and describes general patterns. Every patient's journey is unique. Always follow the guidance of your treating physician.",
    };
  }

  if (isThyroid) {
    return {
      disease: "Hypothyroidism",
      ageGroup,
      overview:
        "Hypothyroidism is a condition where the thyroid gland does not produce enough thyroid hormones, slowing down many body functions. It is very common in India, especially among women. The good news is it is very well managed with a once-daily tablet (Levothyroxine) and regular monitoring.",
      phases: [
        {
          phase: "initial",
          title: "Diagnosis and Starting Treatment",
          description:
            "Hypothyroidism is usually diagnosed through a TSH blood test, often after symptoms like fatigue, weight gain, or feeling cold all the time. Starting the right dose of Levothyroxine is the first step toward feeling better.",
          duration: "First 6-8 weeks",
          commonExperiences: [
            "TSH, T3, T4 blood tests to confirm diagnosis",
            "Starting Levothyroxine — typically taken on empty stomach in the morning",
            "Symptoms may take 4-6 weeks to improve after starting medication",
            "Understanding that this is a lifelong but manageable condition",
            "Learning about foods that affect thyroid function (soy, certain vegetables in excess)",
          ],
          warningSignsToWatch: [
            "Heart palpitations or chest pain after starting medication",
            "Extreme fatigue or confusion not improving after 8 weeks",
            "Significant swelling in neck area",
          ],
        },
        {
          phase: "monitoring",
          title: "Dose Adjustment Phase",
          description:
            "The correct dose of Levothyroxine is very individual and takes time to get right. Expect 2-3 dose adjustments in the first year based on TSH blood tests every 6-8 weeks until you are stable.",
          duration: "First 6-12 months",
          commonExperiences: [
            "TSH test every 6-8 weeks while adjusting dose",
            "Gradual improvement in energy, mood, and weight",
            "Learning proper medication timing (30-60 mins before breakfast)",
            "Possible dose changes during pregnancy — very important to monitor",
            "Noticing which symptoms have improved and which persist",
          ],
          warningSignsToWatch: [
            "Symptoms of over-replacement: anxiety, rapid heartbeat, tremors",
            "No improvement in symptoms after 3 months at stable dose",
            "Missed periods or fertility concerns in women of reproductive age",
          ],
        },
        {
          phase: "ongoing_management",
          title: "Stable Long-Term Management",
          description:
            "Once your TSH is in the target range and you are on a stable dose, management becomes a simple routine. Most people feel completely normal and live full lives. Annual monitoring is all that is typically needed.",
          duration: "Lifelong",
          commonExperiences: [
            "TSH test every 6-12 months once stable",
            "Medication taken consistently every morning",
            "Annual lipid panel — hypothyroidism can affect cholesterol",
            "Dose may need adjustment with major life changes, pregnancy, or ageing",
            "Understanding that generic vs branded Levothyroxine can affect levels",
          ],
          warningSignsToWatch: [
            "Return of fatigue, weight gain, or other hypothyroid symptoms",
            "Significant hair loss or mood changes",
            "Any neck swelling or difficulty swallowing",
          ],
        },
      ],
      commonQuestions: [
        "Will I need to take Levothyroxine forever?",
        "Can I get pregnant with hypothyroidism?",
        "Does what I eat affect my thyroid?",
        "Is Hashimoto's the same as hypothyroidism?",
        "Can I take calcium or iron supplements with my thyroid tablet?",
        "Why does my TSH keep changing even on the same dose?",
      ],
      supportResources: [
        "Thyroid India patient community — online support groups",
        "Endocrinologist or physician — available at most district hospitals",
        "Government medicines — Levothyroxine is available under Jan Aushadhi scheme at very low cost",
        "Nutritionist consultation for thyroid-friendly diet planning",
      ],
      disclaimer:
        "This information is educational only and describes general patterns. Every patient's journey is unique. Always follow the guidance of your treating physician.",
    };
  }

  if (isHypertension) {
    return {
      disease: "Hypertension (High Blood Pressure)",
      ageGroup,
      overview:
        "Hypertension, or high blood pressure, is often called the 'silent killer' because it usually has no symptoms until serious damage has occurred. It is extremely common in India — affecting 1 in 3 adults. With medication and lifestyle changes, it is very well controlled.",
      phases: [
        {
          phase: "initial",
          title: "Diagnosis and Initial Assessment",
          description:
            "Hypertension is usually found incidentally during a routine check-up. Diagnosis requires blood pressure to be high on multiple readings, not just once. Your doctor will check for secondary causes and assess your overall cardiovascular risk.",
          duration: "First 2-4 weeks",
          commonExperiences: [
            "Multiple BP readings on different days to confirm diagnosis",
            "Blood tests: kidney function, blood sugar, cholesterol",
            "ECG to check heart",
            "Learning to measure blood pressure at home accurately",
            "Discussion of lifestyle changes before or alongside medication",
          ],
          warningSignsToWatch: [
            "BP above 180/120 — hypertensive crisis, seek immediate care",
            "Sudden severe headache, chest pain, or vision changes",
            "Any weakness or slurred speech — stroke symptoms",
          ],
        },
        {
          phase: "treatment",
          title: "Starting Treatment",
          description:
            "Treatment begins with lifestyle modifications — reducing salt, exercising, losing weight if needed, and limiting alcohol. Medication is usually added if lifestyle alone does not bring BP into range within 3-6 months, or immediately if BP is very high.",
          duration: "First 3-6 months",
          commonExperiences: [
            "Reducing salt intake — challenging in Indian cooking but very important",
            "Starting BP medication — amlodipine, telmisartan, or others",
            "Regular home BP monitoring",
            "Learning about the DASH diet adapted to Indian food",
            "Managing stress — yoga and meditation have evidence-based benefits",
          ],
          warningSignsToWatch: [
            "Side effects from medication: dry cough (ACE inhibitors), ankle swelling",
            "BP consistently above 140/90 despite medication",
            "Dizziness when standing — postural hypotension",
          ],
        },
        {
          phase: "ongoing_management",
          title: "Long-Term Control and Heart Protection",
          description:
            "Hypertension management is lifelong. The goal is not just a good BP reading, but protecting the heart, kidneys, and brain over decades. Regular monitoring, medication adherence, and lifestyle habits are all essential.",
          duration: "Lifelong",
          commonExperiences: [
            "BP check every 1-3 months depending on control",
            "Annual kidney function and cholesterol tests",
            "Consistent medication — never stopping without doctor's advice",
            "BP goals may differ for diabetics, elderly, or kidney disease patients",
            "Managing BP during temperature changes — BP is often higher in winter",
          ],
          warningSignsToWatch: [
            "Persistent headaches or visual disturbances",
            "Swelling in legs — may indicate heart or kidney complications",
            "Blood in urine — kidney involvement",
            "Any chest pain or breathlessness",
          ],
        },
      ],
      commonQuestions: [
        "Can I stop BP medicine if my numbers come back to normal?",
        "Is high BP genetic?",
        "How much salt is too much?",
        "Can yoga or meditation replace medication?",
        "What is a good target BP for my age?",
        "Can I drink chai or coffee with hypertension?",
      ],
      supportResources: [
        "Heart Care Foundation of India — patient education resources",
        "Jan Aushadhi scheme — generic BP medications at very low cost",
        "Cardiologist referral — available at government medical colleges",
        "Community health worker (ASHA) programs in rural areas for BP monitoring",
      ],
      disclaimer:
        "This information is educational only and describes general patterns. Every patient's journey is unique. Always follow the guidance of your treating physician.",
    };
  }

  return {
    disease: disease,
    ageGroup,
    overview: `${disease} is a medical condition that requires proper diagnosis and management by a qualified healthcare professional. The journey typically involves initial diagnosis, ongoing monitoring, appropriate treatment, and long-term management. Each patient's experience is unique based on their individual health profile, age, and other factors.`,
    phases: [
      {
        phase: "initial",
        title: "Diagnosis and Initial Assessment",
        description:
          "The first phase involves getting a confirmed diagnosis through appropriate tests and evaluations. Your doctor will gather your complete medical history, perform a physical examination, and order relevant investigations to understand your condition fully.",
        duration: "2-4 weeks",
        commonExperiences: [
          "Medical consultations and diagnostic tests",
          "Processing the emotional impact of a new diagnosis",
          "Learning about your condition from reliable sources",
          "Beginning initial treatment recommendations",
          "Informing close family members and building a support system",
        ],
        warningSignsToWatch: [
          "Any sudden worsening of symptoms",
          "New symptoms that were not present before",
          "Side effects from any newly prescribed medications",
        ],
      },
      {
        phase: "monitoring",
        title: "Regular Follow-up and Monitoring",
        description:
          "After initial diagnosis and treatment, regular monitoring ensures your condition is being managed effectively. Your doctor will adjust the treatment plan based on how you respond.",
        duration: "Ongoing",
        commonExperiences: [
          "Regular doctor visits and test monitoring",
          "Tracking symptoms and noting changes",
          "Adhering to prescribed medications consistently",
          "Making recommended lifestyle adjustments",
          "Learning to recognize when to seek urgent care",
        ],
        warningSignsToWatch: [
          "Sudden significant changes in symptoms",
          "Signs of treatment side effects",
          "Symptoms that are not improving as expected",
        ],
      },
      {
        phase: "treatment",
        title: "Active Treatment",
        description:
          "Based on your specific condition and severity, your doctor will recommend appropriate treatment. This may include medications, procedures, therapy, or a combination of approaches tailored to your needs.",
        duration: "Varies by condition",
        commonExperiences: [
          "Following the prescribed treatment plan consistently",
          "Managing treatment-related side effects",
          "Communication with your healthcare team about your response",
          "Making lifestyle changes to support treatment",
          "Seeking second opinions if needed for major decisions",
        ],
        warningSignsToWatch: [
          "Any allergic reactions to medications",
          "Symptoms significantly worsening during treatment",
          "New concerns that arise during treatment",
        ],
      },
      {
        phase: "recovery",
        title: "Recovery and Rehabilitation",
        description:
          "Many conditions have a recovery phase where the focus shifts from active treatment to rebuilding health and function. This phase varies greatly depending on the nature and severity of the condition.",
        duration: "Weeks to months",
        commonExperiences: [
          "Gradual return to normal activities",
          "Physical and emotional recovery",
          "Possible physiotherapy or rehabilitation",
          "Building long-term healthy habits",
          "Regular check-ups to confirm recovery",
        ],
        warningSignsToWatch: [
          "Relapse of original symptoms",
          "New symptoms developing during recovery",
          "Emotional difficulties like anxiety or depression",
        ],
      },
    ],
    commonQuestions: [
      "What caused this condition and could I have prevented it?",
      "What are my treatment options and which is best for me?",
      "How long will treatment take and what are the expected outcomes?",
      "Are there lifestyle changes that will help my recovery?",
      "What support is available for me and my family in India?",
    ],
    supportResources: [
      "Government health schemes — Ayushman Bharat PMJAY covers many conditions",
      "National health helpline — 104 for health advice",
      "District and government hospitals for specialist consultations",
      "Patient support groups — available in most major Indian cities",
    ],
    disclaimer:
      "This information is educational only and describes general patterns. Every patient's journey is unique. Always follow the guidance of your treating physician.",
  };
}

router.post("/disease-journey", async (req, res): Promise<void> => {
  const parsed = GetDiseaseJourneyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { disease, ageGroup } = parsed.data;
  const hasAi = isAiAvailable();

  try {
    let result;

    if (hasAi) {
      req.log.info({ disease, ageGroup }, "Generating disease journey with Groq");
      const raw = await groqChat(
        SYSTEM_PROMPT,
        `Generate a disease journey map for: Disease: "${disease}", Age Group: "${ageGroup}"`,
      );
      result = JSON.parse(raw);
    } else {
      req.log.info("GROQ_API_KEY not set, using mock response");
      result = getMockDiseaseJourney(disease, ageGroup);
      await new Promise((r) => setTimeout(r, 1500));
    }

    const validated = GetDiseaseJourneyResponse.parse(result);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Failed to generate disease journey");
    const mockResult = getMockDiseaseJourney(disease, ageGroup);
    const validated = GetDiseaseJourneyResponse.parse(mockResult);
    res.json(validated);
  }
});

export default router;
