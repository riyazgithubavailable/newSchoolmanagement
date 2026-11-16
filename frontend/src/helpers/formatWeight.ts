/**
 * Formats a weight value with smart unit conversion.
 * - Below 1000 kg → displayed in kg
 * - 1000 kg and above → converted and displayed in Tons
 *
 * @param value - Weight in kg (number | string | null | undefined)
 * @param decimals - Decimal places (default: 2)
 */
export function formatWeight(
    value: number | string | null | undefined,
    decimals: number = 2
): string {
    const kg = Math.abs(Number(value ?? 0));

    if (!Number.isFinite(kg)) return "0 kg";

    if (kg < 1000) {
        const rounded = parseFloat(kg.toFixed(decimals));
        return `${rounded} kg`;
    }

    const tons = kg / 1000;
    const rounded = parseFloat(tons.toFixed(decimals));
    return `${rounded} Ton`;
}