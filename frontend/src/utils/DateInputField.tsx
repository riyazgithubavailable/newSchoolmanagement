import React from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type DateInputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;

  type?: "date" | "datetime-local" | "time";
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  required?: boolean;

  className?: string;
  inputClassName?: string;
  labelClassName?: string;
};

export default function DateInputField({
  label,
  value,
  onChange,
  type = "date",
  name,
  id,
  placeholder,
  disabled = false,
  min,
  max,
  required = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
}: DateInputFieldProps) {
  const inputId =
    id || name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <Label
        htmlFor={inputId}
        className={`font-semibold text-foreground ${labelClassName}`}
      >
        {label.replace(/\s*\*$/, "")}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      {/* Input Wrapper */}
      <div className="relative">
        <Input
          id={inputId}
          name={name}
          type={type}
          value={value || ""}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          // required={required}
          onChange={(e) => onChange(e.target.value)}
          className={`
            h-12 w-full rounded-xl border border-emerald-200
            bg-white pr-12 text-foreground shadow-sm
            focus-visible:ring-2 focus-visible:ring-emerald-500

            dark:border-emerald-800
            dark:bg-emerald-950/40
            dark:text-emerald-50
            dark:[color-scheme:dark]

            /* Hide default calendar icon */
            [&::-webkit-calendar-picker-indicator]:absolute
            [&::-webkit-calendar-picker-indicator]:right-0
            [&::-webkit-calendar-picker-indicator]:top-0
            [&::-webkit-calendar-picker-indicator]:h-full
            [&::-webkit-calendar-picker-indicator]:w-12
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            [&::-webkit-calendar-picker-indicator]:opacity-0

            ${inputClassName}
          `}
        />

        {/* Custom Calendar Icon */}
        {
          type === "time" ? (
            <Clock3
              className="
        pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2
        text-emerald-700
        dark:text-emerald-300
      "
            />
          ) : (
            <CalendarDays
              className="
        pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2
        text-emerald-700
        dark:text-emerald-300
      "
            />
          )
        }
      </div>
    </div>
  );
}