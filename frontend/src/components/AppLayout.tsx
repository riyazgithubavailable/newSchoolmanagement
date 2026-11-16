import * as React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, ChevronDown } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import BreadcrumbNavbar from "@/components/BreadcrumbNavbar";
import { filterNavItemsByRole, ROLE_LABELS } from "@/config/navItems";
import { getInitials } from "@/lib/nameUtils";
import { getProfileData } from "@/lib/auth";
import type { NavItem } from "@/config/navItems";
import type { RoleName } from "@/config/roles";
// import pkg from "../../../package.json";

export type ProfileData = {
    employeeId?: number;
    fullName?: string;
    roleName?: string;
};

type AuthUser = {
    name?: string;
    roleName?: string;
};

// ---------------------------------------------------------------------------
// External store for open/close state.
//
// WHY: If openGroups lives in React context, every toggle updates the context
// value, which re-renders every NavGroup that consumes it — even ones that
// didn't change. That cascade is the "glitch on click" (multiple items
// unmounting/mounting at once). By keeping state outside React in a plain
// object with a pub/sub listener list, each NavGroup can subscribe via
// useSyncExternalStore and only re-render when ITS own key changes.
// ---------------------------------------------------------------------------
type Store = {
    getSnapshot: () => Record<string, boolean>;
    subscribe: (cb: () => void) => () => void;
    set: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
};

function createStore(): Store {
    let state: Record<string, boolean> = {};
    const listeners = new Set<() => void>();
    return {
        getSnapshot: () => state,
        subscribe(cb) {
            listeners.add(cb);
            return () => listeners.delete(cb);
        },
        set(updater) {
            const next = updater(state);
            if (next !== state) {
                state = next;
                listeners.forEach((cb) => cb());
            }
        },
    };
}

const StoreContext = React.createContext<Store | null>(null);

// Each NavGroup subscribes only to its own boolean — other groups toggling
// will NOT cause this component to re-render.
function useIsOpen(label: string): boolean {
    const store = React.useContext(StoreContext)!;
    return React.useSyncExternalStore(
        store.subscribe,
        () => !!store.getSnapshot()[label]
    );
}

// ---------------------------------------------------------------------------
// NavContext carries only stable values (collapsed flag + toggle fn).
// No open-state here — keeping it out prevents the re-render cascade.
// ---------------------------------------------------------------------------
const NavContext = React.createContext<{
    collapsed: boolean;
    toggleGroup: (label: string, depth: number) => void;
}>({ collapsed: false, toggleGroup: () => {} });

// ---------------------------------------------------------------------------

const getIndentClass = (depth: number) => {
    if (depth === 0) return "pl-0";
    if (depth === 1) return "pl-3";
    return "pl-6";
};

const NavLeaf = React.memo(function NavLeaf({
    item,
    depth,
}: {
    item: NavItem;
    depth: number;
}) {
    const { collapsed } = React.useContext(NavContext);
    const Icon = item.icon;

    if (!item.to) return null;

    return (
        <NavLink
            to={item.to}
            end
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    getIndentClass(depth),
                    isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-3"
                )
            }
            title={collapsed ? item.label : undefined}
        >
            {({ isActive }) => (
                <>
                    <Icon
                        className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50"
                        )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                </>
            )}
        </NavLink>
    );
});

