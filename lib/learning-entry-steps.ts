export type LearningEntryStepValue = "1" | "2" | "3";

export const LEARNING_ENTRY_STEPS: Array<{
  value: LearningEntryStepValue;
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
}> = [
  {
    value: "1",
    title: "שלב א׳",
    subtitle: "כיתה ב׳",
    description:
      "היכרות בסיסית עם מבנה המבחנים, תרגולים קלים וחווייתיים להתחלה רכה.",
    imageSrc: "/smarti_step1.webp",
  },
  {
    value: "2",
    title: "שלב ב׳",
    subtitle: "כיתה ב׳–ג׳",
    description:
      "העמקה בפתרון שאלות, הרחבת אוצר המילים וחיזוק חשיבה לוגית.",
    imageSrc: "/smarti_step2.webp",
  },
  {
    value: "3",
    title: "כיתה ג׳ — שלב ב׳",
    subtitle: "כיתה ג׳",
    description:
      "הכנה מתקדמת לקראת מבחנים מאתגרים, סימולציות ותרגול ממוקד.",
    imageSrc: "/smarti_step3.webp",
  },
];
