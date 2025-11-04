import { NextResponse } from "next/server";

export async function GET() {
    const successHtml = `
    <!doctype html>
    <html lang="he" dir="rtl">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>הרכישה בוצעה בהצלחה</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="font-sans m-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center min-h-screen p-6">
        <div class="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl max-w-lg w-full border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
            <div class="mb-6">
                <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            
            <h1 class="text-3xl font-bold text-center mb-6 text-gray-800 tracking-tight">הרכישה בוצעה בהצלחה!</h1>
            
            <div class="space-y-4 w-full">
                <p class="text-center text-gray-600 text-lg">
                    בעוד מספר דקות תקבלו מייל עם לינק להורדת החוברת.
                </p>
                
                <a href="https://storage.cloud.google.com/?authuser=3" 
                   class="block text-center py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 mx-auto max-w-md">
                    לצפייה בחוברת
                </a>
                
                <div class="bg-gray-50 rounded-lg p-4 mt-6">
                    <p class="text-center text-gray-600 mb-2">
                        סיסמת החוברת הינה: 
                        <strong class="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">${322232332}</strong>
                    </p>
                </div>
                
                <p class="text-center text-gray-500 text-sm">
                    אם לא קיבלתם מייל, בדקו את תיקיית הספאם.
                </p>
            </div>
        </div>

        <script>
            (function() {
                function dispatchSuccess() {
                    var data = { status: 'success' };
                    try { window.parent && window.parent.postMessage(data, '*'); } catch(e) {}
                }
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', dispatchSuccess, false);
                } else {
                    dispatchSuccess();
                }
            })();
                  fetch("https://smarti-web.vercel.app/api/email")
        .then((response) => response.json())
        .catch((error) => console.error("Error:", error));
        </script>
    </body>
    </html>
    `;

    return new NextResponse(successHtml, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}


