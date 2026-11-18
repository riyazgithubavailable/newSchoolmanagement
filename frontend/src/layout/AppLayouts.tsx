import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebaars } from "./Sidebaars";
import Header from "./Headers";

interface AppLayoutProps {
  /** When omitted the layout renders the matched child route (<Outlet />) */
  children?: React.ReactNode;
  hideHeader?: boolean;
  noPadding?: boolean;
}

/**
 * Main application shell: sidebar + header + scrollable content.
 * Used as a layout route in App.tsx, so pages should NOT wrap themselves in it.
 */
export const AppLayouts = ({ children, hideHeader = false, noPadding = false }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) setSidebarCollapsed((prev) => !prev);
    else setMobileSidebarOpen((prev) => !prev);
  };

  const content = children ?? <Outlet />;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 lg:block ${
          sidebarCollapsed ? "w-[76px]" : "w-[235px]"
        }`}
      >
        <Sidebaars collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((prev) => !prev)} />
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] w-[250px] bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebaars collapsed={false} onNavigate={() => setMobileSidebarOpen(false)} />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {!hideHeader && (
          <div className="w-full shrink-0">
            <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar} />
          </div>
        )}

        <main className={`min-h-0 min-w-0 flex-1 ${noPadding ? "overflow-hidden" : "overflow-x-auto overflow-y-auto"}`}>
          {noPadding ? content : <div className="w-full min-w-0 p-3 sm:p-5 lg:p-6">{content}</div>}
        </main>
      </div>
    </div>
  );
};

export default AppLayouts;