const NavGroup = React.memo(function NavGroup({
    item,
    depth,
}: {
    item: NavItem;
    depth: number;
}) {
    const { collapsed, toggleGroup } = React.useContext(NavContext);
    const location = useLocation();
    const Icon = item.icon;

    // Only this group re-renders when its key flips — siblings are unaffected.
    const isOpen = useIsOpen(item.label);

    const isAncestorActive = React.useMemo(() => {
        const check = (navItem: NavItem): boolean =>
            (navItem.to ? location.pathname.startsWith(navItem.to) : false) ||
            (navItem.children?.some(check) ?? false);
        return check(item);
    }, [item, location.pathname]);

    return (
        <div className={cn("space-y-0.5", getIndentClass(depth))}>
            <button
                type="button"
                onClick={() => toggleGroup(item.label, depth)}
                className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isAncestorActive && !isOpen
                        ? "bg-sidebar-accent/70 text-sidebar-primary"
                        : isOpen
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-3"
                )}
                title={collapsed ? item.label : undefined}
            >
                <Icon
                    className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isAncestorActive || isOpen ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                    )}
                />
                {!collapsed && (
                    <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                            className={cn(
                                "h-3.5 w-3.5 text-sidebar-foreground/40 transition-transform",
                                isOpen && "rotate-180"
                            )}
                        />
                    </>
                )}
            </button>

            {isOpen && !collapsed && (
                <div className="space-y-0.5 pt-0.5 pb-1">
                    {item.children?.map((child) =>
                        child.children?.length ? (
                            <NavGroup key={child.label} item={child} depth={depth + 1} />
                        ) : (
                            <NavLeaf
                                key={child.to || child.label}
                                item={child}
                                depth={depth + 1}
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth() as { user?: AuthUser };
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

    // Stable store — created once, never triggers a parent re-render.
    const store = React.useRef<Store>(createStore()).current;

    const profile = getProfileData<ProfileData>();
    const displayName = (profile?.fullName || user?.name || "").trim();
    const roleName = (profile?.roleName || user?.roleName || "").trim();
    // const appVersion = String(pkg?.version || "1.0.0");
    const navItems = React.useMemo(() => filterNavItemsByRole(roleName), [roleName]);
    const roleSubtitle = ROLE_LABELS[roleName as RoleName] ?? "Workspace";

    // On route change: open only the parent group of the active route.
    // All other top-level groups close — this is the accordion behaviour.
    React.useEffect(() => {
        const pathname = location.pathname;
        const nextOpen: Record<string, boolean> = {};

        const openParents = (items: NavItem[]): boolean => {
            for (const item of items) {
                if (item.to && pathname.startsWith(item.to)) return true;
                if (item.children?.length && openParents(item.children)) {
                    nextOpen[item.label] = true;
                    return true;
                }
            }
            return false;
        };

        openParents(navItems);
        // Replace entire state so siblings that were open but aren't ancestors get closed.
        store.set(() => nextOpen);
        setMobileSidebarOpen(false);
    }, [location.pathname, navItems, store]);

    const toggleGroup = React.useCallback(
        (label: string, depth: number) => {
            store.set((prev) => {
                if (depth === 0) {
                    // Accordion at the top level: close all sibling groups,
                    // then open the clicked one — unless it was already open
                    // (in which case clicking again collapses it).
                    const topLabels = navItems
                        .filter((i) => i.children?.length)
                        .map((i) => i.label);

                    const next: Record<string, boolean> = { ...prev };
                    for (const key of topLabels) next[key] = false;
                    if (!prev[label]) next[label] = true;
                    return next;
                }
                // Nested groups just toggle freely.
                return { ...prev, [label]: !prev[label] };
            });
        },
        [navItems, store]
    );

    const navCtx = React.useMemo(
        () => ({ collapsed: sidebarCollapsed, toggleGroup }),
        [sidebarCollapsed, toggleGroup]
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed z-50 flex h-full flex-col border-r md:static md:z-auto",
                    "transition-[width,transform] duration-300",
                    "border-sidebar-border bg-sidebar text-sidebar-foreground",
                    sidebarCollapsed ? "md:w-16" : "md:w-64",
                    mobileSidebarOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
                        <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
                    </div>
                    {!sidebarCollapsed && (
                        <div className="min-w-0">
                            <h1 className="truncate font-serif text-sm font-semibold leading-tight text-sidebar-foreground">
                                InstituteOS
                            </h1>
                            <p className="truncate text-[11px] text-sidebar-foreground/55">
                                {roleSubtitle}
                            </p>
                        </div>
                    )}
                </div>

                <StoreContext.Provider value={store}>
                    <NavContext.Provider value={navCtx}>
                        <nav
                            className={cn(
                                "flex-1 space-y-0.5 overflow-y-auto py-3",
                                sidebarCollapsed ? "px-2" : "px-3"
                            )}
                        >
                            {navItems.map((item) =>
                                item.children?.length ? (
                                    <NavGroup key={item.label} item={item} depth={0} />
                                ) : (
                                    <NavLeaf key={item.to || item.label} item={item} depth={0} />
                                )
                            )}
                        </nav>
                    </NavContext.Provider>
                </StoreContext.Provider>

                <div className={cn("border-t border-sidebar-border", sidebarCollapsed ? "p-2" : "p-3")}>
                    <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-semibold text-sidebar-primary">
                            {getInitials(displayName)}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-sidebar-foreground">
                                    {displayName || "User"}
                                </p>
                                {/* <p className="truncate text-xs text-sidebar-foreground/50">
                                    {roleName || "Unknown Role"} · v{appVersion}
                                </p> */}
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-background">
                <BreadcrumbNavbar
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={() => {
                        if (window.innerWidth >= 768) {
                            setSidebarCollapsed((v) => !v);
                        } else {
                            setMobileSidebarOpen(true);
                        }
                    }}
                />
                <div className="p-4 sm:p-6">{children}</div>
            </main>
        </div>
    );
}