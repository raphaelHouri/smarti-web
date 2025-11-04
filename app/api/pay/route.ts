import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDocument } from "@/lib/firestore";

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

export async function GET(request: Request) {
    const u = new URL(request.url);
    const email = u.searchParams.get("Email");
    const StudentName = u.searchParams.get("StudentName");
    const planId = u.searchParams.get("PlanId");

    if (!StudentName) return NextResponse.json({ error: "invalid Student Name" }, { status: 400 });
    if (!email) return NextResponse.json({ error: "invalid email" }, { status: 400 });
    if (!planId) return NextResponse.json({ error: "invalid plan" }, { status: 400 });

    const book = await getDocument(`subscription/subscription`);
    if (!book?.[planId] && !book?.[planId]?.printPrice) return NextResponse.json({ error: "invalid plan" }, { status: 400 });

    const amount = book?.[planId]?.printPrice || 79;
    const data = { email, planId, amount, type: "pay", StudentName };
    const params: Record<string, string> = {
        action: "pay",
        Masof: "4502106222",
        Info: `רכישת חוברת להדפסה שלב א'`,
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

    return NextResponse.redirect(redirectUrl, { status: 302 });
}


