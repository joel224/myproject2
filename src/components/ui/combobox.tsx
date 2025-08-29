
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
    options: { value: string; label: string }[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    notFoundText?: string;
    className?: string;
}

export function Combobox({ options, value, onSelect, placeholder, notFoundText, className }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  // Use local state for the input to allow free typing
  const [inputValue, setInputValue] = React.useState(value || "");

  // When the external `value` prop changes, update our internal `inputValue`
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (currentValue: string) => {
    // When an item is selected from the list, update the external state
    const selectedOption = options.find(option => option.label.toLowerCase() === currentValue.toLowerCase());
    const finalValue = selectedOption ? selectedOption.value : currentValue;
    onSelect(finalValue);
    setInputValue(finalValue); // Also update local input state
    setOpen(false);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    // Directly update the parent form state as the user types
    onSelect(text); 
  };
  
  const handleInputBlur = () => {
    // When the user clicks away, we ensure the parent state has the typed value
    onSelect(inputValue);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          {value
            ? options.find((option) => option.value === value)?.label || value
            : placeholder || "Select option..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
            {/* The input now directly controls the local inputValue state */}
            <CommandInput 
                placeholder={placeholder || "Search..."} 
                value={inputValue}
                onValueChange={setInputValue} // Use onValueChange for live filtering in Command
                onBlur={handleInputBlur} // When focus is lost, confirm the typed value
            />
          <CommandList>
            <CommandEmpty>{notFoundText || "No option found."}</CommandEmpty>
            <CommandGroup>
              {options
                .filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()))
                .map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} 
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
