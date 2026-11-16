// src/lib/nameUtils.ts

const PREFIXES = [
    "mr",
    "mrs",
    "ms",
    "miss",
    "dr",
    "prof",
    "sir",
    "madam",
];

export function getInitials(name?: string): string {
    if (!name) return "U";

    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 0) return "U";

    // Remove prefix if exists
    const firstWord = parts[0].toLowerCase().replace(".", "");
    const filteredParts =
        PREFIXES.includes(firstWord) ? parts.slice(1) : parts;

    if (filteredParts.length === 0) return "U";

    const firstInitial = filteredParts[0]?.[0] ?? "U";
    const lastInitial =
        filteredParts.length > 1
            ? filteredParts[filteredParts.length - 1]?.[0]
            : "";

    return (firstInitial + lastInitial).toUpperCase();
}