
interface SanitizeNumberOptions {
    maxIntegerDigits?: number; // digits allowed before decimal (default 6)
    maxDecimalDigits?: number; // digits allowed after decimal (default 2)
    allowDecimal?: boolean;    // allow decimal point at all (default true)
}

export const sanitizeNumberInput = (
    value: string,
    options: SanitizeNumberOptions = {}
): string => {
    const {
        maxIntegerDigits = 6,
        maxDecimalDigits = 2,
        allowDecimal = true,
    } = options;

    // Strip everything except digits and decimal point
    let cleaned = allowDecimal
        ? value.replace(/[^0-9.]/g, "")
        : value.replace(/[^0-9]/g, "");

    if (allowDecimal) {
        // Prevent multiple decimal points
        const parts = cleaned.split(".");
        if (parts.length > 2) {
            cleaned = parts[0] + "." + parts.slice(1).join("");
        }
    }

    const [intPart, decPart] = cleaned.split(".");

    const limitedInt = (intPart ?? "").slice(0, maxIntegerDigits);

    if (!allowDecimal || decPart === undefined) {
        return limitedInt;
    }

    const limitedDec = decPart.slice(0, maxDecimalDigits);
    return `${limitedInt}.${limitedDec}`;
};

// ─── Validation helper — checks if a sanitized value exceeds limits ───────────

export const validateNumberLimits = (
    value: string,
    options: SanitizeNumberOptions = {}
): { valid: boolean; message?: string } => {
    const { maxIntegerDigits = 6 } = options;
    const intPart = value.split(".")[0] ?? "";

    if (intPart.length > maxIntegerDigits) {
        return {
            valid: false,
            message: `Value cannot exceed ${maxIntegerDigits} digits before the decimal point.`,
        };
    }

    return { valid: true };
};