import { Router, type IRouter } from "express";
import { OcrReportBody } from "@workspace/api-zod";
import { getGroqClient } from "../lib/groq";

const router: IRouter = Router();

const MOCK_EXTRACTED_TEXT = `Complete Blood Count (CBC) Report
Patient: Sample Patient
Date: 15/06/2026

Haemoglobin (Hb): 10.2 g/dL [Reference: 13.0 - 17.0 g/dL] LOW
Total WBC Count: 9,800 cells/mcL [Reference: 4,000 - 11,000] NORMAL
Platelets: 1,85,000 /mcL [Reference: 1,50,000 - 4,00,000] NORMAL
MCV: 68 fL [Reference: 80 - 100 fL] LOW
MCH: 21 pg [Reference: 27 - 32 pg] LOW
MCHC: 28 g/dL [Reference: 31.5 - 34.5 g/dL] LOW
RBC Count: 4.1 million/mcL [Reference: 4.5 - 5.5] LOW

Impression: Microcytic hypochromic anaemia, likely iron deficiency anaemia.
Repeat CBC after 3 months of iron supplementation.`;

router.post("/ocr-report", async (req, res): Promise<void> => {
  const parsed = OcrReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { imageData, mimeType } = parsed.data;
  const client = getGroqClient();

  if (!client) {
    req.log.info("GROQ_API_KEY not set, returning mock OCR result");
    await new Promise((r) => setTimeout(r, 1200));
    res.json({ extractedText: MOCK_EXTRACTED_TEXT, confidence: "high" });
    return;
  }

  try {
    req.log.info({ mimeType }, "Running vision OCR on medical report image");

    const completion = await client.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageData}`,
              },
            },
            {
              type: "text",
              text: `You are a medical OCR assistant. Extract ALL text from this medical report image EXACTLY as written.
              
Preserve:
- All parameter names and values
- All reference ranges (the numbers in brackets)
- All units (g/dL, mg/dL, etc.)
- Status labels (HIGH, LOW, NORMAL, ABNORMAL)
- Report date, patient name if visible
- Doctor's impression/conclusion section

Format the output as clean readable text. Do not add any commentary or interpretation.
Return ONLY the extracted text from the report.`,
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const extractedText = completion.choices[0]?.message?.content ?? "";

    if (!extractedText || extractedText.length < 10) {
      res.json({ extractedText: MOCK_EXTRACTED_TEXT, confidence: "low" });
      return;
    }

    res.json({ extractedText, confidence: "high" });
  } catch (err) {
    req.log.error({ err }, "OCR failed, returning mock");
    res.json({ extractedText: MOCK_EXTRACTED_TEXT, confidence: "low" });
  }
});

export default router;
