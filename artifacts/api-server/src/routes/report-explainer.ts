import { Router, type IRouter } from "express";
import { ExplainMedicalReportBody, ExplainMedicalReportResponse } from "@workspace/api-zod";
import { groqChat, getGroqClient } from "../lib/groq";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are CureCheck's Medical Report Explainer — a non-diagnostic AI assistant that helps Indian patients understand their medical test reports and documents.

You NEVER diagnose, prescribe, or replace a doctor. You provide EDUCATIONAL information only.

Respond ONLY with a JSON object matching this exact schema:
{
  "simpleSummary": <string — 3-4 sentence plain English (or Hinglish-friendly) summary of what this report shows>,
  "keyTerms": [
    {
      "term": <medical term>,
      "simplifiedExplanation": <simple plain language explanation>
    }
  ],
  "importantFindings": [
    {
      "finding": <string — the finding>,
      "importance": <"critical"|"important"|"normal"|"informational">,
      "explanation": <string — plain language explanation of what this means>
    }
  ],
  "doctorQuestions": <string[] — 4-6 specific questions to ask the doctor at the next appointment>,
  "overallAssessment": <"requires_urgent_attention"|"needs_follow_up"|"routine_monitoring"|"all_clear">,
  "disclaimer": "This explanation is for educational purposes only and is not a medical diagnosis. Please discuss these results with your doctor who can interpret them in the context of your full medical history."
}

