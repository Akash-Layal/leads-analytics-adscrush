import { endOfDay, format, isValid, parse, startOfDay } from "date-fns";
import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { DateRange } from "react-day-picker";

// Helper function to check if a day string is valid
export const isValidDay = (value: string): boolean => {
  const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  return validDays.includes(value.toLowerCase());
};

// Helper function to parse and validate a date string
export const parseAndValidateDate = (dateString: string | undefined): Date | undefined => {
  if (!dateString) return undefined;
  const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
  return isValid(parsedDate) ? parsedDate : undefined;
};

// Function to get date range from a date string
export const getDateFromParams = (date: string | undefined): { from: Date | undefined; to: Date | undefined } => {
  const [fromString = "", toString = ""] = date ? date.split(".") : [];
  const from = parseAndValidateDate(fromString);
  const to = parseAndValidateDate(toString);
  const startDay = from ? startOfDay(from) : undefined;
  const endDay = to ? endOfDay(to) : startDay ? endOfDay(startDay) : undefined;
  return { from: startDay, to: endDay };
};

// Function to format a date range for URL params
export const formatDateRangeForParams = (dateRange: DateRange | undefined): string => {
  if (!dateRange) return "";
  const { from, to } = dateRange;
  const fromDate = from ? format(from, "yyyy-MM-dd") : "";
  const toDate = to ? `.${format(to, "yyyy-MM-dd")}` : "";
  return `${fromDate}${toDate}`;
};

// ===== IST TIMEZONE HELPERS =====
const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Convert a date to IST timezone
 */
export const toIST = (date: Date): Date => {
  return toZonedTime(date, IST_TIMEZONE);
};

/**
 * Convert a date from IST to UTC
 */
export const fromIST = (date: Date): Date => {
  return fromZonedTime(date, IST_TIMEZONE);
};

/**
 * Format a date in IST timezone
 */
export const formatInIST = (date: Date, formatStr: string): string => {
  return formatInTimeZone(date, IST_TIMEZONE, formatStr);
};

/**
 * Get current date in IST
 */
export const getCurrentISTDate = (): Date => {
  return toIST(new Date());
};

/**
 * Convert date range to IST date strings (YYYY-MM-DD format)
 * This is specifically for the lead service which expects IST calendar dates
 */
export const convertDateRangeToIST = (dateRange: { from?: Date; to?: Date } | undefined): { 
  date_from?: string; 
  date_to?: string 
} => {
  if (!dateRange?.from) {
    return {};
  }

  const istFrom = toIST(dateRange.from);
  const date_from = formatInIST(istFrom, "yyyy-MM-dd");

  // If to is provided, use it; otherwise use from (for single day selections)
  const toDate = dateRange.to || dateRange.from;
  const istTo = toIST(toDate);
  const date_to = formatInIST(istTo, "yyyy-MM-dd");

  return { date_from, date_to };
};

/**
 * Parse date parameter and convert to IST date strings
 * This replaces the manual offset calculation in the dashboard
 */
export const parseDateParamsToIST = (dateParam: string | undefined): { 
  date_from?: string; 
  date_to?: string 
} => {
  if (!dateParam) {
    return {};
  }

  const { from, to } = getDateFromParams(dateParam);
  return convertDateRangeToIST({ from, to });
};