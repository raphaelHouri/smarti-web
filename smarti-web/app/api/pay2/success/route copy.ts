type OrderPayload = { email: string; planId?: string; amount?: number | string; type?: string; StudentName: string };
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const YEAR_IN_MS = 365 * DAY_IN_MS;

type PaymentTransactionWithRelations = NonNullable<Awaited<ReturnType<typeof getTransactionDataById>>>;

type SubscriptionInsertPayload = {
    userId: string;
    productId: string;
    couponId: string | null;
    paymentTransactionId: string;
    systemUntil: Date;
};

type SubscriptionCard = {
    title: string;
    subtitle?: string | null;
    expiresAt: string;
    features: string[];
    tag?: string | null;
};

type BookSuccessContext = {
    downloadLink: string;
    filename: string;
    convertUrl: string;
    expiresAt: Date;
    password: string;
};

type SubscriptionBuildResult = {
    records: SubscriptionInsertPayload[];
    cards: SubscriptionCard[];
    book?: BookSuccessContext;
};

function buildQueryRFC3986(params: YaadParams): string {


