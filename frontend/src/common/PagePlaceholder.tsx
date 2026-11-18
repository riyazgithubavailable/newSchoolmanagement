import type { ReactNode } from "react";
import { Construction } from "lucide-react";

type PagePlaceholderProps = {
  title: string;
  description?: string;
  /** bullet list of what this module will contain */
  upcoming?: string[];
  icon?: ReactNode;
};

/** Used for modules that are planned but not built yet. */
export default function PagePlaceholder({ title, description, upcoming = [], icon }: PagePlaceholderProps) {
  return (
    <div className="min-h-full bg-[#FBF9F3] p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0F1B33]">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description || "This module is under development."}</p>
      </div>

      <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#E8E4D9] bg-white p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F3ED] text-[#0F1B33]">
          {icon ?? <Construction size={26} />}
        </div>
        <p className="mt-4 font-semibold text-[#0F1B33]">Coming soon</p>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          This portal is planned for the next phase. The Teacher section is fully available in this build.
        </p>
        {upcoming.length > 0 && (
          <ul className="mt-5 grid gap-2 text-left text-sm text-gray-600 sm:grid-cols-2">
            {upcoming.map((u) => (
              <li key={u} className="rounded-lg bg-[#FBF9F3] px-3 py-2">
                • {u}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
