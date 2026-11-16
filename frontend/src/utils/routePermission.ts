// utils/routePermission.ts
import { NAV_ITEMS } from "@/config/navItems";

export function canAccessRoute(path: string, role: string) {
  const normalizedPath = path.replace(/\/$/, "").toLowerCase();
  const normalizedRole = role.toLowerCase();

  const search = (items: any[]): boolean | null => {
    for (const item of items) {
      if (item.to) {
        const itemPath = item.to.replace(/\/$/, "").toLowerCase();

        if (itemPath === normalizedPath) {
          return (
            !item.roles ||
            item.roles.some(
              (r: string) => r.toLowerCase() === normalizedRole
            )
          );
        }
      }

      if (item.children) {
        const result = search(item.children);

        // route mil gaya
        if (result !== null) {
          return result;
        }
      }
    }

    // route mila hi nahi
    return null;
  };

  const result = search(NAV_ITEMS);

  // agar route NAV_ITEMS me hi nahi hai
  // usko allow kar do (dashboard/login/notfound etc.)
  return result === null ? true : result;
}