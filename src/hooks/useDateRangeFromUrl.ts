import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { DateRange } from "react-day-picker";
import { parseAndValidateDate } from "@/lib/helpers/date";

// Custom hook to get the from and to dates from the URL search parameters
function useDateRangeFromSearchParams() {
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date(), []);

  const initialDate: DateRange | undefined = useMemo(() => {
    const dateString = searchParams.get("date");
    if (!dateString) return undefined;

    const [fromString, toString] = dateString.split(".");
    const fromDate = parseAndValidateDate(fromString);
    const toDate = parseAndValidateDate(toString);
 

    if (fromDate) {
      return { from: fromDate, to: toDate };
    } else {
      return undefined;
    }
  }, [searchParams]);

  const result = useMemo(
    () => ({
      fromDate: initialDate?.from,
      toDate: initialDate?.to,
      hasDateParams: !!searchParams.get("date"),
    }),
    [initialDate, searchParams],
  );

  return result;
}

export default useDateRangeFromSearchParams;