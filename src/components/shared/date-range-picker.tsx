"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDateRangeForParams, getDateFromParams } from "@/lib/helpers/date";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, subDays, subMonths, subYears } from "date-fns";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import * as React from "react";
import { DateRange } from "react-day-picker";

type SubDaysType = "days" | "months" | "years";

type PredefinedDateConfig = {
  label: string;
  value: number;
  type: SubDaysType;
  isSingleDay?: boolean; // New property to indicate single day selections
};

const predefinedDates: PredefinedDateConfig[] = [
  { label: "Today", value: 0, type: "days", isSingleDay: true },
  { label: "Yesterday", value: 1, type: "days", isSingleDay: true },
  { label: "Last 3 Days", value: 3, type: "days" },
  { label: "Last 7 Days", value: 7, type: "days" },
  { label: "Last 30 Days", value: 30, type: "days" },
  { label: "Last 3 Months", value: 3, type: "months" },
  { label: "Last 1 Year", value: 1, type: "years" },
];

export function CalendarDateRangePicker({ 
  className, 
  onDateRangeChange 
}: React.HTMLAttributes<HTMLDivElement> & { 
  onDateRangeChange?: (from?: Date, to?: Date) => void 
}) {
  const today = new Date();
  const [dateParam, setDateParam] = useQueryState("date");
  const router = useRouter();
  
  // Parse current date range from URL
  const currentDateRange = React.useMemo(() => {
    if (!dateParam) return undefined;
    const { from, to } = getDateFromParams(dateParam);
    return { from, to };
  }, [dateParam]);

  // Local state for pending changes
  const [pendingDateRange, setPendingDateRange] = React.useState<DateRange | undefined>(currentDateRange);
  const hasPendingChanges = React.useMemo(() => {
    if (!pendingDateRange && !currentDateRange) return false;
    if (!pendingDateRange || !currentDateRange) return true;
    
    const currentFrom = currentDateRange.from?.toISOString();
    const currentTo = currentDateRange.to?.toISOString();
    const pendingFrom = pendingDateRange.from?.toISOString();
    const pendingTo = pendingDateRange.to?.toISOString();
    
    return currentFrom !== pendingFrom || currentTo !== pendingTo;
  }, [pendingDateRange, currentDateRange]);

  // Update pending state when URL changes
  React.useEffect(() => {
    setPendingDateRange(currentDateRange);
  }, [currentDateRange]);

  const handleDateChange = (newDate: DateRange | undefined) => {
    setPendingDateRange(newDate);
  };

  const handlePredefinedClick = (value: number, type: SubDaysType, isSingleDay?: boolean) => {
    const fromDate = type === "days" 
      ? subDays(today, value) 
      : type === "months" 
      ? subMonths(today, value) 
      : type === "years" 
      ? subYears(today, value) 
      : today;
    
    // Create date range based on whether it's a single day or range
    const newDateRange: DateRange = isSingleDay 
      ? { from: fromDate, to: fromDate }  // Single day: both from and to are the same
      : { from: fromDate, to: today };    // Range: from calculated date to today
    
    setPendingDateRange(newDateRange);
  };

  const handleDateApply = () => {
    const dateString = formatDateRangeForParams(pendingDateRange);
    setDateParam(dateString || null);
    
    // If callback is provided, call it with the new date range
    if (onDateRangeChange && pendingDateRange) {
      onDateRangeChange(pendingDateRange.from, pendingDateRange.to);
    } else {
      // Trigger page refresh to re-fetch data with new date parameters
      router.refresh();
    }
  };

  const removeDateFilter = () => {
    setDateParam(null);
    setPendingDateRange(undefined);
    
    // If callback is provided, call it with undefined dates
    if (onDateRangeChange) {
      onDateRangeChange(undefined, undefined);
    } else {
      // Trigger page refresh to re-fetch data without date filter
      router.refresh();
    }
  };

  return (
    <div className={cn("flex flex-col-reverse md:flex-row gap-1", className)}>
      {hasPendingChanges && (
        <Button variant="default" className="cursor-pointer h-9 md:h-8 text-xs" onClick={handleDateApply}>
          Apply
        </Button>
      )}
      {dateParam ? (
        <Button 
          variant="destructive" 
          onClick={removeDateFilter} 
          className="hover:bg-destructive-foreground/15 cursor-pointer text-destructive-foreground text-white text-xs h-9 md:h-8 shrink-0"
        >
          Clear Filter
        </Button>
      ) : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-9 grow md:h-8 md:mr-1 justify-start text-left text-xs font-normal shrink-0 cursor-pointer", 
              !pendingDateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {pendingDateRange?.from ? (
              pendingDateRange?.to ? (
                <>
                  {format(pendingDateRange.from, "LLL dd, y")} - {format(pendingDateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(pendingDateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex flex-col md:flex-row">
          <div className="flex flex-col gap-2 border-r px-2 py-4">
            <div className="grid min-w-[250px] gap-1">
              {predefinedDates.map(({ label, value, type, isSingleDay }) => (
                <Button 
                  key={label} 
                  variant="ghost" 
                  className="justify-start font-normal" 
                  onClick={() => handlePredefinedClick(value, type, isSingleDay)}
                >
                  {label}
                  <span className="ml-auto text-muted-foreground">
                    {type === "days"
                      ? format(subDays(today, value), "E, dd MMM")
                      : type === "months"
                      ? format(subMonths(today, value), "E, dd MMM")
                      : type === "years"
                      ? format(subYears(today, value), "E, dd MMM")
                      : null}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          <div className="p-2">
            <Calendar 
              mode="range" 
              defaultMonth={pendingDateRange?.from} 
              selected={pendingDateRange} 
              onSelect={handleDateChange} 
              numberOfMonths={2} 
              disabled={(date) => date > today} 
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
