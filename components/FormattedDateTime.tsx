import { cn, formatDateTime } from "@/lib/utils";

export default function FormattedDateTime({
  className,
  date,
}: {
  className?: string;
  date: string;
}) {
  return (
    <p className={cn("body-1 text-light-200", className)}>
      {formatDateTime(date)}
    </p>
  );
}
