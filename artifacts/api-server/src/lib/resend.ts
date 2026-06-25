import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ id: string }> {
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    body: JSON.stringify({
      from: payload.from ?? "CureCheck <noreply@curecheck.in>",
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text}`);
  }

  return response.json() as Promise<{ id: string }>;
}

export function reportSummaryEmail(opts: {
  userName?: string;
  reportType: string;
  keyFindings: string[];
  doctorQuestions: string[];
}): string {
  const findings = opts.keyFindings
    .map((f) => `<li style="margin-bottom:8px;color:#374151;">${escapeHtml(f)}</li>`)
    .join("");
  const questions = opts.doctorQuestions
    .map((q) => `<li style="margin-bottom:8px;color:#374151;">${escapeHtml(q)}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488,#0891b2);padding:32px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">CureCheck</h1>
            <p style="margin:4px 0 0;color:#99f6e4;font-size:13px;">Your Medical Report Summary</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            ${opts.userName ? `<p style="color:#6b7280;font-size:15px;margin-top:0;">Hi <strong>${escapeHtml(opts.userName)}</strong>,</p>` : ""}
            <p style="color:#374151;font-size:15px;">Your <strong>${escapeHtml(opts.reportType)}</strong> report has been analyzed. Here is a plain-language summary.</p>

            <h2 style="font-size:16px;font-weight:700;color:#0d9488;border-bottom:2px solid #f0fdf4;padding-bottom:8px;">Key Findings</h2>
            <ul style="padding-left:20px;margin-top:12px;">${findings}</ul>

            <h2 style="font-size:16px;font-weight:700;color:#0d9488;border-bottom:2px solid #f0fdf4;padding-bottom:8px;margin-top:28px;">Questions to Ask Your Doctor</h2>
            <ul style="padding-left:20px;margin-top:12px;">${questions}</ul>

            <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin-top:28px;">
              <p style="margin:0;font-size:13px;color:#92400e;"><strong>Disclaimer:</strong> This analysis is for educational purposes only. It does not replace professional medical advice. Please consult your doctor before making any health decisions.</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">CureCheck &middot; AI-powered health information for India &middot; <a href="https://curecheck.in" style="color:#0d9488;text-decoration:none;">curecheck.in</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
