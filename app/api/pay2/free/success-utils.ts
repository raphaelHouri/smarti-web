type SubscriptionArrayItem = {
  userId: string;
  productId: string;
  couponId: string | null;
  paymentTransactionId: string;
  systemUntil: Date;
  systemStep: number;
  displayName: string;
  type: "system" | "book";
  downloadLink?: string;
  convertUrl?: string;
  password?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatHebrewDate(date: Date): string {
  try {
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    const iso = date.toISOString();
    return iso.split("T")[0] ?? iso;
  }
}

export function buildSubscriptionsSuccessHtml(subscriptions: SubscriptionArrayItem[]): string {
  const sections = subscriptions
    .map((subscription, index) => {
      const baseId = `subscription-${index}`;
      const productName = escapeHtml(subscription.displayName);
      const expiresAtLabel = escapeHtml(formatHebrewDate(subscription.systemUntil));
      const statusLabel =
        subscription.type === "book"
          ? "החוברת שלך מוכנה!"
          : "הגישה לתכנים נפתחה בהצלחה.";
      const expiryLine =
        subscription.type === "book"
          ? `תוקף עד: <strong class="text-gray-900">${expiresAtLabel}</strong>.`
          : `הגישה לתוכן בתוקף עד <strong class="text-gray-900">${expiresAtLabel}</strong>.`;

      let body: string;

      if (subscription.type === "book" && subscription.downloadLink) {
        const initialCountdown = 50;
        const passwordMarkup = subscription.password
          ? `<p class="text-center text-gray-600 mb-2">
          סיסמת החוברת הינה:
          <strong class="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">${escapeHtml(subscription.password)}</strong>
        </p>`
          : "";

        body = `
        <div class="mt-4 space-y-4">
          <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed space-y-2">
                        ${passwordMarkup}
            <p>${expiryLine}</p>
          </div>

          <div id="loader-${baseId}" class="flex flex-col items-center gap-3 py-4">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" role="status" aria-label="טוען"></div>
            <p class="text-gray-600 text-sm">מכין את החוברת...</p>
            <div class="flex items-baseline gap-1 text-gray-700" aria-live="polite">
              <span class="text-sm">הכפתור יופיע בעוד</span>
              <span id="countdown-${baseId}" class="text-2xl font-bold tabular-nums">${initialCountdown}</span>
              <span class="text-sm">שניות</span>
            </div>
          </div>

          <div id="buttonWrapper-${baseId}" class="hidden flex justify-center my-4">
            <a id="viewButton-${baseId}"
               href="${escapeHtml(subscription.downloadLink)}"
               class="inline-flex items-center justify-center py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 min-w-[220px] text-center"
               rel="noopener noreferrer">
              לצפייה בחוברת
            </a>
          </div>

          <div class="bg-gray-50 rounded-lg p-4 mt-2">
            <p class="text-center text-gray-500 text-sm">
              אם לא קיבלתם מייל, בדקו את תיקיית הספאם.
            </p>
          </div>
        </div>
        `;
      } else {
        body = `
        <div class="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed space-y-2">
          <p>${expiryLine}</p>
          <p>ניתן להתחבר לאזור האישי ולהתחיל ללמוד מיד.</p>
        </div>
        `;
      }

      const divider =
        index < subscriptions.length - 1
          ? `<div class="border-t border-dashed border-gray-200 my-6"></div>`
          : "";

      return `
      <section class="w-full">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-xl font-semibold text-gray-800">${productName}</h2>
            <span class="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">${expiresAtLabel}</span>
          </div>
          <p class="text-sm text-gray-600">${statusLabel}</p>
        </div>
        ${body}
      </section>
      ${divider}
      `;
    })
    .join("");

  const bookItems: Array<{
    baseId: string;
    downloadLink: string;
    convertUrl: string | null;
    countdownSeconds: number;
  }> = [];

  subscriptions.forEach((subscription, index) => {
    if (subscription.type === "book" && subscription.downloadLink) {
      bookItems.push({
        baseId: `subscription-${index}`,
        downloadLink: subscription.downloadLink,
        convertUrl: subscription.convertUrl ?? null,
        countdownSeconds: 50,
      });
    }
  });

  const bookItemsJson = JSON.stringify(bookItems).replace(/</g, "\\u003c");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const backToAppUrl = appUrl ? `${appUrl}/learn` : "/learn";

  return `
<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>הרכישה בוצעה בהצלחה</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="font-sans m-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center min-h-screen p-6">
  <div class="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
    <div class="mb-6">
      <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    </div>

    <h1 class="text-3xl font-bold text-center mb-6 text-gray-800 tracking-tight">הרכישה בוצעה בהצלחה!</h1>

    <div class="space-y-6 w-full">
      ${sections}
    </div>

    <div class="mt-8 pt-6 border-t border-gray-200 w-full">
      <a href="${escapeHtml(backToAppUrl)}" 
         class="inline-flex items-center justify-center w-full py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium">
        לחזרה למערכת
      </a>
    </div>
  </div>

  <script>
    (function () {
      const bookItems = ${bookItemsJson};

      function dispatchSuccess() {
        var data = { status: 'success' };
        try { window.parent && window.parent.postMessage(data, '*'); } catch (e) {}
      }

      function reveal(baseId) {
        var loader = document.getElementById('loader-' + baseId);
        var wrapper = document.getElementById('buttonWrapper-' + baseId);
        if (loader) loader.classList.add('hidden');
        if (wrapper) wrapper.classList.remove('hidden');
      }

      function setupBook(item) {
        var countdownEl = document.getElementById('countdown-' + item.baseId);
        var link = document.getElementById('viewButton-' + item.baseId);
        var seconds = Number(item.countdownSeconds) || 50;
        var remaining = seconds;

        if (link) {
          link.setAttribute('href', item.downloadLink);
        }

        if (!isFinite(remaining) || remaining < 0) {
          remaining = 0;
        }

        if (countdownEl) {
          countdownEl.textContent = remaining;
        }

        if (remaining === 0) {
          reveal(item.baseId);
        } else {
          var interval = setInterval(function () {
            remaining -= 1;
            if (countdownEl) {
              countdownEl.textContent = Math.max(0, remaining);
            }
            if (remaining <= 0) {
              clearInterval(interval);
              reveal(item.baseId);
            }
          }, 1000);
        }

        if (item.convertUrl) {
          fetch(item.convertUrl)
            .then(function (response) { return response.json ? response.json() : response; })
            .catch(function (error) { console.error("Error:", error); });
        }
      }

      function init() {
        dispatchSuccess();
        bookItems.forEach(setupBook);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, false);
      } else {
        init();
      }
    })();
  </script>
</body>
</html>
  `;
}

