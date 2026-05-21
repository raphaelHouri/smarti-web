"use client";

import { LearningBiDashboard } from "./learning-bi-dashboard";

/** Used from Refine `<CustomRoutes />` (`/learning-bi` inside the admin SPA); prefer `/admin/learning-bi` for full server auth. */
export default function LearningBiWrapper() {
    return <LearningBiDashboard />;
}
