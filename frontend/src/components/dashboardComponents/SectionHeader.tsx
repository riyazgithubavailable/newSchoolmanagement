import { ArrowRight } from "lucide-react";

export const SectionHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: string;
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-[15px] font-semibold text-[#0F1B33]">
          {title}
        </h2>

        {subtitle && (
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button className="flex items-center gap-1 text-[11px] font-medium text-[#0F1B33] hover:text-[#C6952F]">
          {action}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
