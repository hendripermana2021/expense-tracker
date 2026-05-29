import { format } from "date-fns";

export function formatHumanDate(value: string) {
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}
