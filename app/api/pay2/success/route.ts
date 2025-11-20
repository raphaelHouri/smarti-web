import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { sendEmail } from "@/lib/sendMail";
import { downloadReadyHtml } from "@/emails/downloadReady";
import { getFileName } from "@/lib/book_utils";
import { createBookPurchase, getProductById, getTransactionDataById, createSubscriptionsIfMissingForTransaction, fulfillPaymentTransaction, clearUserCoupon } from "@/db/queries";
import { calculateAmount } from "@/lib/utils";
import type { products as ProductsTable } from "@/db/schemaSmarti";

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
type OrderPayload = { email: string; planId?: string; amount?: number | string; type?: string; StudentName: string };

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SubscriptionArrayItem = {
  userId: string;
  productId: string;
  couponId: string | null;
  paymentTransactionId: string;
  systemUntil: Date;
  displayName: string;
  type: "system" | "book";
  downloadLink?: string;
  convertUrl?: string;
  password?: string;
};

type BookDownloadMetadata = {
  productId: string;
  downloadLink: string;
  filename: string;
  convertUrl: string | null;
  systemUntil: Date;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatHebrewDate(date: Date): string {
  try {
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    const iso = date.toISOString();
    return iso.split("T")[0] ?? iso;
  }
}

function buildSubscriptionsSuccessHtml(subscriptions: SubscriptionArrayItem[]): string {
  const sections = subscriptions
    .map((subscription, index) => {
      const baseId = `subscription-${index}`;
      const productName = escapeHtml(subscription.displayName);
      const expiresAtLabel = escapeHtml(formatHebrewDate(subscription.systemUntil));
      const statusLabel =
        subscription.type === "book"
          ? "החוברת שלך מוכנה!"
          : "הגישה לתכנים נפתחה בהצלחה.";
      const expiryLine =
        subscription.type === "book"
          ? `תוקף עד: <strong class="text-gray-900">${expiresAtLabel}</strong>.`
          : `הגישה לתוכן בתוקף עד <strong class="text-gray-900">${expiresAtLabel}</strong>.`;

      let body: string;

      if (subscription.type === "book" && subscription.downloadLink) {
        const initialCountdown = 50;
        const passwordMarkup = subscription.password
          ? `<p class="text-center text-gray-600 mb-2">
          סיסמת החוברת הינה:
          <strong class="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">${escapeHtml(subscription.password)}</strong>
        </p>`
          : "";

        body = `
        <div class="mt-4 space-y-4">
          <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed space-y-2">
                        ${passwordMarkup}
            <p>${expiryLine}</p>
          </div>

          <div id="loader-${baseId}" class="flex flex-col items-center gap-3 py-4">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" role="status" aria-label="טוען"></div>
            <p class="text-gray-600 text-sm">מכין את החוברת...</p>
            <div class="flex items-baseline gap-1 text-gray-700" aria-live="polite">
              <span class="text-sm">הכפתור יופיע בעוד</span>
              <span id="countdown-${baseId}" class="text-2xl font-bold tabular-nums">${initialCountdown}</span>
              <span class="text-sm">שניות</span>
            </div>
          </div>

          <div id="buttonWrapper-${baseId}" class="hidden flex justify-center my-4">
            <a id="viewButton-${baseId}"
               href="${escapeHtml(subscription.downloadLink)}"
               class="inline-flex items-center justify-center py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 min-w-[220px] text-center"
               rel="noopener noreferrer">
              לצפייה בחוברת
            </a>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mt-2">
            <p class="text-center text-gray-500 text-sm">
              אם לא קיבלתם מייל, בדקו את תיקיית הספאם.
            </p>
          </div>
        </div>
        `;
      } else {
        body = `
        <div class="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed space-y-2">
          <p>${expiryLine}</p>
          <p>ניתן להתחבר לאזור האישי ולהתחיל ללמוד מיד.</p>
        </div>
        `;
      }

      const divider =
        index < subscriptions.length - 1
          ? `<div class="border-t border-dashed border-gray-200 my-6"></div>`
          : "";

      return `
      <section class="w-full">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-xl font-semibold text-gray-800">${productName}</h2>
            <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">${expiresAtLabel}</span>
          </div>
          <p class="text-sm text-gray-600">${statusLabel}</p>
        </div>
        ${body}
      </section>
      ${divider}
      `;
    })
    .join("");

  const bookItems: Array<{
    baseId: string;
    downloadLink: string;
    convertUrl: string | null;
    countdownSeconds: number;
  }> = [];

  subscriptions.forEach((subscription, index) => {
    if (subscription.type === "book" && subscription.downloadLink) {
      bookItems.push({
        baseId: `subscription-${index}`,
        downloadLink: subscription.downloadLink,
        convertUrl: subscription.convertUrl ?? null,
        countdownSeconds: 50,
      });
    }
  });

  const bookItemsJson = JSON.stringify(bookItems).replace(/</g, "\\u003c");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const backToAppUrl = appUrl ? `${appUrl}/learn` : "/learn";

  return `
<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>הרכישה בוצעה בהצלחה</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans m-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center min-h-screen p-6">
  <div class="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
    <div class="mb-6">
      <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-center mb-6 text-gray-800 tracking-tight">הרכישה בוצעה בהצלחה!</h1>

    <div class="space-y-6 w-full">
      ${sections}
    </div>

    <div class="mt-8 pt-6 border-t border-gray-200 w-full">
      <a href="${escapeHtml(backToAppUrl)}" 
         class="inline-flex items-center justify-center w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium">
        לחזרה למערכת
      </a>
    </div>
  </div>

  <script>
    (function () {
      const bookItems = ${bookItemsJson};

      function dispatchSuccess() {
        var data = { status: 'success' };
        try { window.parent && window.parent.postMessage(data, '*'); } catch (e) {}
      }

      function reveal(baseId) {
        var loader = document.getElementById('loader-' + baseId);
        var wrapper = document.getElementById('buttonWrapper-' + baseId);
        if (loader) loader.classList.add('hidden');
        if (wrapper) wrapper.classList.remove('hidden');
      }

      function setupBook(item) {
        var countdownEl = document.getElementById('countdown-' + item.baseId);
        var link = document.getElementById('viewButton-' + item.baseId);
        var seconds = Number(item.countdownSeconds) || 50;
        var remaining = seconds;

        if (link) {
          link.setAttribute('href', item.downloadLink);
        }

        if (!isFinite(remaining) || remaining < 0) {
          remaining = 0;
        }

        if (countdownEl) {
          countdownEl.textContent = remaining;
        }

        if (remaining === 0) {
          reveal(item.baseId);
        } else {
          var interval = setInterval(function () {
            remaining -= 1;
            if (countdownEl) {
              countdownEl.textContent = Math.max(0, remaining);
            }
            if (remaining <= 0) {
              clearInterval(interval);
              reveal(item.baseId);
            }
          }, 1000);
        }

        if (item.convertUrl) {
          fetch(item.convertUrl)
            .then(function (response) { return response.json ? response.json() : response; })
            .catch(function (error) { console.error("Error:", error); });
        }
      }

      function init() {
        dispatchSuccess();
        bookItems.forEach(setupBook);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, false);
      } else {
        init();
      }
    })();
  </script>
</body>
</html>
  `;
}

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

function getYaadParams(url: URL): YaadParams {
  return {
    Id: url.searchParams.get("Id") ?? "",
    CCode: url.searchParams.get("CCode") ?? "",
    Amount: url.searchParams.get("Amount") ?? "",
    ACode: url.searchParams.get("ACode") ?? "",
    Order: url.searchParams.get("Order") ?? "",
    Fild1: url.searchParams.get("Fild1") ?? "",
    Fild2: url.searchParams.get("Fild2") ?? "",
    Fild3: url.searchParams.get("Fild3") ?? "",
    cell: url.searchParams.get("cell") ?? "",
  };
}

function isApprovedCCode(CCode: string): boolean {
  return CCode === "000" || CCode === "0";
}
function failHtmlTemplate(code: string) {
  return `
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
}

function getSignatureInfo(params: YaadParams, req: NextRequest) {
  const token = process.env.YAAD_TOKEN ?? "";
  if (!token) return { error: new NextResponse("Server misconfigured", { status: 500 }) };
  const toSign = buildQueryRFC3986(params);
  const expected = crypto.createHmac("sha256", token).update(toSign).digest("hex");
  const provided = req.nextUrl.searchParams.get("Sign") ?? "";
  return { expected, provided };
}


const OrderPayloadSchema = z.object({
  transactionId: z.string(),
  amount: z.number(),
});

async function createBookPurchaseAndGetDownloadUrl(productBook: typeof ProductsTable.$inferSelect, studentName: string, email: string, paymentTransactionId: string, userId: string, phone: string, vat_id: string): Promise<{ downloadLink: string; filename: string }> {




  const gcsBucket = process.env.GCS_BUCKET_NAME;
  if (!gcsBucket) {
    throw new Error("Server misconfigured");
  }

  const filename = `${getFileName(userId, productBook.productType)}.pdf`;
  const downloadLink = `https://storage.cloud.google.com/${gcsBucket}/${filename}?authuser=3`;
  const generated = false;

  await createBookPurchase({
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    paymentTransactionId: paymentTransactionId,
    userId,
    productId: productBook.id,
    studentName: studentName,
    email: email,
    phone,
    filename,
    gcsBucket,
    generated,
    vatId: vat_id,
  });

  return { downloadLink, filename };

}
export async function GET(req: NextRequest) {

  // get params from request and validate them with the signature
  const params = getYaadParams(req.nextUrl)
  const vat_id = req.nextUrl.searchParams.get("UserId") ?? "";
  const phone = params.cell;
  const isApproved = isApprovedCCode(params.CCode);
  if (!isApproved) {

    const code = params.CCode || "—";
    const failHtml = failHtmlTemplate(code);
    return new NextResponse(failHtml, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  const { expected, provided, error } = getSignatureInfo(params, req);
  if (error) return error;
  if (expected !== provided) {
    return new NextResponse("Validation error.", { status: 400, headers: { "content-type": "text/plain; charset=utf-8" } });
  }

  // parse the order payload
  let order: OrderPayload;
  try {
    order = hexToUtf8Json<OrderPayload>(params.Order);
  } catch (e) {
    return new NextResponse("Bad Order payload", { status: 400 });
  }

  const parsedOrder = OrderPayloadSchema.safeParse(order);
  if (!parsedOrder.success) {
    return new NextResponse(
      `Invalid Order payload. Value of 'order': ${JSON.stringify(order)}`,
      { status: 400 })
  }
  const { transactionId, amount } = parsedOrder.data;
  const paymentTransaction = await getTransactionDataById(transactionId);
  if (!paymentTransaction) {
    return new NextResponse("Transaction not found", { status: 404 });
  }
  if (!paymentTransaction.plan) {
    return new NextResponse("Plan not found", { status: 404 });
  }
  if (paymentTransaction.couponId && !paymentTransaction.coupon) {
    return new NextResponse("Coupon not found", { status: 404 });
  }
  const price = await calculateAmount(paymentTransaction.plan, paymentTransaction.couponId,
    paymentTransaction.bookIncluded);
  if (price !== amount) {
    return new NextResponse("Price mismatch", { status: 400 });
  }

  const userId = paymentTransaction.userId;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? null;
  const planProductIds = paymentTransaction.plan.productsIds ?? [];

  const subscriptionArray: SubscriptionArrayItem[] = [];
  const bookDownloadInfos: BookDownloadMetadata[] = [];
  const now = Date.now();
  const planDurationMs = paymentTransaction.plan.days * DAY_IN_MS;

  if (paymentTransaction.plan.packageType === "book") {
    for (const productId of planProductIds) {
      const product = await getProductById(productId);
      if (!product) {
        return new NextResponse("Product not found", { status: 404 });
      }

      const systemUntil = new Date(now + 365 * DAY_IN_MS);
      const { downloadLink, filename } = await createBookPurchaseAndGetDownloadUrl(
        product,
        paymentTransaction.studentName || "",
        paymentTransaction.email || "",
        paymentTransaction.id,
        userId,
        phone,
        vat_id
      );
      const convertUrl = appUrl ? `${appUrl}/api/book/generate?userId=${userId}&productId=${product.id}` : null;

      subscriptionArray.push({
        userId,
        productId: product.id,
        couponId: paymentTransaction.couponId,
        paymentTransactionId: paymentTransaction.id,
        systemUntil,
        displayName: product.name ?? "החוברת הדיגיטלית",
        type: "book",
        downloadLink,
        convertUrl: convertUrl ?? undefined,
        password: vat_id,
      });

      bookDownloadInfos.push({
        productId: product.id,
        downloadLink,
        filename,
        convertUrl,
        systemUntil,
      });
    }
  } else {
    for (const productId of planProductIds) {
      const product = await getProductById(productId);
      if (!product) {
        return new NextResponse("Product not found", { status: 404 });
      }

      const systemUntil = new Date(now + planDurationMs);
      subscriptionArray.push({
        userId,
        productId: product.id,
        couponId: paymentTransaction.couponId,
        paymentTransactionId: paymentTransaction.id,
        systemUntil,
        displayName: product.name ?? "מנוי",
        type: "system",
      });
    }

    if (paymentTransaction.bookIncluded) {
      const planDisplayData = paymentTransaction.plan.displayData as { productBookId?: string } | null;
      const productBookId = planDisplayData?.productBookId;
      if (!productBookId) {
        return new NextResponse("Product book not configured", { status: 500 });
      }
      const productBook = await getProductById(productBookId);
      if (!productBook) {
        return new NextResponse("Product book not found", { status: 404 });
      }

      const systemUntil = new Date(now + 365 * DAY_IN_MS);
      const { downloadLink, filename } = await createBookPurchaseAndGetDownloadUrl(
        productBook,
        paymentTransaction.studentName || "",
        paymentTransaction.email || "",
        paymentTransaction.id,
        userId,
        phone,
        vat_id
      );
      const convertUrl = appUrl ? `${appUrl}/api/book/generate?userId=${userId}&productId=${productBook.id}` : null;

      subscriptionArray.push({
        userId,
        productId: productBook.id,
        couponId: paymentTransaction.couponId,
        paymentTransactionId: paymentTransaction.id,
        systemUntil,
        displayName: productBook.name ?? "החוברת הדיגיטלית",
        type: "book",
        downloadLink,
        convertUrl: convertUrl ?? undefined,
        password: vat_id,
      });

      bookDownloadInfos.push({
        productId: productBook.id,
        downloadLink,
        filename,
        convertUrl,
        systemUntil,
      });
    }
  }

  const successHtml = buildSubscriptionsSuccessHtml(subscriptionArray);
  const response = new NextResponse(successHtml, { headers: { "content-type": "text/html; charset=utf-8" } });
  try {
    if (paymentTransaction.plan.packageType === "book") {
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
    }

    if (bookDownloadInfos.length > 0) {
      const recipientEmail = paymentTransaction.email;
      if (recipientEmail) {
        const recipientName = paymentTransaction.studentName ?? "הורה יקר";
        for (const info of bookDownloadInfos) {
          await sendEmail(
            recipientEmail,
            downloadReadyHtml({
              recipient: recipientName,
              downloadLink: info.downloadLink,
              filename: info.filename,
              password: vat_id,
              expiresAt: info.systemUntil.toISOString(),
            }),
            "הקובץ שלך מוכן להורדה"
          );
        }
      }
    }
    // Create subscriptions (idempotent) and mark transaction as fulfilled
    if (subscriptionArray.length > 0) {
      await createSubscriptionsIfMissingForTransaction(
        subscriptionArray.map((s) => ({
          userId: s.userId,
          productId: s.productId,
          couponId: s.couponId ?? null,
          paymentTransactionId: s.paymentTransactionId,
          systemUntil: s.systemUntil,
        })),
        paymentTransaction.id
      );
    }
    await fulfillPaymentTransaction(paymentTransaction.id, vat_id);

    // Clear saved coupon if it was used
    if (paymentTransaction.couponId) {
      await clearUserCoupon(userId);
    }
  } catch (e) {
    console.error("Background task failed:", e);
  }

  return response;
}


