import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "bi_access";
const MAX_AGE_SECONDS = 86400; // 24h

/** Server-only: get BI password from env (default for local dev only). */
export function getBiPassword(): string {
    return process.env.BI_PASSWORD ?? "money";
}

/** Create signed cookie value: expiryTimestamp:hmac(expiry). */
export function createBiCookieValue(): string {
    const secret = getBiPassword();
    const expiry = String(Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS);
    const hmac = createHmac("sha256", secret).update(expiry).digest("hex");
    return `${expiry}:${hmac}`;
}

/** Verify signed cookie; returns true if valid and not expired. */
export function verifyBiCookie(cookieValue: string | undefined): boolean {
    if (!cookieValue || typeof cookieValue !== "string") return false;
    const [expiryStr, signature] = cookieValue.split(":");
    if (!expiryStr || !signature) return false;
    const expiry = parseInt(expiryStr, 10);
    if (Number.isNaN(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
    const secret = getBiPassword();
    const expected = createHmac("sha256", secret).update(expiryStr).digest("hex");
    try {
        return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"));
    } catch {
        return false;
    }
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
