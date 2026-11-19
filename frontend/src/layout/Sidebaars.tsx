import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Shield } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { ROLE_WORKSPACE } from "@/config/roles";
import { getMenuItems, type BadgeKey, type MenuItem } from "@/config/menu";
import { useUnreadMessageCount, useUnreadNoticeCount } from "@/hooks/useTeacherQueries";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  /** called after a link is clicked (used to close the mobile drawer) */
  onNavigate?: () => void;
}

const isGroupActive = (item: MenuItem, pathname: string) =>
  !!item.children?.some((c) => c.to === pathname);

/** Badge counters are only fetched for teachers (other roles have no such pages yet). */
function useBadges(enabled: boolean): Record<BadgeKey, number> {
  const notices = useUnreadNoticeCount();
  const messages = useUnreadMessageCount();
  return enabled ? { notices, messages } : { notices: 0, messages: 0 };
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const leafClass = (isActive: boolean, collapsed: boolean) => `
  group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left
  transition-all duration-200
  ${isActive ? "bg-[#2463d4] text-white shadow-sm" : "text-white/90 hover:bg-white/10"}
  ${collapsed ? "justify-center" : ""}
`;

const childClass = (isActive: boolean) => `
  flex items-center gap-2 rounded-md px-3 py-2 text-[12px] transition-colors
  ${isActive ? "bg-[#2463d4] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}
`;

export const Sidebaars = ({ collapsed = false, onToggle, onNavigate }: SidebarProps) => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const role = user?.role ?? "TEACHER";
  const menuItems = getMenuItems(role, !!user?.isClassTeacher);
  const badges = useBadges(role === "TEACHER");

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  // open the group that contains the current route
  useEffect(() => {
    const active = menuItems.find((i) => isGroupActive(i, pathname));
    if (active) setOpenGroup(active.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside className="flex h-full w-full flex-col bg-[#061c41] text-white transition-all duration-300">
      {/* ------------------------------ Logo ------------------------------ */}
      <div
        className={`flex h-[76px] shrink-0 items-center border-b border-white/10 ${
          collapsed ? "justify-center px-3" : "px-5"
        }`}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white/80">
          <Shield size={25} strokeWidth={1.7} />
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <h1 className="text-[20px] font-semibold tracking-tight text-white">InstituteOS</h1>
            <p className="truncate text-[12px] text-white/80">{ROLE_WORKSPACE[role]}</p>
          </div>
        )}
      </div>

      {/* ------------------------------ Menu ------------------------------ */}
      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 py-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const count = item.badgeKey ? badges[item.badgeKey] : 0;

            /* ---------- simple link ---------- */
            if (!item.children?.length) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to!}
                  end
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `relative ${leafClass(isActive, collapsed)}`}
                >
                  <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                  {!collapsed && <span className="flex-1 text-[13px] font-medium">{item.label}</span>}
                  {!collapsed && <Badge count={count} />}
                  {collapsed && count > 0 && (
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </NavLink>
              );
            }

            /* ---------- group ---------- */
            const groupActive = isGroupActive(item, pathname);
            const isOpen = openGroup === item.label;

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => collapsed && setHoveredMenu(item.label)}
                onMouseLeave={() => collapsed && setHoveredMenu(null)}
              >
                <button
                  type="button"
                  title={collapsed ? item.label : undefined}
                  aria-expanded={isOpen}
                  onClick={() => !collapsed && setOpenGroup(isOpen ? null : item.label)}
                  className={leafClass(groupActive && (collapsed || !isOpen), collapsed)}
                >
                  <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-[13px] font-medium">{item.label}</span>
                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </>
                  )}
                </button>

                {/* expanded sidebar → inline accordion */}
                {!collapsed && isOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to!}
                          end
                          onClick={onNavigate}
                          className={({ isActive }) => childClass(isActive)}
                        >
                          <ChildIcon size={15} strokeWidth={1.8} />
                          <span>{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}

                {/* collapsed sidebar → hover flyout */}
                {collapsed && hoveredMenu === item.label && (
                  <div className="absolute left-full top-0 z-[100] pl-2">
                    <div className="min-w-[205px] rounded-lg border border-white/10 bg-[#061c41] p-2 shadow-xl">
                      <p className="border-b border-white/10 px-3 py-2 text-xs font-semibold text-white/70">
                        {item.label}
                      </p>
                      <div className="mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to!}
                              end
                              onClick={onNavigate}
                              className={({ isActive }) => childClass(isActive)}
                            >
                              <ChildIcon size={15} strokeWidth={1.8} />
                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* ---------------------------- Collapse ---------------------------- */}
      {onToggle && (
        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onToggle}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-white/90 transition-colors hover:bg-white/10 ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span className="text-[12px]">Collapse</span>}
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebaars;
