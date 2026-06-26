import nodemailer from "nodemailer";

const APP_URL = process.env.APP_URL ?? "http://localhost:3001";

function getTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

export async function sendVerificationEmail(email: string, token: string, code: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  const from = process.env.SMTP_FROM ?? "csreq <noreply@csreq.app>";

  const transport = getTransport();
  if (!transport) {
    console.log(`\n[csreq] Verification code for ${email}: ${code}\nLink: ${url}\n`);
    return;
  }

  await transport.sendMail({
    from,
    to: email,
    subject: `csreq — Doğrulama kodun: ${code}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:440px;margin:0 auto;padding:40px 24px;background:#111;color:#F0EBE4;border-radius:16px">
        <p style="font-size:1.5rem;font-weight:400;margin:0 0 8px">csreq</p>
        <p style="color:#8a7f75;margin:0 0 32px;font-size:0.9rem">E-posta doğrulama</p>

        <p style="font-size:0.85rem;color:#8a7f75;margin:0 0 12px;letter-spacing:0.06em;text-transform:uppercase">Doğrulama Kodun</p>
        <div style="background:#1C1915;border:1px solid rgba(224,120,48,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:28px">
          <span style="font-family:monospace;font-size:2.4rem;font-weight:700;letter-spacing:0.25em;color:#E07830">${code}</span>
        </div>
        <p style="font-size:0.8rem;color:#8a7f75;margin:0 0 28px">Bu kodu uygulamaya gir. Kod 24 saat geçerlidir.</p>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 24px"/>
        <p style="font-size:0.78rem;color:#8a7f75;margin:0 0 12px">Kod yerine link ile doğrulamak istersen:</p>
        <a href="${url}" style="display:inline-block;padding:10px 24px;background:#E07830;color:#fff;text-decoration:none;border-radius:10px;font-weight:600;font-size:0.85rem">Linkle Doğrula →</a>
        <p style="margin-top:24px;font-size:0.72rem;color:#5a5048">Bu kaydı sen yapmadıysan bu e-postayı görmezden gelebilirsin.</p>
      </div>
    `,
  });
}
