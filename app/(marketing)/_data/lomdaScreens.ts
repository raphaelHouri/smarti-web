/**
 * סיור מסכים בלומדה — נתונים לקרוסלת ראש העמוד ולגריד "סיור במערכת".
 */

export type LomdaScreen = {
  /** מזהה ייחודי לקישור עוגן או למפתח */
  id: string;
  /** כותרת קצרה לכרטיס/שקופית */
  title: string;
  /** תיאור הערך הצרכני של המסך */
  description: string;
  /** רשימת יכולות / תועלות לפירוט בכרטיס המלא */
  highlights: string[];
  /** נכס תמונה לשולחן עבודה */
  imageSrcDesktop: string;
  /** נכס תמונה למובייל */
  imageSrcMobile: string;
  /** האם להציג מסגרת כפולה למסך זה (למשל למשובים) */
  secondaryImageSrcDesktop?: string;
  secondaryImageSrcMobile?: string;
  /** טקסט חלופי לנגישות ולקידום */
  alt: string;
};

export const lomdaScreens: LomdaScreen[] = [
  {
    id: "main-learn",
    title: "מסלול תרגול של כל נושאי הפרקים",
    description: "הצגת שלבי הפיתוח של התלמיד, עם מסלול ברור ומובנה לכל נושאי הלימוד.",
    highlights: [
      "נושאים מסודרים לפי שלב הבחינה ברצף הגיוני",
      "המלצה אוטומטית על הנושא הבא לפי ההתקדמות",
      "חיווי ויזואלי להשלמת משימות וצבירת נקודות",
    ],
    imageSrcDesktop: "/app-screens/desktop/main-learn.png",
    imageSrcMobile: "/app-screens/phone/main-learn.png",
    alt: "מסך מסלול הלמידה המציג את ההתקדמות והנושאים השונים",
  },
  {
    id: "summary-question",
    title: "פתרונות תרגול ותרגול עם זמן",
    description: "תרגול אדפטיבי שמתאים את עצמו לרמת הילד, כולל טיימר כדי לדמות מבחן אמיתי ופתרונות מלאים.",
    highlights: [
      "מנגנון תרגול נגד הזמן המדמה את המבחן בזמן אמת",
      "הסבר פתרון מפורט לכל שאלה, צעד אחר צעד",
      "תצוגה שקופה של התשובות הנכונות והשגויות תוך כדי תרגול",
    ],
    imageSrcDesktop: "/app-screens/desktop/summary-question-lesson.png",
    imageSrcMobile: "/app-screens/phone/summary-question-lesson.png",
    alt: "מסך פתרונות תרגול המציג שאלה, טיימר, ופירוט הפתרון הנכון",
  },
  {
    id: "feedbacks",
    title: "סיכום תרגול ופידבקים מעודדים",
    description: "בסוף כל תרגול, הילד מקבל פידבק חיובי שמחזק את הביטחון, יחד עם סיכום ביצועים.",
    highlights: [
      "הענקת מטבעות וכוכבים על הצלחות",
      "חיווי על עליית שלבים המגביר את המוטיבציה",
      "אנימציות עידוד כיפיות בכל סיום פרק",
    ],
    imageSrcDesktop: "/app-screens/desktop/summary-lesson.png",
    imageSrcMobile: "/app-screens/phone/summary-lesson.png",
    secondaryImageSrcDesktop: "/app-screens/desktop/feedbacks.png",
    secondaryImageSrcMobile: "/app-screens/phone/feedbacks.png",
    alt: "מסכי סיכום שיעור ופידבקים מעודדים עם אנימציות ופרסים",
  },
  {
    id: "wrong-practice",
    title: "תרגול שאלות וניתוח נושאים",
    description: "ניתוח חכם של נושאים שכדאי לתרגל שוב ומנגנון 'תרגול טעויות' ממוקד.",
    highlights: [
      "אזור ייעודי המרכז את כל הטעויות מהעבר",
      "פילוח סטטיסטי אילו נושאים כדאי לחזק",
      "גרפים ועוגת נתונים לשקיפות מלאה מול ההורים",
    ],
    imageSrcDesktop: "/app-screens/desktop/wrong-practice.png",
    imageSrcMobile: "/app-screens/phone/wrong-practice.png",
    alt: "מסך ניתוח טעויות וסטטיסטיקת נושאים לתרגול חוזר",
  },
  {
    id: "leaderboard",
    title: "טבלת מובילים ועוד המון פיצ'רים",
    description: "עידוד ללמידה באמצעות תחרות בריאה, טבלת הישגים ארצית ועוד כלים לחיזוק הלמידה.",
    highlights: [
      "טבלת מיקומים ארצית המחולקת לפי כיתות ורמות",
      "תחושת הישגיות המעודדת תרגול נוסף ברמה היומית",
      "פיצ'רים מתקדמים נוספים המסייעים בתהליך הלמידה",
    ],
    imageSrcDesktop: "/app-screens/desktop/leadboard.png",
    imageSrcMobile: "/app-screens/phone/leaderboard.png",
    alt: "מסך טבלת מובילים ודירוג תלמידים",
  },
];
