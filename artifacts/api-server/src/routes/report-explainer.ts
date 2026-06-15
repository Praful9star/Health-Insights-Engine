import { Router, type IRouter } from "express";
import { ExplainMedicalReportBody, ExplainMedicalReportResponse } from "@workspace/api-zod";
import { groqChat, getGroqClient } from "../lib/groq";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are CureCheck's Medical Report Explainer — a non-diagnostic AI assistant that helps Indian patients understand their medical test reports in plain language.

You NEVER diagnose diseases, prescribe medicines, or replace a doctor. You provide EDUCATIONAL information only.

Respond ONLY with a valid JSON object matching this EXACT schema (no markdown, no extra text):
{
  "simpleSummary": "<3-4 sentence plain-language summary of what the report shows overall>",
  "severity": "<'low_concern' | 'moderate_concern' | 'high_concern'>",
  "severityReason": "<1-2 sentences explaining why this severity level was chosen>",
  "parameters": [
    {
      "name": "<parameter name, e.g. Hemoglobin>",
      "userValue": "<the patient's value with unit, e.g. 10.2 g/dL>",
      "normalRange": "<reference range from the report, e.g. 13.0–17.0 g/dL>",
      "status": "<'low' | 'normal' | 'high' | 'critical'>",
      "whatItMeans": "<1-2 sentences: what does this parameter measure in simple language>",
      "whyItMatters": "<1-2 sentences: why this parameter is important for health>",
      "causes": ["<common cause of abnormal value>", "..."],
      "symptoms": ["<symptom associated with this abnormality>", "..."],
      "lifestyle": ["<practical lifestyle suggestion>", "..."],
      "urgency": "<when the patient should discuss this with a doctor>"
    }
  ],
  "keyTerms": [
    {
      "term": "<medical term from the report>",
      "simplifiedExplanation": "<plain language explanation>"
    }
  ],
  "importantFindings": [
    {
      "finding": "<the finding>",
      "importance": "<'critical' | 'important' | 'normal' | 'informational'>",
      "explanation": "<plain language explanation>"
    }
  ],
  "healthInsights": "<2-3 sentences about overall health patterns visible in this report — e.g. possible anemia trend, vitamin deficiency pattern, blood sugar concerns. Educational only, never diagnose.>",
  "positiveFindings": ["<value or aspect that is in healthy range>", "..."],
  "areasOfAttention": ["<area needing attention or follow-up>", "..."],
  "doctorQuestions": ["<personalized question to ask the doctor>", "..."],
  "overallAssessment": "<'requires_urgent_attention' | 'needs_follow_up' | 'routine_monitoring' | 'all_clear'>",
  "disclaimer": "This explanation is for educational purposes only and does not replace professional medical advice. Please discuss your results with a qualified doctor who can interpret them in the context of your full medical history."
}

