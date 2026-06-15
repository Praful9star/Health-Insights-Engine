---
name: CureCheck Report Explainer architecture
description: OCR upload flow, Groq vision model, pdfjs-dist CDN worker, and new OpenAPI fields added during the flagship upgrade.
---

## OCR endpoint
`POST /api/ocr-report` — new route in `artifacts/api-server/src/routes/ocr-report.ts`
- Uses `llama-3.2-11b-vision-preview` (Groq vision model)
- Accepts `{ imageData: string (base64, no URI prefix), mimeType: string }`
- Returns `{ extractedText, confidence }`
- Falls back to mock CBC text when GROQ_API_KEY missing

## pdfjs-dist (v6)
Installed in `@workspace/curecheck`. Uses CDN worker to avoid Vite worker bundling issues:
```typescript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
```
Import via dynamic `await import('pdfjs-dist')` inside the handler function only.

## groqChat signature change
Added optional `maxTokens` parameter (default 2048). Report explainer uses 4096 to handle larger JSON responses.

## New ReportResult fields (optional in spec)
`severity`, `severityReason`, `parameters` (ReportParameter[]), `healthInsights`, `positiveFindings`, `areasOfAttention`

## Frontend step machine
report-explainer.tsx uses `step: "input" | "processing" | "preview" | "result"` state:
- input → user picks file or switches to paste text mode
- processing → OCR spinner (image files only)
- preview → editable textarea showing extracted text
- result → full analysis with parameter accordion cards

## Myth Buster update
Back card updated: amber/orange border, amber progress dots, "Check similar claims" → `/claim-checker` (wouter Link), WhatsAppShare component for sharing.
WhatsAppShare does NOT accept a `size` prop — use className instead.

**Why:** Groq vision (llama-3.2-11b-vision-preview) is a different model from the text model — no `response_format: json_object` needed, plain text response expected.
