/**
 * IST helpers (Asia/Kolkata)
 * Keep all IST logic here so the app stays consistent everywhere.
 */

export function getISTNowDate(): Date {
    return new Date();
}

export function getISTWeekday(date: Date = new Date()): string {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: "Asia/Kolkata",
    }).format(date);
}

/**
 * Convert GMT/UTC datetime string to IST by adding 5:30 hours
 * @param dateInput GMT/UTC date string or Date object
 * @returns Date object adjusted to IST
 */
export function convertToIST(
    dateInput: string | Date | null | undefined
): Date | null {
    if (!dateInput) return null;

    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

    if (Number.isNaN(date.getTime())) return null;

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    return new Date(date.getTime() - IST_OFFSET);
}

/**
 * Format GMT/UTC datetime to IST string
 * @param dateInput GMT/UTC date string or Date object
 * @param includeTime Whether to include time
 * @returns Formatted IST datetime string
 */
export function formatToIST(
    dateInput: string | Date | null | undefined,
    includeTime: boolean = true
): string {
    if (!dateInput) return "-";

    const istDate = convertToIST(dateInput);
    if (!istDate) return "-";

    if (includeTime) {
        return istDate.toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    }

    return istDate.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

/**
 * Get current IST datetime string for datetime-local input
 * @returns YYYY-MM-DDTHH:MM format in IST
 */
export function getISTDateTimeLocal(): string {
    const now = new Date();
    const istDate = convertToIST(now);

    if (!istDate) return "";

    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, "0");
    const day = String(istDate.getDate()).padStart(2, "0");
    const hours = String(istDate.getHours()).padStart(2, "0");
    const minutes = String(istDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get today's date in IST as YYYY-MM-DD
 */
export function getISTTodayISO(date: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const get = (type: Intl.DateTimeFormatPartTypes): string =>
        parts.find((p) => p.type === type)?.value || "";

    const y = get("year");
    const m = get("month");
    const d = get("day");

    return `${y}-${m}-${d}`;
}

/**
 * Get current month range in IST.
 * @returns YYYY-MM-DD for first and last day of this month in IST
 */
export function getISTCurrentMonthRange(
    date: Date = new Date()
): { from_date: string; to_date: string } {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const get = (type: Intl.DateTimeFormatPartTypes): string =>
        parts.find((p) => p.type === type)?.value || "";

    const year = Number(get("year"));
    const month2 = get("month");
    const monthIndex = Number(month2) - 1;

    const lastDay = new Date(year, monthIndex + 1, 0).getDate();

    const from_date = `${year}-${month2}-01`;
    const to_date = `${year}-${month2}-${String(lastDay).padStart(2, "0")}`;

    return {from_date, to_date};
}

/**
 * Safely convert a datetime value into epoch milliseconds.
 * Accepts ISO strings, Date, number.
 * Returns 0 for invalid values so sorting stays stable.
 */
export function toEpochMs(
    value: string | number | Date | null | undefined
): number {
    if (!value) return 0;

    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (value instanceof Date) {
        const t = value.getTime();
        return Number.isFinite(t) ? t : 0;
    }

    if (typeof value === "string") {
        const t = Date.parse(value);
        return Number.isFinite(t) ? t : 0;
    }

    return 0;
}

/**
 * Sort an array by a date field in DESC order (latest first).
 * Works for plain objects or wrapped rows (e.g. { m: {...} }).
 */
export function sortByDateKeyDesc<T extends Record<string, any>>(
    list: T[] = [],
    key: string = "created_on",
    nestedKey: string | null = null
): T[] {
    const arr = Array.isArray(list) ? list : [];

    return [...arr].sort((a, b) => {
        const av = nestedKey ? a?.[nestedKey]?.[key] : (a?.[key] ?? a?.m?.[key]);
        const bv = nestedKey ? b?.[nestedKey]?.[key] : (b?.[key] ?? b?.m?.[key]);
        return toEpochMs(bv) - toEpochMs(av);
    });
}

/**
 * Convert any datetime input into a "naive" IST ISO string:
 * YYYY-MM-DDTHH:mm:ss
 */
export function toISTNaiveISO(
    input: string | Date | null | undefined,
    withSeconds: boolean = true
): string | null {
    if (!input) return null;

    const d = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(d.getTime())) return null;

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).formatToParts(d);

    const get = (type: Intl.DateTimeFormatPartTypes): string =>
        parts.find((p) => p.type === type)?.value || "";

    const y = get("year");
    const m = get("month");
    const da = get("day");
    const hh = get("hour");
    const mm = get("minute");
    const ss = get("second");

    return withSeconds
        ? `${y}-${m}-${da}T${hh}:${mm}:${ss}`
        : `${y}-${m}-${da}T${hh}:${mm}`;
}