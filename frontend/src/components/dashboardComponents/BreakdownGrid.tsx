import React from "react";

export interface BreakdownItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  textClass?: string;
  bgClass?: string;
  borderClass?: string;
}

interface BreakdownGridProps {
  title?: string;
  items: BreakdownItem[];
  showBackground?: boolean;
  valueFormatter?: (value: number) => string;
}

const BreakdownGrid = ({
  title,
  items,
  showBackground = false,
  valueFormatter = (value) => value.toFixed(2),
}: BreakdownGridProps) => {
  return (
    <div>
      {title && (
        <p className="mb-2 text-xs font-medium text-black">
          {title}
        </p>
      )}

      <div className="flex gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`
              flex flex-1 flex-col items-center rounded-lg border py-2
              ${showBackground ? item.bgClass ?? "" : "bg-muted/30"}
              ${item.borderClass ?? ""}
            `}
          >
            <span className="mb-1">{item.icon}</span>

            <p className={`text-sm font-bold ${item.textClass ?? ""}`}>
              {valueFormatter(item.value)}
            </p>

            <p
              className={`text-[11px] ${
                showBackground
                  ? `${item.textClass ?? ""} opacity-70`
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BreakdownGrid;