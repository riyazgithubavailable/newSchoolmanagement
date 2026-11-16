import {TOKEN_KEY, PROFILE_KEY} from "@/lib/auth.ts";

/**
 * Clears all authentication-related data from localStorage
 */
export function clearAuthStorage() {
    try {
        localStorage.setItem("theme", "light");
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(PROFILE_KEY);

        // Optional: remove other app-specific keys if needed
        // localStorage.removeItem("someOtherKey");

    } catch (error) {
        console.error("Error clearing auth storage:", error);
    }
}