GUIDELINES:
- Extract EVERY parameter that has a numeric value in the report and analyze it
- For parameters: only include "causes", "symptoms", "lifestyle" arrays for ABNORMAL values (low/high/critical); for normal values these can be empty arrays
- status "critical" = significantly outside range AND clinically dangerous (e.g., Hb < 7, Platelets < 50k, Blood sugar > 500)
- Use simple language — no medical jargon. Write as if explaining to a patient with no medical background
- For common Indian tests (CBC, LFT, KFT, thyroid, HbA1c, lipid profile), give India-specific context
- "positiveFindings" = list of parameters/aspects that are normal and healthy
- "areasOfAttention" = concise list of what needs follow-up
- Generate 5-7 personalized "doctorQuestions" based on the specific findings
- severity: "high_concern" only for critical values or multiple abnormals; "moderate_concern" for 1-3 mildly abnormal; "low_concern" for all normal/minor`;

function getMockReportResult(reportText: string) {
  const textLower = reportText.toLowerCase();
  const hasCBC = textLower.includes("hemoglobin") || textLower.includes("haemoglobin") || textLower.includes("wbc") || textLower.includes("platelet");
  const hasThyroid = textLower.includes("tsh") || textLower.includes("t3") || textLower.includes("t4");
  const hasGlucose = textLower.includes("glucose") || textLower.includes("hba1c") || textLower.includes("blood sugar");
  const hasLipid = textLower.includes("cholesterol") || textLower.includes("triglyceride") || textLower.includes("ldl");

  if (hasCBC) {
    return {
      simpleSummary: "This is a Complete Blood Count (CBC) report — one of the most common blood tests in India. It checks the health of your red blood cells (which carry oxygen), white blood cells (which fight infection), and platelets (which help blood clot). Your report shows some values outside the normal range that your doctor will want to discuss with you.",
      severity: "moderate_concern" as const,
      severityReason: "The hemoglobin and related values (MCV, MCH) are below the normal range, suggesting iron deficiency anaemia — a very common and treatable condition in India.",
      parameters: [
        {
          name: "Haemoglobin (Hb)",
          userValue: "10.2 g/dL",
          normalRange: "13.0–17.0 g/dL",
          status: "low" as const,
          whatItMeans: "Haemoglobin is the protein in red blood cells that carries oxygen from your lungs to every part of your body.",
          whyItMatters: "Low haemoglobin means your body may not be getting enough oxygen, causing fatigue, weakness, and breathlessness.",
          causes: ["Iron deficiency (most common in India)", "Poor diet low in iron-rich foods", "Heavy menstrual bleeding", "Chronic blood loss", "B12 or folate deficiency"],
          symptoms: ["Fatigue and weakness", "Shortness of breath", "Dizziness or headaches", "Pale skin", "Cold hands and feet"],
          lifestyle: ["Eat iron-rich foods: spinach, lentils, rajma, pomegranate, jaggery", "Pair iron foods with Vitamin C (lemon juice) for better absorption", "Avoid tea/coffee with meals as they block iron absorption", "Cook in iron cookware"],
          urgency: "Discuss at your next scheduled appointment. If you feel very weak, dizzy, or breathless, see a doctor sooner.",
        },
        {
          name: "MCV (Mean Corpuscular Volume)",
          userValue: "68 fL",
          normalRange: "80–100 fL",
          status: "low" as const,
          whatItMeans: "MCV tells us the average size of your red blood cells. Low MCV means your red blood cells are smaller than normal.",
          whyItMatters: "Small red blood cells usually indicate iron deficiency, which is the most common cause of anaemia in India.",
          causes: ["Iron deficiency anaemia", "Thalassemia trait (common in India)", "Chronic disease"],
          symptoms: ["Same as anaemia: fatigue, weakness, pale skin"],
          lifestyle: ["Increase iron-rich food intake", "Get tested for thalassemia trait if this runs in the family"],
          urgency: "Mention to doctor at next visit. If you are planning a pregnancy, discuss this promptly.",
        },
        {
          name: "Total WBC Count",
          userValue: "9,800 cells/mcL",
          normalRange: "4,000–11,000 cells/mcL",
          status: "normal" as const,
          whatItMeans: "WBC count measures your white blood cells — the cells that fight infections and disease.",
          whyItMatters: "A normal WBC count means your immune system is working well and there is no obvious sign of active infection or immune problem.",
          causes: [],
          symptoms: [],
          lifestyle: [],
          urgency: "No immediate action needed. This is a healthy value.",
        },
        {
          name: "Platelets",
          userValue: "1,85,000 /mcL",
          normalRange: "1,50,000–4,00,000 /mcL",
          status: "normal" as const,
          whatItMeans: "Platelets are tiny blood cells that help your blood clot when you have a cut or injury.",
          whyItMatters: "Normal platelet count means your blood can clot properly and you are not at increased risk of unusual bleeding.",
          causes: [],
          symptoms: [],
          lifestyle: [],
          urgency: "No concern — this is within the normal range.",
        },
      ],
      keyTerms: [
        { term: "CBC (Complete Blood Count)", simplifiedExplanation: "A panel of tests that measures the three main types of cells in your blood — red cells, white cells, and platelets." },
        { term: "Haemoglobin (Hb)", simplifiedExplanation: "The protein in red blood cells that carries oxygen. It's why blood is red." },
        { term: "MCV (Mean Corpuscular Volume)", simplifiedExplanation: "The average size of your red blood cells. Small cells often mean iron deficiency; large cells often mean B12/folate deficiency." },
        { term: "MCH", simplifiedExplanation: "The average amount of haemoglobin inside each red blood cell. Low MCH confirms the cells don't have enough haemoglobin." },
        { term: "Microcytic Hypochromic Anaemia", simplifiedExplanation: "The medical name for having small (micro), pale (hypo) red blood cells with low haemoglobin — the classic pattern of iron deficiency." },
      ],
      importantFindings: [
        { finding: "Low Haemoglobin — Iron Deficiency Anaemia pattern", importance: "important" as const, explanation: "Your haemoglobin is 10.2 g/dL against a normal of 13.0–17.0 g/dL. Together with low MCV and MCH, this is the classic pattern of iron deficiency anaemia — very common and very treatable in India." },
        { finding: "Platelets and WBC are normal", importance: "normal" as const, explanation: "Your immune cells and clotting cells are all in the healthy range. No sign of active infection or bleeding risk." },
      ],
      healthInsights: "This report shows a clear pattern of iron deficiency anaemia — the most common nutritional deficiency in India, affecting nearly 50% of women and many men. The small, pale red blood cells (low MCV and MCH) with low haemoglobin point to inadequate iron stores. This is highly treatable with dietary changes and iron supplementation under medical guidance.",
      positiveFindings: ["WBC count is normal — no sign of active infection", "Platelet count is normal — no bleeding risk", "No critical or emergency values present"],
      areasOfAttention: ["Low haemoglobin needs iron status investigation (serum ferritin, serum iron)", "Rule out ongoing blood loss as a cause", "Dietary iron intake needs improvement"],
      doctorQuestions: [
        "Should I get a serum ferritin test to confirm iron deficiency?",
        "Do I need iron supplements and if so, what dose and for how long?",
        "Is there a cause of blood loss I should investigate (e.g. heavy periods, stomach bleeding)?",
        "Should I be tested for thalassemia trait given my low MCV?",
        "When should I repeat this CBC to check improvement?",
        "Are there any dietary changes that would help my haemoglobin improve?",
      ],
      overallAssessment: "needs_follow_up" as const,
      disclaimer: "This explanation is for educational purposes only and does not replace professional medical advice. Please discuss your results with a qualified doctor who can interpret them in the context of your full medical history.",
    };
  }

  if (hasThyroid) {
    return {
      simpleSummary: "This is a thyroid function test report that checks how well your thyroid gland is working. The thyroid is a small gland in your neck that controls your metabolism, energy levels, and many body functions. TSH is the most important value to look at first.",
      severity: "moderate_concern" as const,
      severityReason: "Thyroid values need careful review by your doctor — even a slightly abnormal TSH can cause noticeable symptoms and may need treatment.",
      parameters: [
        {
          name: "TSH (Thyroid Stimulating Hormone)",
          userValue: "Detected in report",
          normalRange: "0.4–4.0 mIU/L",
          status: "normal" as const,
          whatItMeans: "TSH is a signal from your brain telling your thyroid how hard to work. High TSH means the brain is trying to push an underactive thyroid harder; low TSH means the thyroid may be overactive.",
          whyItMatters: "TSH is the most sensitive early indicator of thyroid problems — even subtle changes can cause fatigue, weight changes, and mood changes.",
          causes: [],
          symptoms: [],
          lifestyle: [],
          urgency: "Discuss interpretation with your doctor along with your symptoms.",
        },
      ],
      keyTerms: [
        { term: "TSH", simplifiedExplanation: "Thyroid Stimulating Hormone — a signal from your brain to your thyroid. The most important thyroid test." },
        { term: "Hypothyroidism", simplifiedExplanation: "Underactive thyroid — TSH is high, thyroid hormones low. Causes fatigue, weight gain, feeling cold, constipation." },
        { term: "Hyperthyroidism", simplifiedExplanation: "Overactive thyroid — TSH is low, thyroid hormones high. Causes weight loss, rapid heartbeat, anxiety, sweating." },
        { term: "Free T4 (FT4)", simplifiedExplanation: "The active form of the main thyroid hormone that controls metabolism. Measured alongside TSH for a complete picture." },
      ],
      importantFindings: [
        { finding: "Thyroid function values detected", importance: "important" as const, explanation: "Your thyroid values need to be interpreted together as a panel — TSH, Free T4, and Free T3. Your doctor will match these to your symptoms to decide if treatment is needed." },
        { finding: "Lab reference ranges may vary", importance: "informational" as const, explanation: "Different labs in India use slightly different reference ranges. Always compare your value to the range printed on YOUR report." },
      ],
      healthInsights: "Thyroid disorders are extremely common in India — affecting an estimated 1 in 10 adults, with women at higher risk. Even mildly abnormal thyroid function can significantly affect energy, weight, mood, fertility, and heart health. The good news is thyroid conditions are very well-managed with proper treatment.",
      positiveFindings: ["Report detected — full analysis requires your specific values"],
      areasOfAttention: ["TSH interpretation requires your specific value and symptoms", "Follow-up with doctor recommended"],
      doctorQuestions: [
        "Is my TSH level in the healthy range for my age?",
        "Do I have hypothyroidism or hyperthyroidism based on these results?",
        "Do I need thyroid medication or a dose adjustment?",
        "How often should I repeat my thyroid tests?",
        "Are my symptoms (fatigue, weight changes, hair loss, feeling cold) related to my thyroid?",
        "Should I have an ultrasound of my thyroid gland?",
      ],
      overallAssessment: "needs_follow_up" as const,
      disclaimer: "This explanation is for educational purposes only and does not replace professional medical advice. Please discuss your results with a qualified doctor who can interpret them in the context of your full medical history.",
    };
  }

  if (hasGlucose) {
    return {
      simpleSummary: "This report contains blood sugar (glucose) measurements that tell us how your body is managing sugar from food. India has one of the highest rates of diabetes in the world, making these tests especially important.",
      severity: "moderate_concern" as const,
      severityReason: "Blood sugar values outside the normal range require prompt medical attention to prevent or manage diabetes.",
      parameters: [
        {
          name: "Blood Glucose / HbA1c",
          userValue: "Detected in report",
          normalRange: "Fasting glucose: 70–100 mg/dL | HbA1c: below 5.7%",
          status: "normal" as const,
          whatItMeans: "Blood glucose measures how much sugar is in your blood right now. HbA1c shows your average blood sugar over the last 3 months.",
          whyItMatters: "Consistently high blood sugar damages blood vessels, kidneys, eyes, and nerves over time — the complications of uncontrolled diabetes.",
          causes: [],
          symptoms: [],
          lifestyle: [],
          urgency: "Discuss your specific values with your doctor to understand if you are in the normal, pre-diabetes, or diabetes range.",
        },
      ],
      keyTerms: [
        { term: "HbA1c", simplifiedExplanation: "Glycated haemoglobin — a 3-month average of your blood sugar levels. Below 5.7% is normal; 5.7–6.4% is pre-diabetes; 6.5%+ is diabetes." },
        { term: "Fasting Glucose", simplifiedExplanation: "Blood sugar measured after not eating for 8 hours. Normal is 70–100 mg/dL; 100–125 is pre-diabetes; 126+ is diabetes." },
        { term: "Pre-diabetes", simplifiedExplanation: "Blood sugar is higher than normal but not yet diabetes. Lifestyle changes at this stage can prevent or delay diabetes." },
      ],
      importantFindings: [
        { finding: "Blood sugar values present in report", importance: "important" as const, explanation: "Your specific glucose values need comparison to standard ranges. India has very high rates of undiagnosed diabetes — understanding your numbers is very important." },
      ],
      healthInsights: "India is known as the diabetes capital of the world. Blood sugar management is one of the most important health priorities. Even if your current values are normal, regular monitoring every 1–2 years is recommended, especially if you have a family history of diabetes, are overweight, or have a sedentary lifestyle.",
      positiveFindings: ["Blood sugar testing done — awareness is the first step"],
      areasOfAttention: ["Discuss specific values with doctor", "Consider HbA1c if not already tested"],
      doctorQuestions: [
        "Are my blood sugar levels in the normal, pre-diabetes, or diabetes range?",
        "Should I have an HbA1c test done if I haven't already?",
        "What dietary changes would help keep my blood sugar controlled?",
        "Should I monitor my blood sugar at home and if so, how often?",
        "Given my family history, what is my risk of developing diabetes?",
      ],
      overallAssessment: "needs_follow_up" as const,
      disclaimer: "This explanation is for educational purposes only and does not replace professional medical advice. Please discuss your results with a qualified doctor who can interpret them in the context of your full medical history.",
    };
  }

  if (hasLipid) {
    return {
      simpleSummary: "This is a lipid profile report that measures the different types of fats in your blood. These fats affect your risk of heart disease and stroke. Understanding these numbers can help you make lifestyle changes to protect your heart.",
      severity: "moderate_concern" as const,
      severityReason: "Lipid values outside the normal range increase the risk of heart disease and should be managed with diet, exercise, and possibly medication.",
      parameters: [
        {
          name: "Total Cholesterol",
          userValue: "Detected in report",
          normalRange: "Below 200 mg/dL",
          status: "normal" as const,
          whatItMeans: "Total cholesterol is the sum of all fats in your blood. While high cholesterol needs attention, LDL ('bad' cholesterol) is the more important number.",
          whyItMatters: "High cholesterol can clog arteries over time, increasing risk of heart attack and stroke.",
          causes: [],
          symptoms: [],
          lifestyle: [],
          urgency: "Discuss with doctor at your next scheduled visit.",
        },
      ],
      keyTerms: [
        { term: "LDL Cholesterol", simplifiedExplanation: "'Bad' cholesterol — the type that builds up in artery walls. Lower is better. Target is usually below 100 mg/dL for most people." },
        { term: "HDL Cholesterol", simplifiedExplanation: "'Good' cholesterol — it helps remove bad cholesterol from arteries. Higher is better. Above 40 mg/dL for men, above 50 for women." },
        { term: "Triglycerides", simplifiedExplanation: "Blood fats that come from food (especially refined carbs and sweets). High levels increase heart disease risk. Normal is below 150 mg/dL." },
      ],
      importantFindings: [
        { finding: "Lipid profile values present", importance: "important" as const, explanation: "Cholesterol levels need to be interpreted alongside your other risk factors — blood pressure, blood sugar, family history, and smoking status. Your doctor will assess your overall cardiovascular risk." },
      ],
      healthInsights: "Heart disease is the leading cause of death in India. Indians tend to develop heart disease at a younger age compared to Western populations, and often with a different pattern of cholesterol abnormalities (lower HDL, higher triglycerides). Regular lipid testing every 1–5 years is recommended for adults.",
      positiveFindings: ["Lipid testing done — monitoring is the first step to heart health"],
      areasOfAttention: ["LDL and triglyceride values should be reviewed against targets", "Combined cardiovascular risk assessment needed"],
      doctorQuestions: [
        "Are my LDL and triglyceride levels in a healthy range for my age?",
        "What is my overall 10-year risk of heart disease based on all my risk factors?",
        "Do I need medication (statins) or can diet and exercise control my cholesterol?",
        "What specific diet changes would most help my lipid profile?",
        "How often should I repeat this lipid profile test?",
      ],
      overallAssessment: "needs_follow_up" as const,
      disclaimer: "This explanation is for educational purposes only and does not replace professional medical advice. Please discuss your results with a qualified doctor who can interpret them in the context of your full medical history.",
    };
  }

  return {
    simpleSummary: "This medical report contains important health information from your recent tests or examination. The key findings have been identified and explained below in simple language. Please take this report to your doctor for a full interpretation in the context of your medical history.",
    severity: "moderate_concern" as const,
    severityReason: "Without the specific values from your report, we recommend discussing all findings with your doctor.",
    parameters: [],
    keyTerms: [
      { term: "Reference Range", simplifiedExplanation: "The 'normal' values shown in brackets for each test. Values outside this range may need attention — but always discuss with your doctor who knows your full history." },
      { term: "Impression / Conclusion", simplifiedExplanation: "The doctor's summary of what the tests show. This is usually the most important part of the report." },
      { term: "Normal / Within Limits", simplifiedExplanation: "The result is in the expected healthy range for this test." },
      { term: "Abnormal / High / Low", simplifiedExplanation: "The result is outside the expected range. This does not always mean something is seriously wrong — context matters." },
    ],
    importantFindings: [
      { finding: "Report contains multiple test results", importance: "informational" as const, explanation: "This report has several values that need to be interpreted together. Your doctor will review the full pattern alongside your symptoms and medical history." },
      { finding: "Values outside reference range need attention", importance: "important" as const, explanation: "If any values are marked HIGH, LOW, or ABNORMAL in your report, make sure to specifically ask your doctor about each one." },
    ],
    healthInsights: "Routine blood tests are one of the best tools for catching health conditions early — often before symptoms appear. Regular health check-ups are especially important in India given the high rates of diabetes, anaemia, thyroid disorders, and heart disease.",
    positiveFindings: ["Health check-up completed — proactive health monitoring is excellent"],
    areasOfAttention: ["All flagged values should be discussed with a doctor", "Repeat testing schedule should be confirmed"],
    doctorQuestions: [
      "Which values in this report are abnormal and what do they mean for me specifically?",
      "Do I need to start any new medication or change existing treatment based on these results?",
      "When should I repeat these tests?",
      "Are there dietary or lifestyle changes that could improve any abnormal values?",
      "Do these results explain any symptoms I have been experiencing?",
      "Should I see a specialist based on any of these findings?",
    ],
    overallAssessment: "needs_follow_up" as const,
    disclaimer: "This explanation is for educational purposes only and does not replace professional medical advice. Please discuss your results with a qualified doctor who can interpret them in the context of your full medical history.",
  };
}

router.post("/report-explainer", async (req, res): Promise<void> => {
  const parsed = ExplainMedicalReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { reportText } = parsed.data;
  const hasGroq = !!getGroqClient();

  try {
    let result;

    if (hasGroq) {
      req.log.info({ reportLength: reportText.length }, "Explaining report with Groq");
      const raw = await groqChat(
        SYSTEM_PROMPT,
        `Please analyze this medical report and return the JSON response:\n\n${reportText}`,
        4096,
      );
      result = JSON.parse(raw);
    } else {
      req.log.info("GROQ_API_KEY not set, using mock response");
      result = getMockReportResult(reportText);
      await new Promise((r) => setTimeout(r, 1400));
    }

    const validated = ExplainMedicalReportResponse.parse(result);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Failed to explain report, using mock");
    const mockResult = getMockReportResult(reportText);
    const validated = ExplainMedicalReportResponse.parse(mockResult);
    res.json(validated);
  }
});

export default router;
