import * as XLSX from "xlsx";

type Row = Record<string, unknown>;

type ExportOptions = {
    sheetName?: string;
    headersOrder?: string[]; // explicit column order
    headersLabel?: Record<string, string>; // rename headers
};

export function exportToXlsx(filename: string, rows: Row[], options: ExportOptions = {}) {
    const normalized = rows.map((r) => normalizeRow(r));
    const sheetName = options.sheetName || "data";

    const worksheet = createSheetWithHeaders(normalized, options);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function normalizeRow(row: Row): Row {
    const out: Row = {};
    Object.entries(row).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            out[key] = "";
        } else if (value instanceof Date) {
            out[key] = value.toISOString();
        } else if (typeof value === "boolean") {
            out[key] = value ? "TRUE" : "FALSE";
        } else if (Array.isArray(value) || typeof value === "object") {
            try {
                const json = JSON.stringify(value);
                out[key] = sanitizeString(json);
            } catch {
                out[key] = String(value);
            }
        } else if (typeof value === "number") {
            out[key] = value;
        } else {
            out[key] = sanitizeString(String(value));
        }
    });
    return out;
}

function sanitizeString(input: string): string {
    // Decode HTML entities, normalize Unicode, and ensure RTL strings render correctly in Excel
    const decoded = decodeHtmlEntities(input);
    const normalized = decoded.normalize("NFC");
    // If contains Hebrew/Arabic characters, prepend RTL mark to help Excel display properly
    if (/[\u0590-\u05FF\u0600-\u06FF]/.test(normalized)) {
        return "\u200F" + normalized; // RTL mark
    }
    return normalized;
}

function decodeHtmlEntities(input: string): string {
    if (typeof window === "undefined") return input;
    const textarea = document.createElement("textarea");
    textarea.innerHTML = input;
    return textarea.value;
}

function createSheetWithHeaders(rows: Row[], options: ExportOptions) {
    const { headersOrder, headersLabel } = options;

    if (!rows.length) {
        return XLSX.utils.json_to_sheet([]);
    }

    if (!headersOrder || headersOrder.length === 0) {
        // Fallback: infer from first row
        return XLSX.utils.json_to_sheet(rows);
    }

    // Build an array of arrays with explicit header order
    const headerRow = headersOrder.map((h) => headersLabel?.[h] || h);
    const dataRows = rows.map((r) => headersOrder.map((h) => (r as any)[h]));
    const aoa = [headerRow, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    return ws;
}


