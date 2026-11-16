import { useMemo, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export const useDashboardDate = (
  initialRange?: DateRange
) => {
  const today = new Date();

  const defaultRange: DateRange = initialRange ?? {
    from: today,
    to: today,
  };

  const [dateRange, setDateRange] =
    useState<DateRange | undefined>(defaultRange);

  const [pendingRange, setPendingRange] =
    useState<DateRange | undefined>(defaultRange);

  const [isCalendarOpen, setIsCalendarOpen] =
    useState(false);

  const normalizedDateRange = useMemo(() => {
    const current = new Date();

    return {
      from: dateRange?.from
        ? new Date(
            new Date(dateRange.from).setHours(
              0,
              0,
              0,
              0
            )
          )
        : new Date(
            current.setHours(
              0,
              0,
              0,
              0
            )
          ),

      to: dateRange?.to
        ? new Date(
            new Date(dateRange.to).setHours(
              23,
              59,
              59,
              999
            )
          )
        : new Date(
            current.setHours(
              23,
              59,
              59,
              999
            )
          ),
    };
  }, [dateRange]);

  const fromDateStr = format(
    normalizedDateRange.from,
    "yyyy-MM-dd"
  );

  const toDateStr = format(
    normalizedDateRange.to,
    "yyyy-MM-dd"
  );

  const dateRangeLabel =
    normalizedDateRange.from &&
    normalizedDateRange.to
      ? `${format(
          normalizedDateRange.from,
          "dd-MM-yyyy"
        )} - ${format(
          normalizedDateRange.to,
          "dd-MM-yyyy"
        )}`
      : "";

  const openCalendar = (open: boolean) => {
    setIsCalendarOpen(open);

    if (open) {
      setPendingRange(dateRange);
    }
  };

  const applyDate = () => {
    setDateRange(pendingRange);
    setIsCalendarOpen(false);
  };

  const clearDate = () => {
    setDateRange(undefined);
    setPendingRange(undefined);
    setIsCalendarOpen(false);
  };

 return {
  fromDateStr,
  toDateStr,
  dateRangeLabel,

  filterProps: {
    dateRange,
    pendingRange,
    isOpen: isCalendarOpen,
    onOpenChange: openCalendar,
    onPendingRangeChange: setPendingRange,
    onApply: applyDate,
    onClear: clearDate,
  },
};
};