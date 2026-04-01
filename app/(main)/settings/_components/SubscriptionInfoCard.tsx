import { Separator } from "@/components/ui/separator";
import { CreditCard } from "lucide-react";

const PACKAGE_TYPE_LABELS: Record<string, string> = {
    system: "מערכת",
    book: "חוברת",
};

interface SubscriptionDetail {
    id: string;
    systemUntil: Date | null;
    systemStep: number;
    createdAt: Date | null;
    product: {
        name: string;
        productType: string;
        packageType: string;
    };
}

interface SubscriptionInfoCardProps {
    subscriptions: SubscriptionDetail[];
}

function formatDate(date: Date | null): string {
    if (!date) return "—";
    return new Intl.DateTimeFormat("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

function isActive(systemUntil: Date | null): boolean {
    if (!systemUntil) return false;
    return new Date(systemUntil).getTime() > Date.now();
}

export function SubscriptionInfoCard({ subscriptions }: SubscriptionInfoCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> המנויים שלי
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                צפו בפרטי המנויים הפעילים שלכם.
            </p>
            <Separator className="my-4" />

            {subscriptions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                    אין מנויים פעילים כרגע.
                </p>
            ) : (
                <div className="space-y-4">
                    {subscriptions.map((sub) => {
                        const active = isActive(sub.systemUntil);
                        return (
                            <div
                                key={sub.id}
                                className="flex flex-col gap-2 rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-neutral-800 dark:text-slate-200">
                                        {sub.product.name}
                                    </span>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            active
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                        }`}
                                    >
                                        {active ? "פעיל" : "פג תוקף"}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                    <span>
                                        סוג חבילה:{" "}
                                        {PACKAGE_TYPE_LABELS[sub.product.packageType] ?? sub.product.packageType}
                                    </span>
                                    <span>
                                        בתוקף עד: {formatDate(sub.systemUntil)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