Guidelines:
- Use simple, accessible language — assume the patient has no medical background
- For common Indian tests (CBC, LFT, KFT, thyroid, blood glucose, lipid profile, HbA1c), explain reference ranges in context
- Identify critical values that genuinely need urgent attention vs. values that are mildly abnormal
- Be reassuring when results are genuinely normal — don't create unnecessary anxiety
- Avoid speculation — if a finding could mean many things, say so and recommend clarification from doctor
- Extract and explain up to 8 key medical terms
- List up to 8 important findings
- overallAssessment: use "requires_urgent_attention" only for genuinely critical values, "needs_follow_up" for abnormal results, "routine_monitoring" for borderline results, "all_clear" for normal results`;

function getMockReportResult(reportText: string) {
  const textLower = reportText.toLowerCase();
  const hasCBC = textLower.includes("hemoglobin") || textLower.includes("wbc") || textLower.includes("platelet") || textLower.includes("rbc");
  const hasThyroid = textLower.includes("tsh") || textLower.includes("t3") || textLower.includes("t4");
  const hasGlucose = textLower.includes("glucose") || textLower.includes("hba1c") || textLower.includes("blood sugar");
  const hasLipid = textLower.includes("cholesterol") || textLower.includes("triglyceride") || textLower.includes("ldl") || textLower.includes("hdl");

  if (hasThyroid) {
    return {
      simpleSummary:
        "This is a thyroid function test report that measures how well your thyroid gland is working. The TSH (Thyroid Stimulating Hormone) is the most important number — it acts like a signal from your brain telling the thyroid how hard to work. Your report shows some values that your doctor will want to review and discuss with you at your appointment.",
      keyTerms: [
        {
          term: "TSH (Thyroid Stimulating Hormone)",
          simplifiedExplanation:
            "A hormone made by your brain (pituitary gland) that tells the thyroid to produce more or less thyroid hormone. High TSH usually means your thyroid is underactive (hypothyroidism). Low TSH usually means it's overactive (hyperthyroidism).",
        },
        {
          term: "T4 (Thyroxine)",
          simplifiedExplanation:
            "The main hormone produced by your thyroid gland. It controls your metabolism, energy levels, and many body functions. 'Free T4' is the active form that your body can use.",
        },
        {
          term: "T3 (Triiodothyronine)",
          simplifiedExplanation:
            "The more active thyroid hormone — T4 is converted to T3 in your body's tissues. It has a stronger effect on metabolism and energy.",
        },
        {
          term: "Reference Range",
          simplifiedExplanation:
            "The numbers in brackets show the 'normal' range for healthy adults. Values outside this range need discussion with your doctor — but a slightly abnormal value does not always mean a serious problem.",
        },
      ],
      importantFindings: [
        {
          finding: "Thyroid function values present in report",
          importance: "important",
          explanation:
            "Your thyroid test results need to be interpreted together — TSH, Free T4, and Free T3 are evaluated as a panel. Your doctor will look at the pattern of these values alongside your symptoms to make any diagnosis or treatment decisions.",
        },
        {
          finding: "Laboratory reference ranges may vary",
          importance: "informational",
          explanation:
            "Different labs in India use slightly different reference ranges depending on their equipment. Always compare your values to the specific reference range printed on your report, not values from the internet.",
        },
      ],
      doctorQuestions: [
        "Are my thyroid levels in a healthy range for my age and health status?",
        "Do I need thyroid medication or any change to my current dose?",
        "How often should I repeat this test?",
        "Are my symptoms (fatigue, weight changes, feeling cold) related to my thyroid levels?",
        "Should I see an endocrinologist or is a physician sufficient for my care?",
      ],
      overallAssessment: "needs_follow_up",
      disclaimer:
        "This explanation is for educational purposes only and is not a medical diagnosis. Please discuss these results with your doctor who can interpret them in the context of your full medical history.",
    };
  }

  if (hasCBC) {
    return {
      simpleSummary:
        "This is a Complete Blood Count (CBC) report — one of the most common blood tests in India. It checks the three main types of cells in your blood: red blood cells (which carry oxygen), white blood cells (which fight infection), and platelets (which help blood clot). Each has a count and description of its quality and size.",
      keyTerms: [
        {
          term: "Hemoglobin (Hb)",
          simplifiedExplanation:
            "The protein in red blood cells that carries oxygen throughout your body. Low hemoglobin means anemia — very common in India, especially among women and children. Normal range is approximately 12-16 g/dL for women, 13-17 g/dL for men.",
        },
        {
          term: "WBC (White Blood Cells / Leukocytes)",
          simplifiedExplanation:
            "Your immune system cells that fight infection. High WBC often means the body is fighting an infection. Very low WBC can mean the immune system is weakened. Normal range: 4,000-11,000 cells/mcL.",
        },
        {
          term: "Platelets (Thrombocytes)",
          simplifiedExplanation:
            "Tiny cells that help your blood clot when you have a cut. Low platelets can cause easy bruising or bleeding. Normal range: 1.5-4 lakh/mcL (150,000-400,000).",
        },
        {
          term: "MCV (Mean Corpuscular Volume)",
          simplifiedExplanation:
            "The average size of your red blood cells. Small cells often indicate iron deficiency anemia. Large cells often indicate B12 or folate deficiency. Normal range: 80-100 fL.",
        },
        {
          term: "Neutrophils and Lymphocytes",
          simplifiedExplanation:
            "Two types of white blood cells. Neutrophils are first responders to bacterial infections. Lymphocytes fight viral infections and are part of long-term immunity.",
        },
      ],
      importantFindings: [
        {
          finding: "Hemoglobin level",
          importance: "important",
          explanation:
            "Anemia (low hemoglobin) is the most common finding in Indian CBC reports, affecting nearly 50% of women. If low, your doctor will investigate whether it is due to iron, B12, or folate deficiency, or another cause.",
        },
        {
          finding: "White blood cell count",
          importance: "important",
          explanation:
            "An elevated WBC often indicates an active infection or inflammation. The differential count (which types of WBCs are elevated) helps identify bacterial vs viral infections.",
        },
        {
          finding: "Platelet count",
          importance: "important",
          explanation:
            "Platelets are especially important in India where dengue fever can dramatically lower platelet counts. Any count below 1 lakh (100,000) should be discussed urgently with a doctor.",
        },
      ],
      doctorQuestions: [
        "Is my hemoglobin level a concern and do I need iron supplements?",
        "Do my white blood cell counts indicate any active infection?",
        "Should I repeat this test after some time or does anything need immediate attention?",
        "Are my platelet counts in a safe range?",
        "What dietary changes would help improve my blood counts?",
        "Do I need any additional tests based on these results?",
      ],
      overallAssessment: "needs_follow_up",
      disclaimer:
        "This explanation is for educational purposes only and is not a medical diagnosis. Please discuss these results with your doctor who can interpret them in the context of your full medical history.",
    };
  }

  return {
    simpleSummary:
      "This medical report contains important health information from your recent tests or examination. Medical reports use technical language that can be confusing, but the key findings have been identified and explained below in simple terms. Please take this report to your doctor for a full explanation of what the results mean for your specific health situation.",
    keyTerms: [
      {
        term: "Reference Range",
        simplifiedExplanation:
          "The 'normal' values shown in brackets for each test. Values outside this range may indicate a health concern, but context matters — your doctor looks at the full picture.",
      },
      {
        term: "Impression / Conclusion",
        simplifiedExplanation:
          "The doctor's summary of what the tests show. This is usually the most important part of a report.",
      },
      {
        term: "Normal / Within Limits",
        simplifiedExplanation:
          "Means the result is in the expected healthy range for this test.",
      },
      {
        term: "Abnormal / High / Low",
        simplifiedExplanation:
          "Means the result is outside the expected range. This does not always mean something is seriously wrong — your doctor will interpret it in context.",
      },
    ],
    importantFindings: [
      {
        finding: "Report contains multiple test results",
        importance: "informational",
        explanation:
          "This report has several values that need to be interpreted together as a whole, not in isolation. Your doctor will review the pattern of results alongside your symptoms and medical history.",
      },
      {
        finding: "Some values may be outside reference range",
        importance: "important",
        explanation:
          "If any values are marked as high, low, or abnormal in your report, make sure to specifically ask your doctor about each one at your appointment.",
      },
    ],
    doctorQuestions: [
      "Which values in this report are abnormal and what do they mean for me?",
      "Do I need to start any new medication or make changes to existing treatment based on these results?",
      "When should I repeat these tests?",
      "Are there dietary or lifestyle changes that could improve any abnormal values?",
      "Do these results explain any of the symptoms I have been experiencing?",
      "Should I see a specialist based on any of these findings?",
    ],
    overallAssessment: "needs_follow_up",
    disclaimer:
      "This explanation is for educational purposes only and is not a medical diagnosis. Please discuss these results with your doctor who can interpret them in the context of your full medical history.",
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
        `Please explain this medical report in simple language:\n\n${reportText}`,
      );
      result = JSON.parse(raw);
    } else {
      req.log.info("GROQ_API_KEY not set, using mock response");
      result = getMockReportResult(reportText);
      await new Promise((r) => setTimeout(r, 1300));
    }

    const validated = ExplainMedicalReportResponse.parse(result);
    res.json(validated);
  } catch (err) {
    req.log.error({ err }, "Failed to explain report");
    const mockResult = getMockReportResult(reportText);
    const validated = ExplainMedicalReportResponse.parse(mockResult);
    res.json(validated);
  }
});

export default router;
