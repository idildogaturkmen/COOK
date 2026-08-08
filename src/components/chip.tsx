type Tone = "zinc" | "amber" | "green" | "blue" | "violet" | "red";

const toneClass: Record<Tone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  green: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const dotClass: Record<Tone, string> = {
  zinc: "bg-zinc-400",
  amber: "bg-amber-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  red: "bg-red-500",
};

/** Small status pill used across the event page and the Approvals queue. */
export function Chip({
  tone = "zinc",
  dot = false,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${toneClass[tone]}`}
    >
      {dot ? <span aria-hidden className={`size-1.5 rounded-full ${dotClass[tone]}`} /> : null}
      {children}
    </span>
  );
}
