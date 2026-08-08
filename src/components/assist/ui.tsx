"use client";

import Link from "next/link";

export type Accent = "blue" | "violet" | "amber";

const accentDot: Record<Accent, string> = {
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
};

const accentText: Record<Accent, string> = {
  blue: "text-blue-700 dark:text-blue-300",
  violet: "text-violet-700 dark:text-violet-300",
  amber: "text-amber-700 dark:text-amber-300",
};

/**
 * Panel header for a skill: role tag, product name, and one line of helper text.
 * The accent colour is the only thing that differs between panels.
 */
export function AssistHeader({
  accent,
  role,
  title,
  helper,
  badge,
}: {
  accent: Accent;
  role: string;
  title: string;
  helper: string;
  badge?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          <span aria-hidden className={`size-1.5 rounded-full ${accentDot[accent]}`} />
          skill · {role}
        </p>
        <h2 className={`mt-1 text-lg font-semibold tracking-tight ${accentText[accent]}`}>
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{helper}</p>
      </div>
      {badge ? (
        <span className="w-fit shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

/** The one obvious call to action in a panel. */
export function GenerateButton({
  onClick,
  loading,
  children,
  loadingLabel = "Thinking…",
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
  loadingLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      {loading ? (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : null}
      {loading ? loadingLabel : children}
    </button>
  );
}

export function ApplyButton({
  onClick,
  disabled,
  saving,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  saving?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {saving ? "Saving…" : children}
    </button>
  );
}

/** Quiet action — sits next to a primary button without competing with it. */
export function QuietButton({
  onClick,
  children,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-200/70 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {children}
    </button>
  );
}

export function PreviewShell({
  summary,
  children,
  footer,
}: {
  summary: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-start gap-2.5 border-b border-zinc-200 bg-white/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
        <span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          Preview
        </span>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{summary}</p>
      </div>
      <div className="space-y-6 px-4 py-5">{children}</div>
      <div className="sticky bottom-0 flex flex-wrap items-center gap-2 border-t border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        {footer}
      </div>
    </div>
  );
}

export function PreviewSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
        {hint ? (
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{hint}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function CheckRow({
  checked,
  onChange,
  label,
  meta,
  children,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white px-3.5 py-3 transition hover:border-zinc-300 has-checked:border-zinc-900 has-checked:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:has-checked:border-zinc-400 dark:has-checked:bg-zinc-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-zinc-900 dark:accent-zinc-100"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-snug">{label}</span>
        {meta ? (
          <span className="mt-1 block text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {meta}
          </span>
        ) : null}
        {children}
      </span>
    </label>
  );
}

export function BulletList({
  items,
  tone = "default",
}: {
  items: string[];
  tone?: "default" | "quote";
}) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className={
            tone === "quote"
              ? "border-l-2 border-zinc-300 pl-3 text-sm leading-relaxed italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              : "flex gap-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
          }
        >
          {tone === "quote" ? (
            item
          ) : (
            <>
              <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-zinc-400" />
              <span>{item}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export function ResultBanner({
  message,
  showApprovalsLink,
  onDone,
}: {
  message: string;
  showApprovalsLink?: boolean;
  onDone: () => void;
}) {
  return (
    <div
      role="status"
      className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-200"
    >
      <span aria-hidden className="text-base leading-none">
        ✓
      </span>
      <span className="font-medium">{message}</span>
      {showApprovalsLink ? (
        <Link
          href="/approvals"
          className="font-medium underline underline-offset-2 hover:no-underline"
        >
          Open Approvals →
        </Link>
      ) : null}
      <button
        type="button"
        onClick={onDone}
        className="ml-auto text-xs text-green-800/80 underline dark:text-green-300/80"
      >
        Dismiss
      </button>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
    >
      {message}
    </p>
  );
}
