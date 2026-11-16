import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DashboardDateFilterProps {
  dateRange?: DateRange;
  pendingRange?: DateRange;
  isOpen: boolean;
 label?: string;
  onOpenChange: (open: boolean) => void;
  onPendingRangeChange: (range?: DateRange) => void;
  onApply: () => void;
  onClear: () => void;
}

const DashboardDateFilter = ({
     
  dateRange,
  pendingRange,
  isOpen,
  onOpenChange,
  onPendingRangeChange,
  onApply,
  label = "Select Date",
  onClear,
}: DashboardDateFilterProps) => {


  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 text-xs"
        >
          <CalendarDays size={14} />
          {label}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-auto p-0"
      >
        <Calendar
          mode="range"
          selected={pendingRange}
          onSelect={onPendingRangeChange}
          numberOfMonths={2}
        />

        <div className="flex justify-end gap-2 border-t p-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
          >
            Clear
          </Button>

          <Button
            size="sm"
            onClick={onApply}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DashboardDateFilter;