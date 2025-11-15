import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { documentExists, setDocument } from "@/lib/firestore";
import { sendEmail } from "@/lib/sendMail";
import { downloadReadyHtml } from "@/emails/downloadReady";
import { getFileName } from "@/lib/book_utils";
import { GET as handleModernSuccess } from "@/app/api/pay2/success/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type YaadParams = {
  Id: string;
  CCode: string;
  Amount: string;
  ACode: string;
  Order: string;
  Fild1: string;
  Fild2: string;
  Fild3: string;
  cell: string;
};

const SIGN_KEYS: (keyof YaadParams)[] = [
  "Id",
  "CCode",
  "Amount",
  "ACode",
  "Order",
  "Fild1",
  "Fild2",
  "Fild3",
];

function buildQueryRFC3986(params: YaadParams): string {
  const enc = (v: string) => encodeURIComponent(v);
  return SIGN_KEYS.map((k) => `${enc(k)}=${enc(params[k] ?? "")}`).join("&");
}

function hexToUtf8Json<T = unknown>(hex: string): T {
  const s = Buffer.from(hex, "hex").toString("utf8");
  return JSON.parse(s) as T;
}

function toFormUrlEncoded(
  obj: any,
  prefix?: string,
  out: URLSearchParams = new URLSearchParams()
): URLSearchParams {
  if (obj === null || obj === undefined) return out;
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => toFormUrlEncoded(v, `${prefix}[${i}]`, out));
    return out;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}[${k}]` : k;
      toFormUrlEncoded(v, key, out);
    }
    return out;
  }
  out.append(prefix ?? "", String(obj));
  return out;
}

async function handleLegacySuccess(req: NextRequest) {
  const params: YaadParams = {
    Id: req.nextUrl.searchParams.get("Id") ?? "",
    CCode: req.nextUrl.searchParams.get("CCode") ?? "",
    Amount: req.nextUrl.searchParams.get("Amount") ?? "",
    ACode: req.nextUrl.searchParams.get("ACode") ?? "",
    Order: req.nextUrl.searchParams.get("Order") ?? "",
    Fild1: req.nextUrl.searchParams.get("Fild1") ?? "",
    Fild2: req.nextUrl.searchParams.get("Fild2") ?? "",
    Fild3: req.nextUrl.searchParams.get("Fild3") ?? "",
    cell: req.nextUrl.searchParams.get("cell") ?? "",
  };

  const isApproved = params.CCode === "000" || params.CCode === "0";
  const contentType = { headers: { "content-type": "text/html; charset=utf-8" } };
  if (!isApproved) {
    const code = params.CCode || "—";
    const failHtml = `
<body dir="rtl">
  <script>
    function dispatchFail(){
      var data = { status: 'failed' }
      window.parent.postMessage(data, '*');
    }
  </script>
  <h1 style="text-align:center;">תקלה ברכישה. שגיאה מספר: ${code}.</h1>
  <div style="text-align:center"><button onClick="dispatchFail();" class="btn btn-primary">נסה שנית</button></div>
