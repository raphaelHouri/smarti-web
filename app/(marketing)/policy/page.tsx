import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = buildMetadata({
    title: "תקנון ומדיניות פרטיות | סמארטי",
    description: "תקנון, תנאי שימוש ומדיניות פרטיות של אפליקציית סמארטי - הכנה למבחני מחוננים",
    keywords: ["תקנון", "מדיניות פרטיות", "תנאי שימוש", "מחוננים"],
});

export default function PolicyPage() {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12" dir="rtl">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="mb-4">
                        <ArrowRight className="ml-2 h-4 w-4" />
                        חזרה לעמוד הבית
                    </Button>
                </Link>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                    תקנון, תנאי שימוש ומדיניות פרטיות
                </h1>
                <p className="text-muted-foreground text-lg">
                    הכנה לתוכנית מחוננים
                </p>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-foreground">
                <section className="space-y-4">
                    <p className="leading-relaxed">
                        המייסדים (להלן &quot;היוצרים&quot; או/ו &quot;החברה&quot; או/ו &quot;השותפות&quot; או/ו &quot;בית ספר לחיים&quot;) מברכים את בחירתכם להשתמש באפליקציית &quot;הכנה למבחן מחוננים&quot; המופעלת על ידם בהתאם להוראות השימוש המפורטות בתקנון זה.
                    </p>
                    <p className="leading-relaxed">
                        הכנה למבחן מחוננים הינה אפליקציה מציעה למשתמשיה פלטפורמה מקוונת, נוחה ובטוחה, לקבלת מידע בנוגע לתוכנית מחוננים ומצטיינים וכיו&quot;ב(&quot;האפליקציה&quot; ו- &quot;התכנים&quot; בהתאמה). בנוסף, האפליקציה מעניקה למשתמשים אפשרות לרכישת מנוי לקבלת גישה למידע נוסף, מערכת למידה להכנה למבחן מחוננים (&quot;המוצרים&quot;)
                    </p>
                    <p className="leading-relaxed">
                        תקנון ותנאי שימוש אלה מהווים הסכם מחייב בינכם לבין האפליקציה בנוגע לשימוש באפליקציה בכל טלפון סלולרי, טאבלט או מכשיר תקשורת אחר כדוגמת מחשב. כמו כן הם חלים על השימוש באפליקציה, בין באמצעות רשת האינטרנט ובין באמצעות כל רשת או אמצעי תקשורת אחר. קראו את תנאי השימוש בקפידה, שכן השימוש באפליקציה וביצוע פעולות בה מעידים על הסכמתכם לתנאים הכלולים בתקנון ותנאי שימוש אלו (&quot;התקנון&quot;)
                    </p>
                    <p className="leading-relaxed font-medium">
                        בעת הרשמתי וסימון תיבת ההסכמה מטה, אני מאשר/ת את תנאי התקנון ומדיניות הפרטיות המצורפים.
                    </p>
                    <p className="leading-relaxed">
                        להסרת פרטייך ממאגר החברה, יש לשלוח מייל לכתובת{" "}
                        <a href="mailto:contact@smarti-kids.co.il" className="text-primary hover:underline">
                            contact@smarti-kids.co.il
                        </a>
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">כללי:</h2>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li>האמור בתקנון זה מתייחס באופן שווה לבני שני המינים והשימוש בלשון זכר או נקבה הוא מטעמי נוחות בלבד.</li>
                        <li>השימוש באפליקציה מותר בכל גיל.</li>
                        <li>תנאי תקנון זה מהווים את כל ההסכמות וההבנות בנוגע לשימוש באפליקציה. אי מימוש או אכיפה של זכות או הוראה בתקנון זה, לא תחשב כוויתור מצד האפליקציה על מימוש הזכות או אכיפת ההוראה. האפליקציה תהיה רשאי להמחות לאחרים את כל או חלק מזכויותיה ו/או חובותיה בתקנון זה.</li>
                        <li>במקרה שייקבע כי הוראה בתקנון זה אינה ניתנת לאכיפה או שהינה חסרת תוקף מטעם כלשהו, לא יהא בכך כדי להשפיע או לפגוע בחוקיותן, תקפותן ואכיפתן של שאר הוראות התקנון.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">התכנים והשירותים המוצעים באפליקציה:</h2>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li>האפליקציה מאפשרת למשתמש לקבל מידע בתחום לימודי מבחן מחוננים של משרד החינוך.</li>
                        <li>התכנים, המוצרים והשירותים המוצעים באפליקציה יופיעו ויוצגו באפליקציה.</li>
                        <li>האפליקציה אינה מחויבת, בכל דרך שהיא, לקיים מגוון כלשהו של שירותים ו/או מוצרים ו/או תכנים.</li>
                        <li>אופן הצגת התכנים, המוצרים השירותים והמידע באפליקציה הינו על-פי שיקול דעתה הבלעדי של האפליקציה.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">הצהרת משתמש:</h2>
                    <p className="leading-relaxed">
                        בטרם השימוש באפליקציה, גולשי ולקוחות האפליקציה מצהירים, מאשרים ומסכימים כי ידוע להם:
                    </p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li>שהתכנים, המוצרים והשירותים ניתנים ומסופקים לשם הלימוד האישי והאימון בלבד.</li>
                        <li>יובהר כי, האפליקציה אינה מתחייבת לציון ו/או תוצאה מסוימים לאחר שימוש בשירותי הלימוד וההוראה המסופקים באפליקציה והאחריות לרצינות, השקעה ולימוד החומר הינה על התלמיד.</li>
                        <li>שללקוחות האפליקציה לא תהיה כל טענה כלפי האפליקציה, מנהליה, עובדיה או מי מטעמה והם לא יהיו אחראים, באופן ישיר או עקיף, לכל נזק לרבות, לגוף, לרכוש או לכל נזק אחר או לכל הפסד אחר, אשר יגרם כתוצאה מקבלת תוכן מהאפליקציה ו/או מהמוצרים ו/או מהשירותים הניתנים באפליקציה, אפילו אם האפליקציה הזהירה, המליצה או ייעצה לעניין מסוים או על שירות מסוים ובשום מקרה האפליקציה לא תהווה תחליף או תישא באחריות הלקוח ו/או מקבל השירות. על הלקוח חלה האחריות וכל סיכון חובה עבור נזק וחבלה לגופו ו/או לרכושו ו/או לרכושם ו/או לגופם של צדדים שלישיים, הנובעים מהשימוש ו/או אי השימוש בשירותים, בתכנים, בשיעורים ובמוצרים המוצגים באפליקציה.</li>
                        <li>שהאפליקציה ניתנת לשימוש כפי שהיא (AS IS) והשימוש בה הוא על אחריותו המלאה של המשתמש;</li>
                        <li>שלא ניתן לעשות שימוש באפליקציה ללא אישור ופיקוח מבוגר בעל כשירות משפטית מגיל 18 ומעלה;</li>
                        <li>שבשימוש באפליקציה הגולש לא יפר כל חוק, תקנה או הוראה שלטונית אחרת.</li>
                    </ul>
                    <p className="leading-relaxed">
                        האפליקציה אינה מתחייבת בנוגע למידת הדיוק או השלמות של תיאורי השירות באפליקציה ולא תישא באחריות לכל שגיאה, טעות או נזק.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">הרשמה, שימוש ורכישה באפליקציה:</h2>
                    <p className="leading-relaxed">
                        על מנת לבצע פעולות מסוימות ו/או רכישה באפליקציה, האפליקציה דורשת הרשמה. לצורך ההרשמה, ייתכן ויידרש מהמשתמש להזין פרטים מייל וסיסמה לצורך זיהוי (נתון לשיקול דעת האפליקציה).
                    </p>
                    <p className="leading-relaxed">
                        מובהר כי אין חובה על פי חוק למסור את המידע, אולם ללא הזנת הפרטים והנתונים המבוקשים או מסירת פרטים שגויים, ייתכן לא ניתן יהיה להשתמש בשירותי האפליקציה.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה לא תעשה בפרטים שנמסרו שימוש, אלא בהתאם להוראות התקנון ובהתאם למדיניות הפרטיות להלן המהווה חלק בלתי נפרד מתקנון זה.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה רשאית לקבוע, מעת לעת, דרכי זיהוי לכניסה לאפליקציה ובכלל זה התחברות לאפליקציה דרך הפייסבוק ו/או רשת חברתית אחרת ו/או פלטפורמה אחרת, באמצעותם יוכלו המשתמשים להתחבר ולצפות בתכנים ו/או בקורסים המקוונים באפליקציה.
                    </p>
                    <p className="leading-relaxed">
                        בשימוש באפליקציה המשתמש מאשר כי: (1) לא יירשם לאפליקציה עם פרטים חלקיים או שגויים ולא יתחזה למשתמש אחר; (2) לא יעביר לאחר את שם המשתמש והסיסמה לחשבונו האישי ו/או יאפשר לאחר גישה לחשבונו האישי.
                    </p>
                    <p className="leading-relaxed">
                        אנו שומרים לעצמנו את הזכות להסיר, להשיב, או לשנות כל שם משתמש בו תבחרו, במידה ונחליט ששם המשתמש אינו ראוי או מכל סיבה אחרת.
                    </p>
                    <p className="leading-relaxed">
                        מתן השירות יתאפשר בכפוף לשיקול דעתה הבלעדי של האפליקציה והאפליקציה לא תהא אחראית לכל איחור ו/או עיכוב במתן השירות ו/או אי-מתן השירות, כתוצאה מכוח עליון ו/או תקלות טכניות ו/או מגפה ו/או מאירועים שאינם בשליטתה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">מדיניות שינויים וביטולים:</h2>
                    <p className="leading-relaxed">
                        בקשה לביטול המשתתמש תועבר לאפליקציה באחד מאמצעי ההתקשרות המופיעים בתחתית התקנון.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">חנויות האפליקציות אנדרואיד ואפל:</h2>
                    <p className="leading-relaxed">
                        התנאים הבאים נוגעים לשימוש באפליקציה שהורדה דרך Apple Store (אפל סטור),) Google Play גוגל פליי) (״חנויות האפליקציות״):
                    </p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li>רישיון השימוש באפליקציה מוגבל ובלתי ניתן להעברה במכשיר בו הנך משתמש וכפוף לתנאי השימוש של חנויות האפליקציות.</li>
                        <li>אחריות האפליקציה לתחזוקה ותמיכה באפליקציה תהיה כאמור בתקנון זה.</li>
                        <li>הנך מצהיר ומסכים כי: (1) אינך עושה שימוש באפליקציה במדינה הכפופה לאמברגו של ממשלת ארה״ב או מדינה המוגדרת על ידי ממשלת ארה״ב כמדינת ״תומכת טרור״; (2) אינך נמצא ברשימה אסורה או מוגבלת של ממשלת ארה״ב.</li>
                        <li>בעת שימוש באפליקציה, הנך מתחייב לעמוד בהוראות חנויות האפליקציות וצד שלישי.</li>
                        <li>הנך מסכים ומאשר כי חנויות האפליקציות מוטבות כצד שלישי לתנאי תקנון זה ורישיון השימוש באפליקציה וכי לכל חנות אפליקציות תהיה הזכות לאכוף את תנאי תקנון זה.</li>
                        <li>האפליקציה רשאית בכל עת לגבות תשלום בעבור הורדת האפליקציה ו/או השימוש באפליקציה.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">פעילות אסורה באפליקציה:</h2>
                    <p className="leading-relaxed">
                        אינך רשאי להשתמש באפליקציה אלא למטרות שלשמן היא נועדה. השימוש באפליקציה מותר למטרות פרטיות ואישיות בלבד ואין לעשות בה שימוש למטרות מסחריות למעט כאלו שיאושרו על ידי האפליקציה באופן ספציפי.
                    </p>
                    <p className="leading-relaxed font-medium">כמשתמשי האפליקציה, אתם מסכימים שלא:</p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li>לאחזר נתונים או תוכן אחר מהאפליקציה כדי ליצור או להרכיב אוסף, מסד נתונים או מדריך ללא אישור מראש ובכתב מהאפליקציה;</li>
                        <li>לעשות שימוש לא מורשה באפליקציה, לרבות איסוף שמות משתמש ו/או כתובות דוא&quot;ל וכל מידע נוסף באמצעים אלקטרוניים או אחרים לצורך שליחת דוא&quot;ל באמצעים אוטומטיים ו/או יצירה של חשבונות משתמש באמצעים אוטומטיים;</li>
                        <li>לעקוף, להשבית או להפריע בדרך אחרת לאבטחה האפליקציה, לרבות שימוש ביישומים המונעים או מגבילים את השימוש או ההעתקה של תוכן כלשהו;</li>
                        <li>להונות או להטעות את האפליקציה;</li>
                        <li>להטעות, לרמות או להוליך שולל משתמשים אחרים באפליקציה ו/או את האפליקציה, במיוחד בניסיון כלשהו ללמוד מידע רגיש אודות משתמשים כגון סיסמאות, או כל מידע אחר.</li>
                        <li>לעשות שימוש לא נכון בשירותי התמיכה של האפליקציה או להגיש דוחות כוזבים בנוגע לשימוש באפליקציה;</li>
                        <li>לעשות שימוש אוטומטי באפליקציה, כגון שימוש בסקריפטים לשליחת הערות או הודעות, או שימוש בכריית נתונים, רובוטים או כלי איסוף וחילוץ נתונים דומים;</li>
                        <li>להפריע ו/או ליצור נטל על השימוש באפליקציה ו/או על השרתים אליהם היא מחוברת;</li>
                        <li>לנסות להתחזות למשתמש או לאדם אחר ;</li>
                        <li>למכור או להעביר את חשבון המשתמש שלך לאחר;</li>
                        <li>להשתמש במידע שהתקבל באפליקציה על מנת להטריד, להתעלל או לפגוע באדם אחר;</li>
                        <li>להשתמש באפליקציה כחלק מכל מאמץ להתחרות באפליקציה;</li>
                        <li>לאחזר, לפענח או להנדס לאחור חלק מהאפליקציה, אפשרות באפליקציה או יישום באפליקציה;</li>
                        <li>לנסות לעקוף כל חלק מהאפליקציה במטרה למנוע גישה לאפליקציה, או כל חלק ממנה;</li>
                        <li>להטריד, להפחיד או לאיים על כל אחד מעובדי האפליקציה;</li>
                        <li>למחוק את זכויות היוצרים או את הודעת הזכויות הקנייניות מכל תוכן או סימן;</li>
                        <li>להעתיק או להתאים את קוד האפליקציה או חלק ממנו, כולל אך לא רק Flash, PHP, HTML, JavaScript או קוד אחר;</li>
                        <li>להעלות או להעביר (או לנסות להעלות או להעביר) וירוסים, סוסים טרויאניים, או חומר אחר, כולל שימוש בדואר זבל, אשר יפריע לשימוש באפליקציה;</li>
                        <li>למעט שימוש במנוע חיפוש, או שימוש בדפדפני אינטרנט, להשתמש, להפעיל, לפתח או להפיץ כל מערכת אוטומטית לרבות, כל עכביש (Spider) או רובוט אשר באמצעותו ניתן להתחבר לאפליקציה.</li>
                        <li>לבצע פעולה שתפגע או תזיק לאפליקציה, בהתאם לשיקול דעתה של האפליקציה;</li>
                        <li>להשתמש באפליקציה באופן שאינו עולה בקנה אחד עם החוק, התקנות והפסיקה;</li>
                    </ul>
                    <p className="leading-relaxed">
                        כל שימוש באפליקציה תוך הפרה של הסעיפים האמורים לעיל עלול לגרום, בין היתר אך לא רק, לסיום או השעיית זכויותיך לשימוש באפליקציה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">מדיניות פרטיות:</h2>
                    <p className="leading-relaxed">
                        כאמור, בעת שימושכם באפליקציה ופרסום פרטיכם בהקמת הפרופיל, אתם מאשרים ומודעים כי האפליקציה רשאית לשמור את המידע במאגרי האפליקציה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">מדיניות פרסום תכנים באפליקציה:</h2>
                    <p className="leading-relaxed">
                        האפליקציה אינה מכילה דברי פירסום חיצוניים.
                    </p>
                    <p className="leading-relaxed">
                        אנו שומרים לעצמנו את הזכות הבלעדית לקבל, למחוק או לסרב לביקורות. אין לנו שום מחויבות שהיא להציג או למחוק ביקורות, גם אם מישהו טוען שהביקורת מוטעית או סובייקטיבית.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">אחריות האפליקציה:</h2>
                    <p className="leading-relaxed">
                        אין לראות במידע המופיע באפליקציה משום הבטחה לתוצאה כלשהי ו/או אחריות לאופן מתן השירות. האפליקציה לא תהיה אחראית לשום נזק, ישיר או עקיף, אשר ייגרם למשתמש כתוצאה מהסתמכות על מידע המופיע באפליקציה ו/או בקישורים אחרים ו/או כל מקור מידע פנימי ו/או חיצוני אחר ו/או שימוש בשירותים אשר מוצגים על ידה.
                    </p>
                    <p className="leading-relaxed">
                        התכנים באפליקציה ניתנים לשימוש כמות שהם (AS-IS). לא ניתן להתאימם לצרכיו של כל אדם ואדם. לא תהיה למשתמש כל טענה, תביעה או דרישה כלפי האפליקציה בגין תכונות של התכנים, יכולותיהם, מגבלותיהם ו/או התאמתם לצרכיו והשימוש באפליקציה יהיה על אחריותו הבלעדית של המשתמש באפליקציה.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה אינה צד להתקשרות בין הלקוח למפרסם באפליקציה והיא פועלת אך ורק בכדי לתווך מידע בין המשתמשים. רכישה ו/או עסקה עם משתמשים באפליקציה תתבצע באופן ישיר בין המשתמשים והאפליקציה אינה צד לה.
                    </p>
                    <p className="leading-relaxed">
                        מידע ומצגים המוצגים באפליקציה, שמקורם במשתמשים אחרים המפרסמים באפליקציה וכל תוכן ביחס למוצגים נמצאים באחריותם הבלעדית של המפרסמים כאמור, ועל כן מובן שלאפליקציה אין כל אחריות בגין מידע מעין זה, ואין האפליקציה ערבה למידת הדיוק של מידע זה. לפיכך, האפליקציה לא תהווה תחליף או תישא באחריות על אופן אספקת, מועד האספקה, טיב המוצגים, תשלום וכיו״ב. במקרה זה, המפרסמים יישאו באחריות על כל פניה ו/או תביעה ו/או דרישה של משתמשי האפליקציה אשר רכשו דרכם בגין פיצוי בגין כל נזק, ישיר או עקיף, אשר ייגרם להם.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה לא תהיה אחראית לכל נזק (ישיר או עקיף), הפסד, עגמת נפש והוצאות שייגרמו למשתמשים ו/או לצדדים שלישיים כלשהם בעקבות שימוש או הסתמכות על כל תוכן, מידע, נתון, מצג, תמונה, וידאו, אודיו, פרסומת, מוצר, שירות וכו&apos; המופעים באפליקציה. כל הסתמכות כאמור נעשית על-פי שיקול דעתו ואחריותו הבלעדית של המשתמש באפליקציה.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה ממליצה למשתמשים לנהוג בתבונה ובזהירות, ולקרוא בעיון את המידע המוצג באפליקציה ובכלל זה את המידע ביחס לשירות עצמו, תיאורו והתאמתו, כמתואר להלן.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה אינה אחראית על מספר הלקוחות שיפנו למפרסם ו/או ירכשו ממפרסם, ולמפרסמים המשתמשים בשירותי האפליקציה לא תהיה כל טענה ו/או דרישה ו/או תביעה כלפי האפליקציה בגין מספר הלקוחות שיפנו אליהם ו/או ירכשו מהם מוצרים.
                    </p>
                    <p className="leading-relaxed">
                        השימוש באפליקציה ייעשה על אחריותו הבלעדית והמלאה של כל משתמש. כל החלטה שתתקבל ביחס לתכנים שיתפרסמו באפליקציה הינה באחריותו המלאה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">תוכן צד שלישי:</h2>
                    <p className="leading-relaxed">
                        האפליקציה עשויה להכיל קישורים לאפליקציות ו/או אתרים אחרים (״אפליקציות צד שלישי״), כמו גם למאמרים, תמונות, טקסט, גרפיקה, תמונות, עיצובים, מוסיקה, סאונד, וידאו, מידע, יישומים, תוכנות ותכנים השייכים או שמקורם באפליקציות צד שלישי. אפליקציות צד שלישי ותוכן של צד שלישי אינם נחקרים, מנוטרים, או נבדקים על ידינו ולא מתבצעת על ידנו בדיקת נאותות או שלמות, ואנחנו לא אחראים לכל תוכן של צד שלישי שאליו ניתן להגיע באמצעות האפליקציה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">שינויים באפליקציה, תקלות והפסקות שירות:</h2>
                    <p className="leading-relaxed">
                        האפליקציה שומרת את הזכות לשנות מעת לעת או להסיר את תוכן האפליקציה מכל סיבה שהיא לפי שיקול דעתה הבלעדי וללא הודעה מוקדמת. האפליקציה אינה מחויבת לעדכן מידע או תוכן כלשהו באפליקציה.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה שומרת את הזכות גם לשנות או להפסיק את כל פעולתה ללא הודעה מוקדמת. האפליקציה לא תהיה אחראית כלפיך או כלפי צד שלישי כלשהו עבור שינוי, השעיה או הפסקת שירות כאמור.
                    </p>
                    <p className="leading-relaxed">
                        האפליקציה אינה מתחייבת ששירותיה לא יופרעו, יינתנו כסדרם או בלא הפסקות, יתקיימו בבטחה וללא טעויות ויהיו חסינים מפני גישה בלתי מורשית למחשבי או שרתי האפליקציה או מפני נזקים, קלקולים, תקלות או כשלים - והכל, בחומרה, בתוכנה, בקווי ובמערכות תקשורת אצל האפליקציה או אצל מי מספקיו.
                    </p>
                    <p className="leading-relaxed">
                        אנו שומרים לעצמנו את הזכות לשנות, לעדכן, להשעות או להפסיק את שירותי האפליקציה בכל עת או מכל סיבה שהיא מבלי הודעה מוקדמת. אתם מסכימים כי אין לנו כל אחריות כלשהי לאובדן, נזק או אי נוחות שיגרמו לכם כתוצאה מחוסר יכולתכם לגשת לשירותי האפליקציה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">ניהול האפליקציה:</h2>
                    <p className="leading-relaxed">
                        האפליקציה שומרת את זכותה: (1) לוודא ולאכוף הפרות של תנאי תקנון זה; (2) לנקוט בפעולות משפטיות כנגד מי שיפר את תנאי תקנון זה, בהתאם לשיקול דעתה הבלעדי של האפליקציה, לרבות דיווח לרשויות אכיפת החוק; (3) בהתאם לשיקול דעתה הבלעדי של האפליקציה, להגביל את הגישה או הזמינות או להשבית (ככל שניתן מבחינה טכנולוגית) כל התרומה שלך או חלק ממנה לאפליקציה; (4) בהתאם לשיקול דעתה הבלעדי של האפליקציה, להסיר מהאפליקציה או להשבית באופן אחר כל קובץ או תוכן מוגזם או שמכביד על האפליקציה; (5) לפעול לתפקודה התקין של האפליקציה והמכשיר המשויך, לרבות שמירה על הזכויות הקנייניות בהם.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">דיוק או תיקונים טכניים ואחריות:</h2>
                    <p className="leading-relaxed">
                        האפליקציה בכללותה, לרבות כל המידע המופיע בה, מוצע לציבור כמות שהוא, ויהיה מדויק ונכון ככל הניתן, ואולם, יתכן והמידע אינו שלם או לחלופין, יתכן ונפלו טעויות טכניות או אחרות במידע. האפליקציה שומרת על זכותה לתקן טעויות ו/או שגיאות ו/או אי דיוקים כאמור ולעדכן את המידע באפליקציה בכל עת וללא הודעה מוקדמת.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">אבטחת מידע:</h2>
                    <p className="leading-relaxed">
                        האפליקציה ומי מטעמה נוקטים צעדים סבירים על מנת לסייע בהגנה על אבטחת הנתונים האישיים של המשתמשים. האפליקציה עושה מאמצים על מנת לאסוף את המידע ולאבטחו בהתאם למדיניות הפרטיות ולחוקים והתקנות החלים במדינת ישראל.
                    </p>
                    <p className="leading-relaxed">
                        חשוב לזכור שלא ניתן לערוב במאת האחוזים מפני פעילות עוינת ונחושה מצד גורמים זרים ולכן אין בפעולות אלה בטחון מוחלט והאפליקציה לא מתחייבת שהשירותים בה יהיו חסינים באופן מוחלט מפני גישה בלתי מורשית למידע הנאסף בה, בעקבות פריצה ו/או פגם במערכות האפליקציה.
                    </p>
                    <p className="leading-relaxed">
                        למשתמשי האפליקציה לא תהיה כל טענה ו/או דרישה ו/או תביעה כלפי מנהלי האפליקציה או מי מטעמם בגין גישה בלתי מורשית למידע שנאסף עליהם על ידי האפליקציה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">סיום:</h2>
                    <p className="leading-relaxed">
                        תנאי תקנון זה יישארו בתוקפם בעת השימוש באפליקציה. מבלי לגרוע מכל הוראה אחרת בתקנון זה, האפליקציה שומרת על זכותה למנוע מכל משתמש את השימוש באפליקציה (לרבות חסימת כתובות IP מסוימות), מכל סיבה או נימוק שהוא (מבלי שתצטרכו לספק סיבה או נימוק), לשיקול דעתה הבלעדי, ללא צורך בהודעה מוקדמת או התראה ומבלי שתהיה אחראית לנזק כלשהו עקב החלטתה. כמו כן, האפליקציה רשאית להפסיק את השימוש שלכם בה ו/או למחוק את חשבונכם וכל תוכן או מידע שפרסמתם בכל עת, ללא אזהרה מראש.
                    </p>
                    <p className="leading-relaxed font-medium">מבלי לגרוע מהאמור לעיל, האפליקציה רשאית למנוע שימוש ממשתמש, או לחסום גישתם אליה בכל אחד מהמקרים הבאים:</p>
                    <ul className="list-disc list-inside space-y-2 pr-4">
                        <li>אם בעת ההרשמה לאפליקציה נמסרו במתכוון פרטים שגויים;</li>
                        <li>במקרה שנעשה שימוש באפליקציה לביצוע או כדי לנסות לבצע מעשה בלתי חוקי על-פי דיני מדינת ישראל, או מעשה הנחזה על פניו כבלתי חוקי כאמור, או כדי לאפשר, להקל, לסייע או לעודד ביצועו של מעשה כזה;</li>
                        <li>אם הופרו תנאי תקנון זה;</li>
                        <li>אם נעשה שימוש באפליקציה במטרה להתחרות באפליקציה;</li>
                        <li>אם נעשתה על ידי משתמש כל פעולה שתמנע מאחרים להצטרף לאפליקציה או להמשיך ולהשתמש באפליקציה בכל דרך שהיא.</li>
                    </ul>
                    <p className="leading-relaxed">
                        אם יוחלט לסגור או להשהות את חשבונך באפליקציה, ככל ותהיה אפשרות לפתיחת חשבון, אינך רשאי לפתוח חשבון נוסף בשמך, בשם מזויף או מושאל או בשמו של צד שלישי כלשהו. בנוסף לסגירת או השהיית חשבון, האפליקציה שומרת לעצמה את הזכות לנקוט בכל פעולה משפטית.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">הפרת זכויות יוצרים:</h2>
                    <p className="leading-relaxed">
                        אנו מכבדים את זכויות הקניין של אחרים. אם אתה מאמין כי מידע או תוכן באפליקציה מפר את זכויות קנייניות השייכות לך, אנא צור קשר באמצעות פרטי ההתקשרות שבתחתית תקנון זה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">סמכות שיפוט:</h2>
                    <p className="leading-relaxed">
                        על תקנון זה יחולו אך ורק דיני מדינת ישראל, אולם לא תהיה תחולה לכללי ברירת הדין הבינלאומי הקבועים בהם.
                    </p>
                    <p className="leading-relaxed">
                        לבתי המשפט במחוז דרום תהיה סמכות שיפוט ייחודית בכל עניין הנובע ו/או הקשור לתקנון זה.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">מדיניות החזרת מוצרים והחזרים כספיים:</h2>
                    <p className="leading-relaxed">
                        המוצרים הנמכרים באתר Smarti הם ספרים מודפסים (מוצרים פיזיים) הנשלחים ללקוח.
                    </p>
                    <p className="leading-relaxed">
                        בהתאם לחוק הגנת הצרכן בישראל, ניתן לבטל עסקה ולהחזיר מוצר בתוך 14 ימים מיום קבלת המוצר, ובלבד שהמוצר לא נעשה בו שימוש, לא נפתח, לא נכתב ולא נפגע, והוא מוחזר באריזתו המקורית ובמצב חדש.
                    </p>
                    <p className="leading-relaxed">
                        לאחר קבלת המוצר ובדיקתו, יינתן החזר כספי באמצעי התשלום המקורי בתוך עד 7 ימי עסקים, בניכוי דמי משלוח, ככל שנגבו.
                    </p>
                    <p className="leading-relaxed">
                        לא ניתן להחזיר מוצרים שנעשה בהם שימוש, נפתחו, נכתבו או נפגעו.
                    </p>
                    <p className="leading-relaxed">
                        במקרה של פגם במוצר או טעות במשלוח, ניתן לפנות לשירות הלקוחות בתוך 48 שעות מקבלת המוצר לצורך טיפול והחלפה.
                    </p>
                    <p className="leading-relaxed">
                        לפניות בנושא החזרות והחזרים כספיים ניתן ליצור קשר בדוא״ל:{" "}
                        <a href="mailto:contact@smarti-kids.co.il" className="text-primary hover:underline">
                            📧 contact@smarti-kids.co.il
                        </a>
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold mt-8 mb-4">מחיקת מידע:</h2>
                    <p className="leading-relaxed">
                        אם הינך מעוניין למחוק את המידע אשר שמור עליך באפליקציה, עליך לשלוח פנייה לכתובת הדואר האלקטרוני{" "}
                        <a href="mailto:contact@smarti-kids.co.il" className="text-primary hover:underline">
                            contact@smarti-kids.co.il
                        </a>
                        . הבקשה צריכה לכלול את פרטי המשתמש שאותו הינכם מעוניינים למחוק.
                    </p>
                </section>

                <section className="space-y-4 border-t pt-8 mt-8">
                    <h2 className="text-2xl font-bold mb-4">צרו קשר:</h2>
                    <p className="leading-relaxed">
                        האפליקציה מקפידה על קיום הוראות החוק ומכבדת את זכותם של משתמשי האפליקציה ואחרים לפרטיות ולשם טוב. אם אתה סבור כי פורסם באפליקציה תוכן הפוגע בך מטעם כלשהו, נא פנה אלינו לפי הפרטים שלהלן ואנו נשתדל לטפל בפנייתך בכל ההקדם. פניות כאמור ניתן להעביר באמצעים הבאים:
                    </p>
                    <div className="space-y-2 pr-4 mt-4">
                        <p><strong>כתובת:</strong> שחל 64 ירושלים</p>
                        <p><strong>טלפון:</strong> <a href="tel:0586519423" className="text-primary hover:underline">0586519423</a>;</p>
                        <p><strong>דוא&quot;ל:</strong> <a href="mailto:contact@smarti-kids.co.il" className="text-primary hover:underline">contact@smarti-kids.co.il</a></p>
                    </div>
                </section>

                <div className="mt-12 pt-8 border-t">
                    <Link href="/">
                        <Button variant="secondaryOutline" className="w-full">
                            חזרה לעמוד הבית
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

