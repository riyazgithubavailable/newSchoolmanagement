import { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface SummaryCardProps {
  title: ReactNode;

  icon?: ReactNode;

  primaryLabel: string;
  primaryValue: ReactNode;

  secondaryLabel?: string;
  secondaryValue?: ReactNode;

  footer?: ReactNode;

  className?: string;
}

const SummaryCard = ({
  title,
  icon,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,

  footer,

  className,
}: SummaryCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide">
          {title}

          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              {icon}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {primaryLabel}
            </p>

            <div className="mt-1 text-3xl font-bold">
              {primaryValue}
            </div>
          </div>

          {secondaryLabel && secondaryValue && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                {secondaryLabel}
              </p>

              <div className="mt-1 text-3xl font-bold">
                {secondaryValue}
              </div>
            </div>
          )}
        </div>

        {footer && (
          <>
            <Separator />
            {footer}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;