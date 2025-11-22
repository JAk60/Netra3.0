'use client'
import { Fragment, useId, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Button } from './button'
import { Label } from './label'

export interface ComboboxItem {
  value: string
  label?: string
}

export interface ComboboxGroup {
  groupName: string
  items: ComboboxItem[]
}

export interface GroupedComboboxProps {
  /** Label text for the combobox */
  label?: string
  /** Placeholder text when no value is selected */
  placeholder?: string
  /** Placeholder text for the search input */
  searchPlaceholder?: string
  /** Text to display when no results are found */
  emptyText?: string
  /** Grouped items to display in the combobox */
  groups: ComboboxGroup[]
  /** Currently selected value */
  value?: string
  /** Callback when value changes */
  onValueChange?: (value: string) => void
  /** Custom class name for the container */
  className?: string
  /** Disabled state */
  disabled?: boolean
}

export const GroupedCombobox = ({
  label,
  placeholder = 'Select item',
  searchPlaceholder = 'Search item...',
  emptyText = 'No item found.',
  groups,
  value: controlledValue,
  onValueChange,
  className = 'w-full max-w-xs',
  disabled = false
}: GroupedComboboxProps) => {
  const id = useId()
  const [open, setOpen] = useState<boolean>(false)
  const [internalValue, setInternalValue] = useState<string>('')

  // Use controlled value if provided, otherwise use internal state
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  // Get display label for selected value
  const getDisplayLabel = (selectedValue: string): string => {
    for (const group of groups) {
      const item = group.items.find(item => item.value === selectedValue)
      if (item) {
        return item.label || item.value
      }
    }
    return selectedValue
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={disabled}
            className='bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]'
          >
            {value ? (
              <span className='flex min-w-0 items-center gap-2'>
                <span className='truncate'>{getDisplayLabel(value)}</span>
              </span>
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
            <ChevronsUpDownIcon size={16} className='text-muted-foreground/80 shrink-0' aria-hidden='true' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0' align='start'>
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              {groups.map(group => (
                <Fragment key={group.groupName}>
                  <CommandGroup heading={group.groupName}>
                    {group.items.map(item => (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        onSelect={() => handleValueChange(item.value)}
                      >
                        {item.label || item.value}
                        {value === item.value && <CheckIcon size={16} className='ml-auto' />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default GroupedCombobox