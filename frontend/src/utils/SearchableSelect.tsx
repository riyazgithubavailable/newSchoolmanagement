import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface SearchableSelectOption {
  value: string;
  label: string;
  keywords?: string;
  disabled?: boolean;
}

interface SearchableSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options?: SearchableSelectOption[] | null;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onValueChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = useState(false);

  // Selected option based on current value
  const selectedOption = useMemo(() => {
    return options.find(
      (option) => String(option.value) === String(value)
    );
  }, [options, value]);

  return (
    <Popover
      modal={false}
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={`w-full justify-between ${className}`}
        >
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>

          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={5}
        className="w-[--radix-popover-trigger-width] p-0"
        onWheelCapture={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />

          <CommandList className="max-h-64 overflow-y-auto overflow-x-hidden">
            <CommandEmpty>No Results Found.</CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const isSelected =
                  String(option.value) === String(value);

                const searchValue = `
                  ${option.label}
                  ${option.value}
                  ${option.keywords || ""}
                `.trim();

                return (
                  <CommandItem
                    key={option.value}
                    value={searchValue}
                    disabled={option.disabled}
                    onSelect={() => {
                      if (option.disabled) return;

                      onValueChange?.(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        isSelected
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />

                    <span
                      className={`truncate ${
                        option.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {option.label}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;