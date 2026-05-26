"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Title } from "react-admin";

type WizardStep = 1 | 2 | 3;

type FoundUser = {
    id: string;
    name: string;
    email: string;
    systemStep: number;
};

type ActiveSubscription = {
    productId: string;
    systemUntil: string | null;
    subscriptionId?: string | null;
};

type CurrentPlan = {
    planId: string | null;
    planName: string;
    planDescription: string | null;
    internalDescription: string | null;
    packageType: "system" | "book";
    defaultDays: number | null;
    price: number | null;
    systemUntil: string | null;
    daysRemaining: number;
    systemStep: number;
    subscriptionIds: string[];
    productIds: string[];
};

type PlanRecord = {
    id: string;
    name: string;
    description: string | null;
    internalDescription: string;
    days: number;
    price: number;
    packageType: "system" | "book";
    productsIds: string[] | null;
    isActive: boolean;
};

type GrantSuccess = {
    userName: string;
    userEmail: string;
    planName: string;
    newSystemUntil: string;
    updatedSubscriptions: { productId: string; newSystemUntil: string }[];
    emailSent?: boolean;
    deliveryEmail?: string;
    isBookGrant?: boolean;
    books?: { productId: string; filename: string; downloadLink: string }[];
    bookPassword?: string;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function planGroupKey(plan: CurrentPlan): string {
    return plan.planId ?? plan.subscriptionIds.join("-");
}

function toDateInputValue(iso: string | null): string {
    if (!iso) return "";
    const date = new Date(iso);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function packageTypeLabel(packageType: PlanRecord["packageType"]): string {
    return packageType === "book" ? "ספר" : "מערכת";
}

function computeProjectedExpiry(
    activeSubscriptions: ActiveSubscription[],
    productIds: string[],
    daysToAdd: number
): Date {
    const now = new Date();
    const relevant = activeSubscriptions.filter((sub) => productIds.includes(sub.productId));
    const latestExisting = relevant.reduce<Date | null>((latest, sub) => {
        if (!sub.systemUntil) return latest;
        const date = new Date(sub.systemUntil);
        if (!latest || date > latest) return date;
        return latest;
    }, null);

    const base =
        latestExisting && latestExisting.getTime() > now.getTime() ? latestExisting : now;
    return new Date(base.getTime() + daysToAdd * DAY_IN_MS);
}

export default function GrantSubscriptionPage() {
    const [step, setStep] = useState<WizardStep>(1);

    const [email, setEmail] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
    const [currentPlans, setCurrentPlans] = useState<CurrentPlan[]>([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubscription[]>([]);

    const [editingPlanKey, setEditingPlanKey] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<"days" | "date">("days");
    const [editDays, setEditDays] = useState<number>(30);
    const [editDate, setEditDate] = useState("");
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [editSuccess, setEditSuccess] = useState<string | null>(null);

    const [cancelingPlanKey, setCancelingPlanKey] = useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const [plans, setPlans] = useState<PlanRecord[]>([]);
    const [plansLoading, setPlansLoading] = useState(false);
    const [plansError, setPlansError] = useState<string | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState("");

    const [daysToAdd, setDaysToAdd] = useState<number>(30);
    const [studentName, setStudentName] = useState("");
    const [deliveryEmail, setDeliveryEmail] = useState("");
    const [bookPassword, setBookPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [success, setSuccess] = useState<GrantSuccess | null>(null);
    const [showProductIds, setShowProductIds] = useState(false);

    const selectedPlan = useMemo(
        () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
        [plans, selectedPlanId]
    );

    const activePlanSubscriptions = useMemo(() => {
        if (!selectedPlan) return [];
        const productIds = selectedPlan.productsIds ?? [];
        return activeSubscriptions.filter((sub) => productIds.includes(sub.productId));
    }, [activeSubscriptions, selectedPlan]);

    const latestActiveUntil = useMemo(() => {
        return activePlanSubscriptions.reduce<Date | null>((latest, sub) => {
            if (!sub.systemUntil) return latest;
            const date = new Date(sub.systemUntil);
            if (!latest || date > latest) return date;
            return latest;
        }, null);
    }, [activePlanSubscriptions]);

    const projectedExpiry = useMemo(() => {
        if (!selectedPlan) return null;
        return computeProjectedExpiry(
            activeSubscriptions,
            selectedPlan.productsIds ?? [],
            daysToAdd
        );
    }, [activeSubscriptions, selectedPlan, daysToAdd]);

    const resetForm = useCallback(() => {
        setStep(1);
        setEmail("");
        setSearchError(null);
        setFoundUser(null);
        setCurrentPlans([]);
        setActiveSubscriptions([]);
        setEditingPlanKey(null);
        setCancelingPlanKey(null);
        setEditError(null);
        setEditSuccess(null);
        setSelectedPlanId("");
        setDaysToAdd(30);
        setStudentName("");
        setDeliveryEmail("");
        setBookPassword("");
        setPhone("");
        setSubmitError(null);
        setSuccess(null);
        setShowProductIds(false);
    }, []);

    const resetFromStep1 = useCallback(() => {
        setStep(1);
        setSearchError(null);
        setFoundUser(null);
        setCurrentPlans([]);
        setActiveSubscriptions([]);
        setEditingPlanKey(null);
        setCancelingPlanKey(null);
        setEditError(null);
        setEditSuccess(null);
        setSelectedPlanId("");
        setDaysToAdd(30);
        setStudentName("");
        setDeliveryEmail("");
        setBookPassword("");
        setPhone("");
        setSubmitError(null);
        setSuccess(null);
        setShowProductIds(false);
    }, []);

    const refreshUserData = useCallback(async (userEmail: string) => {
        const response = await fetch(
            `/api/admin/grant-subscription?email=${encodeURIComponent(userEmail.toLowerCase())}`,
            { credentials: "include" }
        );
        if (!response.ok) return null;
        const data = (await response.json()) as {
            user: FoundUser | null;
            currentPlans?: CurrentPlan[];
            activeSubscriptions?: ActiveSubscription[];
        };
        if (!data.user) return null;
        setFoundUser(data.user);
        setCurrentPlans(data.currentPlans ?? []);
        setActiveSubscriptions(data.activeSubscriptions ?? []);
        return data;
    }, []);

    const loadPlans = useCallback(async () => {
        setPlansLoading(true);
        setPlansError(null);
        try {
            const response = await fetch("/api/plans");
            if (!response.ok) {
                throw new Error("שגיאה בטעינת התוכניות");
            }
            const data = (await response.json()) as PlanRecord[];
            setPlans(data.filter((plan) => plan.isActive));
        } catch (error) {
            setPlansError(error instanceof Error ? error.message : "שגיאה בטעינת התוכניות");
        } finally {
            setPlansLoading(false);
        }
    }, []);

    useEffect(() => {
        if (step === 2 && plans.length === 0 && !plansLoading) {
            void loadPlans();
        }
    }, [step, plans.length, plansLoading, loadPlans]);

    useEffect(() => {
        if (step !== 3 || !foundUser || !selectedPlan) return;
        setStudentName(foundUser.name);
        setDeliveryEmail(foundUser.email);
        if (selectedPlan.packageType === "book") {
            setDaysToAdd(Math.max(selectedPlan.days, 365));
        }
    }, [step, foundUser, selectedPlan]);

    const handleSearchUser = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setSearchError("יש להזין כתובת אימייל");
            return;
        }

        setSearchLoading(true);
        setSearchError(null);

        try {
            const response = await fetch(
                `/api/admin/grant-subscription?email=${encodeURIComponent(trimmedEmail.toLowerCase())}`,
                { credentials: "include" }
            );

            if (response.status === 401) {
                throw new Error("אין הרשאות מנהל — יש להתחבר כמנהל");
            }

            if (!response.ok) {
                throw new Error("שגיאה בחיפוש המשתמש");
            }

            const data = (await response.json()) as {
                user: FoundUser | null;
                currentPlans?: CurrentPlan[];
                activeSubscriptions?: ActiveSubscription[];
            };

            if (!data.user) {
                setFoundUser(null);
                setCurrentPlans([]);
                setActiveSubscriptions([]);
                setSearchError("לא נמצא משתמש עם האימייל הזה");
                return;
            }

            setFoundUser(data.user);
            setCurrentPlans(data.currentPlans ?? []);
            setActiveSubscriptions(data.activeSubscriptions ?? []);
            setStep(2);
        } catch (error) {
            setSearchError(error instanceof Error ? error.message : "שגיאה בחיפוש המשתמש");
        } finally {
            setSearchLoading(false);
        }
    };

    const handlePlanChange = (planId: string) => {
        setSelectedPlanId(planId);
        const plan = plans.find((item) => item.id === planId);
        if (plan) {
            setDaysToAdd(plan.packageType === "book" ? Math.max(plan.days, 365) : plan.days);
        }
    };

    const startEditingPlan = (plan: CurrentPlan) => {
        setEditingPlanKey(planGroupKey(plan));
        setEditMode("days");
        setEditDays(plan.defaultDays ?? 30);
        setEditDate(toDateInputValue(plan.systemUntil));
        setEditError(null);
        setEditSuccess(null);
    };

    const cancelEditingPlan = () => {
        setEditingPlanKey(null);
        setCancelingPlanKey(null);
        setEditError(null);
    };

    const startCancelPlan = (plan: CurrentPlan) => {
        setCancelingPlanKey(planGroupKey(plan));
        setEditingPlanKey(null);
        setEditError(null);
        setEditSuccess(null);
    };

    const dismissCancelPlan = () => {
        setCancelingPlanKey(null);
    };

    const handleCancelPlan = async (plan: CurrentPlan) => {
        if (!foundUser) return;

        setCancelLoading(true);
        setEditError(null);
        setEditSuccess(null);

        try {
            const response = await fetch("/api/admin/grant-subscription", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    email: foundUser.email,
                    subscriptionIds: plan.subscriptionIds,
                    productIds: plan.productIds,
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "שגיאה בביטול המנוי");
            }

            const data = (await response.json()) as { currentPlans?: CurrentPlan[] };
            setCurrentPlans(data.currentPlans ?? []);
            await refreshUserData(foundUser.email);
            setCancelingPlanKey(null);
            setEditSuccess(`המנוי "${plan.planName}" בוטל בהצלחה`);
        } catch (error) {
            setEditError(error instanceof Error ? error.message : "שגיאה בביטול המנוי");
        } finally {
            setCancelLoading(false);
        }
    };

    const handleSavePlanEdit = async (plan: CurrentPlan) => {
        if (!foundUser) return;

        setEditLoading(true);
        setEditError(null);
        setEditSuccess(null);

        try {
            const payload: Record<string, unknown> = {
                email: foundUser.email,
                subscriptionIds: plan.subscriptionIds,
            };

            if (editMode === "days") {
                if (editDays < 1 || editDays > 3650) {
                    throw new Error("מספר ימים לא תקין");
                }
                payload.daysToAdd = editDays;
            } else {
                if (!editDate) {
                    throw new Error("יש לבחור תאריך תוקף");
                }
                payload.systemUntil = new Date(`${editDate}T23:59:59`).toISOString();
            }

            const response = await fetch("/api/admin/grant-subscription", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "שגיאה בעדכון המנוי");
            }

            const data = (await response.json()) as {
                newSystemUntil: string;
                currentPlans?: CurrentPlan[];
            };

            setCurrentPlans(data.currentPlans ?? []);
            await refreshUserData(foundUser.email);
            setEditingPlanKey(null);
            setEditSuccess(`המנוי "${plan.planName}" עודכן — תוקף חדש: ${formatDate(new Date(data.newSystemUntil))}`);
        } catch (error) {
            setEditError(error instanceof Error ? error.message : "שגיאה בעדכון המנוי");
        } finally {
            setEditLoading(false);
        }
    };

    const handleGrant = async () => {
        if (!foundUser || !selectedPlan) return;

        if (selectedPlan.packageType === "book") {
            if (!studentName.trim() || !deliveryEmail.trim() || !bookPassword.trim()) {
                setSubmitError("לחוברת נדרשים שם תלמיד, אימייל לשליחה וסיסמה");
                return;
            }
        }

        setSubmitLoading(true);
        setSubmitError(null);

        try {
            const payload: Record<string, unknown> = {
                email: foundUser.email,
                planId: selectedPlan.id,
                daysToAdd,
            };

            if (selectedPlan.packageType === "book") {
                payload.studentName = studentName.trim();
                payload.deliveryEmail = deliveryEmail.trim().toLowerCase();
                payload.bookPassword = bookPassword.trim();
                payload.phone = phone.trim();
            }

            const response = await fetch("/api/admin/grant-subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || "שגיאה בהענקת המנוי");
            }

            const data = (await response.json()) as GrantSuccess;
            setSuccess(data);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "שגיאה בהענקת המנוי");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (success) {
        return (
            <Box sx={{ p: 2, maxWidth: 640 }}>
                <Title title="הענקת מנוי" />
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success.isBookGrant
                        ? "החוברת הוענקה ואימייל עם פרטי ההורדה נשלח בהצלחה"
                        : "המנוי הוענק בהצלחה"}
                </Alert>
                <Card variant="outlined">
                    <CardContent>
                        <Stack spacing={1.5}>
                            <Typography>
                                <strong>משתמש:</strong> {success.userName} ({success.userEmail})
                            </Typography>
                            <Typography>
                                <strong>תוכנית:</strong> {success.planName}
                            </Typography>
                            <Typography>
                                <strong>תוקף חדש:</strong>{" "}
                                {formatDate(new Date(success.newSystemUntil))}
                            </Typography>
                            {success.isBookGrant ? (
                                <Typography variant="body2">
                                    <strong>אימייל נשלח ל:</strong> {success.deliveryEmail}
                                </Typography>
                            ) : null}
                            {success.isBookGrant && success.bookPassword ? (
                                <Box
                                    sx={{
                                        bgcolor: "action.hover",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 1,
                                        p: 1.5,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        סיסמה לפתיחת הקובץ:
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        fontFamily="monospace"
                                        sx={{ letterSpacing: 1 }}
                                    >
                                        {success.bookPassword}
                                    </Typography>
                                </Box>
                            ) : null}
                            {success.isBookGrant && success.books && success.books.length > 0 ? (
                                <Box>
                                    <Typography variant="body2" fontWeight={600} gutterBottom>
                                        קישורי הורדה:
                                    </Typography>
                                    <Stack spacing={0.75}>
                                        {success.books.map((book) => (
                                            <Typography key={book.productId} variant="body2">
                                                <Link
                                                    href={book.downloadLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {book.filename}
                                                </Link>
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Box>
                            ) : null}
                            <Box>
                                <Link
                                    component="button"
                                    type="button"
                                    variant="body2"
                                    onClick={() => setShowProductIds((prev) => !prev)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    {showProductIds ? "הסתר מוצרים" : "הצג מוצרים שעודכנו"}
                                </Link>
                                <Collapse in={showProductIds}>
                                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                                        {success.updatedSubscriptions.map((sub) => (
                                            <Typography key={sub.productId} variant="caption" color="text.secondary">
                                                {sub.productId} — {formatDate(new Date(sub.newSystemUntil))}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Collapse>
                            </Box>
                            <Button variant="contained" onClick={resetForm} sx={{ alignSelf: "flex-start" }}>
                                הענק מנוי נוסף
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, maxWidth: 640 }}>
            <Title title="הענקת מנוי" />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                הענקה או הארכת מנוי למשתמש לפי אימייל — ללא תשלום.
            </Typography>

            <Stack spacing={2}>
                {step > 1 && foundUser ? (
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip
                            color="success"
                            variant="outlined"
                            label={`✓ ${foundUser.name} · ${foundUser.email}`}
                        />
                        <Link component="button" type="button" variant="body2" onClick={resetFromStep1}>
                            שנה
                        </Link>
                    </Stack>
                ) : (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                שלב 1 — מציאת משתמש
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <TextField
                                    autoFocus
                                    fullWidth
                                    label="אימייל"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={searchLoading}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            void handleSearchUser();
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => void handleSearchUser()}
                                    disabled={searchLoading}
                                    sx={{ minWidth: 120, height: 56 }}
                                >
                                    {searchLoading ? <CircularProgress size={22} color="inherit" /> : "חפש"}
                                </Button>
                            </Stack>
                            {searchError ? (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {searchError}
                                </Alert>
                            ) : null}
                        </CardContent>
                    </Card>
                )}

                {step >= 2 && foundUser ? (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                מנויים פעילים
                            </Typography>

                            {editSuccess ? (
                                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setEditSuccess(null)}>
                                    {editSuccess}
                                </Alert>
                            ) : null}

                            {currentPlans.length === 0 ? (
                                <Alert severity="info">אין מנויים פעילים למשתמש זה</Alert>
                            ) : (
                                <Stack spacing={1.5}>
                                    {currentPlans.map((plan) => {
                                        const key = planGroupKey(plan);
                                        const isEditing = editingPlanKey === key;
                                        const isCanceling = cancelingPlanKey === key;

                                        return (
                                            <Card key={key} variant="outlined" sx={{ bgcolor: "action.hover" }}>
                                                <CardContent>
                                                    <Stack spacing={1.25}>
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="flex-start"
                                                            spacing={1}
                                                        >
                                                            <Box>
                                                                <Typography fontWeight={700}>{plan.planName}</Typography>
                                                                {plan.planDescription ? (
                                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                                        {plan.planDescription}
                                                                    </Typography>
                                                                ) : null}
                                                            </Box>
                                                            {!isEditing && !isCanceling ? (
                                                                <Stack direction="row" spacing={1}>
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        onClick={() => startEditingPlan(plan)}
                                                                    >
                                                                        ערוך
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="error"
                                                                        onClick={() => startCancelPlan(plan)}
                                                                    >
                                                                        בטל מנוי
                                                                    </Button>
                                                                </Stack>
                                                            ) : null}
                                                        </Stack>

                                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                            <Chip size="small" label={packageTypeLabel(plan.packageType)} />
                                                            <Chip
                                                                size="small"
                                                                variant="outlined"
                                                                label={`תוקף: ${plan.systemUntil ? formatDate(new Date(plan.systemUntil)) : "—"}`}
                                                            />
                                                            <Chip
                                                                size="small"
                                                                variant="outlined"
                                                                label={`${plan.daysRemaining} ימים נותרו`}
                                                            />
                                                            {plan.price !== null ? (
                                                                <Chip
                                                                    size="small"
                                                                    variant="outlined"
                                                                    label={`מחיר רשום: ₪${plan.price}`}
                                                                />
                                                            ) : null}
                                                        </Stack>

                                                        {plan.internalDescription ? (
                                                            <Typography variant="caption" color="text.secondary">
                                                                הערה פנימית: {plan.internalDescription}
                                                            </Typography>
                                                        ) : null}

                                                        {isCanceling ? (
                                                            <Box sx={{ pt: 1 }}>
                                                                <Alert severity="warning" sx={{ mb: 1.5 }}>
                                                                    לבטל את המנוי &quot;{plan.planName}&quot;? הגישה
                                                                    תיפסק מיד
                                                                    {plan.packageType === "book"
                                                                        ? " (כולל גישה לחוברת)"
                                                                        : ""}
                                                                    .
                                                                </Alert>
                                                                {editError && isCanceling ? (
                                                                    <Alert severity="error" sx={{ mb: 1.5 }}>
                                                                        {editError}
                                                                    </Alert>
                                                                ) : null}
                                                                <Stack direction="row" spacing={1}>
                                                                    <Button
                                                                        variant="contained"
                                                                        color="error"
                                                                        size="small"
                                                                        disabled={cancelLoading}
                                                                        onClick={() => void handleCancelPlan(plan)}
                                                                    >
                                                                        {cancelLoading ? (
                                                                            <CircularProgress size={18} color="inherit" />
                                                                        ) : (
                                                                            "אשר ביטול"
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        disabled={cancelLoading}
                                                                        onClick={dismissCancelPlan}
                                                                    >
                                                                        חזור
                                                                    </Button>
                                                                </Stack>
                                                            </Box>
                                                        ) : null}

                                                        {isEditing ? (
                                                            <Box sx={{ pt: 1 }}>
                                                                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                                                                    <Button
                                                                        size="small"
                                                                        variant={editMode === "days" ? "contained" : "outlined"}
                                                                        onClick={() => setEditMode("days")}
                                                                    >
                                                                        הוסף ימים
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        variant={editMode === "date" ? "contained" : "outlined"}
                                                                        onClick={() => setEditMode("date")}
                                                                    >
                                                                        קבע תאריך
                                                                    </Button>
                                                                </Stack>

                                                                {editMode === "days" ? (
                                                                    <TextField
                                                                        fullWidth
                                                                        type="number"
                                                                        label="ימים להוספה"
                                                                        value={editDays}
                                                                        inputProps={{ min: 1, max: 3650 }}
                                                                        onChange={(event) => {
                                                                            const value = Number(event.target.value);
                                                                            if (Number.isFinite(value)) {
                                                                                setEditDays(value);
                                                                            }
                                                                        }}
                                                                        sx={{ mb: 1.5 }}
                                                                    />
                                                                ) : (
                                                                    <TextField
                                                                        fullWidth
                                                                        type="date"
                                                                        label="תאריך תוקף חדש"
                                                                        value={editDate}
                                                                        onChange={(event) => setEditDate(event.target.value)}
                                                                        InputLabelProps={{ shrink: true }}
                                                                        sx={{ mb: 1.5 }}
                                                                    />
                                                                )}

                                                                {editError ? (
                                                                    <Alert severity="error" sx={{ mb: 1.5 }}>
                                                                        {editError}
                                                                    </Alert>
                                                                ) : null}

                                                                <Stack direction="row" spacing={1}>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        disabled={editLoading}
                                                                        onClick={() => void handleSavePlanEdit(plan)}
                                                                    >
                                                                        {editLoading ? (
                                                                            <CircularProgress size={18} color="inherit" />
                                                                        ) : (
                                                                            "שמור"
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        size="small"
                                                                        disabled={editLoading}
                                                                        onClick={cancelEditingPlan}
                                                                    >
                                                                        ביטול
                                                                    </Button>
                                                                </Stack>
                                                            </Box>
                                                        ) : null}
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                ) : null}

                {step >= 2 ? (
                    step > 2 && selectedPlan ? (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip
                                color="primary"
                                variant="outlined"
                                label={`✓ ${selectedPlan.name} — ${selectedPlan.days} ימים`}
                            />
                            <Link component="button" type="button" variant="body2" onClick={() => setStep(2)}>
                                שנה
                            </Link>
                        </Stack>
                    ) : (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                    שלב 2 — בחירת תוכנית
                                </Typography>

                                {plansLoading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                        <CircularProgress size={28} />
                                    </Box>
                                ) : null}

                                {plansError ? (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {plansError}
                                    </Alert>
                                ) : null}

                                {!plansLoading && !plansError ? (
                                    <>
                                        {selectedPlan?.packageType === "book" ? (
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                תוכנית ספר — בשלב הבא יש להזין שם תלמיד, אימייל לשליחה וסיסמה
                                                לקובץ (כמו ברכישה רגילה).
                                            </Alert>
                                        ) : null}

                                        <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel id="grant-plan-label">תוכנית</InputLabel>
                                            <Select
                                                labelId="grant-plan-label"
                                                label="תוכנית"
                                                value={selectedPlanId}
                                                onChange={(event) => handlePlanChange(event.target.value)}
                                            >
                                                {plans.map((plan) => (
                                                    <MenuItem key={plan.id} value={plan.id}>
                                                        {plan.name} — {plan.days} ימים
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {selectedPlan ? (
                                            <Card variant="outlined" sx={{ mb: 2, bgcolor: "action.hover" }}>
                                                <CardContent>
                                                    <Stack spacing={1}>
                                                        <Typography fontWeight={700}>{selectedPlan.name}</Typography>
                                                        {selectedPlan.description ? (
                                                            <Typography variant="body2">
                                                                {selectedPlan.description}
                                                            </Typography>
                                                        ) : null}
                                                        {selectedPlan.internalDescription ? (
                                                            <Typography variant="caption" color="text.secondary">
                                                                הערה פנימית: {selectedPlan.internalDescription}
                                                            </Typography>
                                                        ) : null}
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                            <Chip
                                                                size="small"
                                                                label={packageTypeLabel(selectedPlan.packageType)}
                                                            />
                                                            <Chip
                                                                size="small"
                                                                variant="outlined"
                                                                label={`משך ברירת מחדל: ${selectedPlan.days} ימים`}
                                                            />
                                                            <Chip
                                                                size="small"
                                                                variant="outlined"
                                                                label={`מחיר רשום: ₪${selectedPlan.price}`}
                                                            />
                                                        </Stack>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ) : null}

                                        {latestActiveUntil ? (
                                            <Alert severity="warning" sx={{ mb: 2 }}>
                                                קיים מנוי פעיל עד {formatDate(latestActiveUntil)} — הענקה תדחף
                                                את התאריך קדימה
                                            </Alert>
                                        ) : null}

                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Button
                                                variant="contained"
                                                disabled={!selectedPlanId}
                                                onClick={() => setStep(3)}
                                            >
                                                הבא
                                            </Button>
                                            <Link
                                                component="button"
                                                type="button"
                                                variant="body2"
                                                onClick={resetFromStep1}
                                            >
                                                חזור
                                            </Link>
                                        </Stack>
                                    </>
                                ) : null}
                            </CardContent>
                        </Card>
                    )
                ) : null}

                {step === 3 && foundUser && selectedPlan ? (
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                                שלב 3 — הגדרת ימים ואישור
                            </Typography>

                            <Stack spacing={1} sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    משתמש: {foundUser.name} ({foundUser.email})
                                </Typography>
                                <Typography variant="body2">תוכנית: {selectedPlan.name}</Typography>
                            </Stack>

                            {selectedPlan.packageType === "book" ? (
                                <Stack spacing={2} sx={{ mb: 2 }}>
                                    <Alert severity="info">
                                        פרטי החוברת יישלחו באימייל — כמו ברכישה רגילה באתר.
                                    </Alert>
                                    <TextField
                                        fullWidth
                                        label="שם התלמיד"
                                        value={studentName}
                                        onChange={(event) => setStudentName(event.target.value)}
                                    />
                                    <TextField
                                        fullWidth
                                        type="email"
                                        label="אימייל לשליחת החוברת"
                                        value={deliveryEmail}
                                        onChange={(event) => setDeliveryEmail(event.target.value)}
                                        helperText="יכול להיות שונה מאימייל המשתמש במערכת"
                                    />
                                    <TextField
                                        fullWidth
                                        label="סיסמה לקובץ PDF"
                                        value={bookPassword}
                                        onChange={(event) => setBookPassword(event.target.value)}
                                        helperText="סיסמה זו תישלח באימייל ותדרוש לפתיחת הקובץ"
                                    />
                                    <TextField
                                        fullWidth
                                        label="טלפון (אופציונלי)"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                    />
                                </Stack>
                            ) : null}

                            <TextField
                                fullWidth
                                type="number"
                                label="מספר ימים להענקה"
                                value={daysToAdd}
                                inputProps={{ min: 1, max: 3650 }}
                                helperText="ניתן לשנות לפי הצורך"
                                onChange={(event) => {
                                    const value = Number(event.target.value);
                                    if (Number.isFinite(value)) {
                                        setDaysToAdd(value);
                                    }
                                }}
                                sx={{ mb: 2 }}
                            />

                            {projectedExpiry ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    תוקף חדש: {formatDate(projectedExpiry)}
                                </Alert>
                            ) : null}

                            {submitError ? (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {submitError}
                                </Alert>
                            ) : null}

                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Button
                                    variant="contained"
                                    disabled={
                                        submitLoading ||
                                        daysToAdd < 1 ||
                                        daysToAdd > 3650 ||
                                        (selectedPlan.packageType === "book" &&
                                            (!studentName.trim() ||
                                                !deliveryEmail.trim() ||
                                                !bookPassword.trim()))
                                    }
                                    onClick={() => void handleGrant()}
                                >
                                    {submitLoading ? (
                                        <CircularProgress size={22} color="inherit" />
                                    ) : selectedPlan.packageType === "book" ? (
                                        "הענק חוברת ושלח אימייל"
                                    ) : (
                                        "הענק מנוי"
                                    )}
                                </Button>
                                <Link component="button" type="button" variant="body2" onClick={() => setStep(2)}>
                                    חזור
                                </Link>
                            </Stack>
                        </CardContent>
                    </Card>
                ) : null}
            </Stack>
        </Box>
    );
}
