export type DownloadEmailParams = {
    recipient?: string;
    downloadLink: string;
    filename?: string;
    password: string;
    expiresAt?: string;
};

const esc = (s: string) =>
    String(s).replace(/[&<>"']/g, (ch) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]!)
    );

export function downloadReadyHtml({
    recipient = "חבר/ה",
    downloadLink,
    filename = "הורדה",
    password,
    expiresAt = "",
}: DownloadEmailParams): string {
    const safeFile = filename;
    const safeRecipient = esc(recipient);
    const safePassword = esc(password);
    const safeExpires = esc(expiresAt);

    const href = downloadLink;
    return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>הקובץ שלך מוכן</title>
    <style>
      body { margin:0; padding:0; background:#f0f2f5; font-family:'Segoe UI', Arial, Helvetica, sans-serif; }
      .wrapper { width:100%; background:#f0f2f5; padding:32px 16px; text-align: center; }
      .container {
        max-width:600px; margin:0 auto; background:#ffffff;
        border-radius:16px; padding:32px; box-shadow:0 2px 8px rgba(0,0,0,0.05);
        color:#1a1a1a; line-height:1.8; text-align: center;
      }
      h1 { font-size:24px; margin:0 0 16px; color:#000; }
      p { margin:0 0 16px; }
      .btn {
        display:inline-block; padding:14px 24px; text-decoration:none;
        border-radius:8px; background:#4c6ef5; color:#fff; font-weight:600;
        transition: background 0.2s ease;
      }
      .btn:hover { background:#4263eb; }
      .meta { font-size:13px; color:#666; line-height:1.6; }
      .hr { height:1px; background:#e5e7eb; border:0; margin:24px 0; }
      a { color:#4c6ef5; text-decoration:none; }
      a:hover { text-decoration:underline; }
      .password-box {
        background:#f8f9fa; padding:16px; border-radius:8px;
        border:1px solid #e5e7eb; margin:16px 0;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <h1>שלום ${safeRecipient},</h1>
        <p>הקובץ שלך מוכן להורדה.</p>

        <p style="margin:24px 0;">
          <a class="btn" href="${href}" target="_blank" rel="noopener">הורדת הקובץ</a>
        </p>

        <p>
          או הקלק/י על הקישור: <br />
          <a href="${href}" target="_blank" rel="noopener">${safeFile}</a>
        </p>

        <hr class="hr" />

        <div class="password-box">
           ${safePassword} <strong>:סיסמה לפתיחת החוברת</strong>
        </div>

        <p class="meta">
          אם הקישור לא נפתח, העתק/י את הכתובת והדבק/י אותה בדפדפן.
          ${safeExpires ? `<br />תוקף הקישור: ${safeExpires}` : ""}
        </p>

        <p class="meta" style="color:#888;">הודעה זו נשלחה אוטומטית — אין להשיב.</p>
      </div>
    </div>
  </body>
</html>`;
}


