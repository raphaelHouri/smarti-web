import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "גשו לשיעורים ולתרגולים לפי המסלול האישי שלכם בסמרטי.",
    keywords: ["שיעורים", "תרגולים", "מסלול אישי"],
});

const LessonPage = async () => {
    redirect("/learn");
};

export default LessonPage;