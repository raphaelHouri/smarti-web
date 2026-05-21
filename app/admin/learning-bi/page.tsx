import { Suspense } from "react";
import { redirect } from "next/navigation";
import { IsAdmin } from "@/lib/admin";
import { LearningBiDashboard } from "./learning-bi-dashboard";

export default async function LearningBiPage() {
    if (!(await IsAdmin())) {
        redirect("/");
    }

    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center p-8 text-muted-foreground">
                    טוען דשבורד למידה…
                </div>
            }
        >
            <LearningBiDashboard />
        </Suspense>
    );
}
