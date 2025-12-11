import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDocument } from "@/lib/firestore";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";
import { paymentTransactions, bookPurchases } from "@/db/schemaSmarti";
import { getPlan, findBookPurchase, getCoupon, getProductById, getUserByAuthId } from "@/db/queries";
import { calculateAmount } from "@/lib/utils";
import { trackServerEvent } from "@/lib/posthog-server";

export const runtime = "nodejs";

function orderHexFromData(data: unknown): string {
  const json = JSON.stringify(data);
  const iso = Buffer.from(json, "utf8").toString("latin1");
  return Buffer.from(iso, "latin1").toString("hex");
}
function buildQueryRFC3986(params: Record<string, string>): string {
  const keys = Object.keys(params).sort();
  const enc = (v: string) =>
    encodeURIComponent(v).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
  return keys.map((k) => `${enc(k)}=${enc(params[k] ?? "")}`).join("&");
}

function bookPurchaseAlreadyHtmlResponse(hasBookPurchase: typeof bookPurchases.$inferSelect): Response {
  const validUntilFormatted = hasBookPurchase.validUntil
    ? new Date(hasBookPurchase.validUntil).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const storedLink = hasBookPurchase.filename
    ? `https://storage.cloud.google.com/${hasBookPurchase.gcsBucket}/${hasBookPurchase.filename}?authuser=3`
    : null;
  const vat_id = hasBookPurchase.vatId;

  const existingHtml = `
    <!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>החוברת כבר נרכשה</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans m-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center min-h-screen p-6">
  <div class="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
    <div class="mb-6">
      <svg class="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-center mb-4 text-gray-800 tracking-tight">החוברת כבר נרכשה</h1>

    <div class="space-y-4 w-full">
      <p class="text-center text-gray-600 text-lg">
        החוברת זמינה להורדה עד${validUntilFormatted ? ` <strong class="text-gray-900">${validUntilFormatted}</strong>` : " להודעה חדשה"}.
      </p>

      ${storedLink
      ? `<div class="flex justify-center my-4">
        <a href="${storedLink}"
           class="inline-flex items-center justify-center py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 min-w-[220px] text-center"
           rel="noopener noreferrer">
          להורדת החוברת
        </a>
      </div>`
      : ""
    }

      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-center text-gray-600 mb-2">
          סיסמת החוברת הינה:
          <strong class="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">${vat_id}</strong>
        </p>
      </div>

      <p class="text-center text-gray-500 text-sm">
        במקרה הצורך ניתן לפנות לשירות הלקוחות שלנו לסיוע נוסף.
      </p>
    </div>
  </div>

  <script>
    (function () {
      function dispatchSuccess() { var data = { status: 'success' }; try { window.parent && window.parent.postMessage(data, '*'); } catch (e) {} }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { dispatchSuccess(); }, false);
      } else {
        dispatchSuccess();
      }
    })();
  </script>
</body>
</html>
        `;
  return new NextResponse(existingHtml, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}


export async function GET(request: Request) {
  const u = new URL(request.url);
  const userId = u.searchParams.get("UserId");
  if (!userId) return NextResponse.json({ error: "invalid user" }, { status: 401 });
  const user = await getUserByAuthId(userId);
  if (!user) return NextResponse.json({ error: "user not found" }, { status: 404 });
  const planId = u.searchParams.get("PlanId");
  const bookIncluded = u.searchParams.get("bookIncluded") === "True";
  const couponCode = u.searchParams.get("CouponCode") ?? null;
  // Prefer email from query param, otherwise from Clerk's session
  const email = u.searchParams.get("Email") ?? user?.email ?? null;
  const studentName = u.searchParams.get("StudentName") ?? null;
  let couponId: string | null = null;

  if (!userId) return NextResponse.json({ error: "invalid user" }, { status: 401 });
  if (!planId) return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  const plan = await getPlan(planId);
  if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

  if (bookIncluded && (!studentName || !email)) return NextResponse.json({ error: "invalid Student Name" }, { status: 400 });
  if (bookIncluded) {
    let productBookId = "";
    if (plan.packageType === "book") {
      productBookId = plan.productsIds?.[0] ?? "";
    } else {
      const planDisplayData = plan.displayData as { productBookId?: string } | null;
      productBookId = planDisplayData?.productBookId || "";
    }
    if (!productBookId) return NextResponse.json({ error: "product book not found" }, { status: 404 });
    const hasBookPurchase = await findBookPurchase(productBookId, userId);

    if (hasBookPurchase) {
      return bookPurchaseAlreadyHtmlResponse(hasBookPurchase);
    }
  }




  if (couponCode) {
    const coupon = await getCoupon({ code: couponCode });
    if (!coupon) return NextResponse.json({ error: "invalid coupon" }, { status: 400 });
    couponId = coupon.id;
  }
  const amount = await calculateAmount(plan, couponId, bookIncluded);

  const transaction: typeof paymentTransactions.$inferInsert = {
    userId,
    planId,
    status: "created",
    email,
    studentName,
    couponId,
    bookIncluded,
    totalPrice: amount,
    systemStep: plan.systemStep
  };

  const inserted = await db.insert(paymentTransactions).values(transaction).returning({ id: paymentTransactions.id });
  const transactionId = inserted[0]?.id;

  // Track purchase initiation
  trackServerEvent(userId, "purchase_initiated", {
    systemStep: plan.systemStep,
    planId,
    planName: plan.name,
    planType: plan.packageType,
    category: plan.packageType === "book" ? "books" : "system",
    totalPrice: amount,
    couponCode: couponCode || undefined,
    bookIncluded,
    transactionId,
  });

  const data = {
    transactionId,
    amount,
  };
  const params: Record<string, string> = {
    action: "pay",
    Masof: "4502106222",
    Info: `${plan.internalDescription} - ${bookIncluded ? " + חוברת הדרכה" : ""}`,
    UTF8: "True",
    UTF8out: "True",
    Amount: String(amount),
    Order: orderHexFromData(data),
    Tash: "1",
    tashType: "1",
    sendemail: "True",
    pageTimeOut: "True",
    PageLang: "HEB",
    Coin: "1",
    Sign: "True",
    Postpone: "False",
    email,
    SendHesh: "True",
    MoreData: "True",
    PassP: "Gifted90",
    tmp: "3",
  };

  const qs = buildQueryRFC3986(params);
  const token = process.env.YAAD_TOKEN || "default";
  const signature = crypto.createHmac("sha256", token).update(qs, "utf8").digest("hex");
  const redirectUrl = `https://icom.yaad.net/p/?${qs}&signature=${signature}`;

  // Track payment redirect
  trackServerEvent(userId, "payment_redirected", {
    systemStep: plan.systemStep,
    transactionId,
    amount,
    planId,
  });

  return NextResponse.redirect(redirectUrl, { status: 302 });
}


