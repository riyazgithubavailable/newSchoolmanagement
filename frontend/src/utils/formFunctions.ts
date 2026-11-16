export function validateIndianMobile(mobile) {
  const regex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  return regex.test(mobile);
}
export function sanitizeNameInput(value: string): string {
    return value.replace(/[^A-Za-z.\-'\s]/g, "");
}

export function capitalizeWords(value: string): string {
    const cleaned = value.trim().replace(/\s+/g, " ");
    if (!cleaned) return "";
    return cleaned
        .split(" ")
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
        .join(" ");
}

export function passwordValidation(password: string) {
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/']/g.test(password);

    const score = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    const valid = score === 5;

    return { valid, score, minLength, hasUpper, hasLower, hasNumber, hasSpecial };
}

export function generateStrongPassword(length = 12) {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const nums = "23456789";
    const special = "!@#$%^&*_-+=?";
    const all = upper + lower + nums + special;

    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

    const chars = [pick(upper), pick(lower), pick(nums), pick(special)];
    while (chars.length < length) chars.push(pick(all));

    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
}
export function toTitleCase(fullName: string | null): string {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(/\s+/) // split by spaces
    .map(
      (w) => w.charAt(0)?.toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(" ");
}