</body>`;
    return new NextResponse(failHtml, contentType);
  }

  const token = process.env.YAAD_TOKEN ?? "";
  if (!token) return new NextResponse("Server misconfigured", { status: 500 });

  const toSign = buildQueryRFC3986(params);
  const expected = crypto.createHmac("sha256", token).update(toSign).digest("hex");
  const provided = req.nextUrl.searchParams.get("Sign") ?? "";
  if (expected !== provided) {
    return new NextResponse("Validation error.", { status: 400, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  type OrderPayload = { email: string; planId?: string; amount?: number | string; type?: string; StudentName: string };
  let order: OrderPayload;
  try {
    order = hexToUtf8Json<OrderPayload>(params.Order);
  } catch (e) {
    return new NextResponse("Bad Order payload", { status: 400 });
  }

  const vat_id = req.nextUrl.searchParams.get("UserId") ?? "";
  const filename = getFileName(vat_id, "");
  const phone = params.cell;

  const OrderPayloadSchema = z.object({
    email: z.string().email(),
    planId: z.string().optional(),
    amount: z.union([z.string(), z.number()]).optional(),
    type: z.string().optional(),
    StudentName: z.string(),
  });
  const parsedOrder = OrderPayloadSchema.safeParse(order);
  if (!parsedOrder.success) {
    return new NextResponse("Invalid Order payload", { status: 400 });
  }

  const { email, planId, amount, StudentName } = parsedOrder.data;
  const gcsBucket = process.env.GCS_BUCKET_NAME;
  const existingDoc = await documentExists(`books/${email}`);
  if (existingDoc) {
    return new NextResponse("The process is already running in the background.", { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  await setDocument(`books/${email}`, { StudentName, amount, email, planId, vat_id, phone, gcsBucket, filename, generated: false });

  const successHtml = `
    <!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>הרכישה בוצעה בהצלחה</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans m-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center min-h-screen p-6">
  <div class="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
    <div class="mb-6">
      <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-center mb-6 text-gray-800 tracking-tight">הרכישה בוצעה בהצלחה!</h1>

    <div class="space-y-4 w-full">
      <p class="text-center text-gray-600 text-lg">
        בעוד מספר דקות תקבלו מייל עם לינק להורדת החוברת.
      </p>

      <div id="loader" class="flex flex-col items-center gap-3 py-4">
        <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" role="status" aria-label="טוען"></div>
        <p class="text-gray-600 text-sm">מכין את החוברת...</p>
        <div class="flex items-baseline gap-1 text-gray-700" aria-live="polite">
          <span class="text-sm">הכפתור יופיע בעוד</span>
          <span id="countdown" class="text-2xl font-bold tabular-nums">10</span>
          <span class="text-sm">שניות</span>
        </div>
      </div>

      <div id="buttonWrapper" class="hidden my-4">
        <div class="flex justify-center">
          <a id="viewButton"
             href="https://storage.cloud.google.com/${gcsBucket}/${filename}?authuser=3"
             class="inline-flex items-center justify-center py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 min-w-[220px] text-center"
             rel="noopener noreferrer">
            לצפייה בחוברת
          </a>
        </div>
      </div>

      <p class="text-center text-gray-600 text-md">
        החוברת תהיה מוכנה תוך מספר דקות
      </p>

      <div class="bg-gray-50 rounded-lg p-4 mt-6">
        <p class="text-center text-gray-600 mb-2">
          סיסמת החוברת הינה:
          <strong class="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">${vat_id}</strong>
        </p>
      </div>

      <p class="text-center text-gray-500 text-sm">
        אם לא קיבלתם מייל, בדקו את תיקיית הספאם.
      </p>
    </div>
  </div>

  <script>
    (function () {
      function dispatchSuccess() { var data = { status: 'success' }; try { window.parent && window.parent.postMessage(data, '*'); } catch (e) {} }
      function revealButton() { var loader = document.getElementById('loader'); var wrapper = document.getElementById('buttonWrapper'); if (loader) loader.classList.add('hidden'); if (wrapper) wrapper.classList.remove('hidden'); }
      function startCountdown(seconds) {
        var remaining = seconds; var el = document.getElementById('countdown'); if (el) el.textContent = remaining;
        var interval = setInterval(function () { remaining -= 1; if (el) el.textContent = Math.max(0, remaining); if (remaining <= 0) { clearInterval(interval); revealButton(); } }, 1000);
      }
      if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', function () { dispatchSuccess(); startCountdown(50); }, false); } else { dispatchSuccess(); startCountdown(50); }
      fetch("${process.env.NEXT_PUBLIC_APP_URL}/api/book/generate?email=${email}")
        .then(function (response) { return response.json(); })
        .catch(function (error) { console.error("Error:", error); });
    })();
  </script>
</body>
</html>
  `;

  const response = new NextResponse(successHtml, contentType);

  try {
    if (planId === "book") {
      const companies = ["לא ידוע", "ישראכרט", "ויזה כאל", "דיינרס", "אמריקן אקספרס", "JCP", "ויזה לאומי"] as const;
      const issuerIndex = Number(req.nextUrl.searchParams.get("Issuer") ?? "0");
      const cardType = companies[isFinite(issuerIndex) ? issuerIndex : 0] ?? companies[0];
      const icountVars = {
        cid: process.env.ICOUNT_CID ?? "",
        user: process.env.ICOUNT_USER ?? "",
        pass: process.env.ICOUNT_PASS ?? "",
        doctype: "receipt",
        vat_id: vat_id,
        phone: phone,
        client_name: req.nextUrl.searchParams.get("Fild1") ?? "",
        email: String(order.email ?? ""),
        items: [{ description: req.nextUrl.searchParams.get("Info") ?? "תשלום", unitprice_incvat: params.Amount, quantity: 1 }],
        cc: {
          sum: params.Amount,
          card_type: cardType,
          card_number: req.nextUrl.searchParams.get("L4digit") ?? "",
          holder_id: req.nextUrl.searchParams.get("UserId") ?? "",
          holder_name: req.nextUrl.searchParams.get("Fild1") ?? "",
          confirmation_code: params.ACode,
        },
        income_type_id: 7,
        send_email: 1,
        email_to_client: 1,
      };

      if (icountVars.cid && icountVars.user && icountVars.pass) {
        const body = toFormUrlEncoded(icountVars).toString();
        const resp = await fetch("https://api.icount.co.il/api/v3.php/doc/create", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
          cache: "no-store",
        });
        await resp.text();
      }

      await sendEmail(
        email,
        downloadReadyHtml({
          recipient: StudentName,
          downloadLink: `https://storage.cloud.google.com/${process.env.GCS_BUCKET_NAME}/${filename}?authuser=3`,
          filename,
          password: vat_id,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }),
        "הקובץ שלך מוכן להורדה"
      );
    }
  } catch (e) {
    console.error("Background task failed:", e);
  }

  return response;
}

export async function GET(req: NextRequest) {
  const hasTypeParam = Boolean(req.nextUrl.searchParams.get("type"));
  if (!hasTypeParam) {
    return handleModernSuccess(req);
  }
  return handleLegacySuccess(req);
}


