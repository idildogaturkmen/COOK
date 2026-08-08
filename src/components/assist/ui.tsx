"use client";

import Link from "next/link";

export function AssistHeader({
  eyebrow,
  title,
  subtitle,
  badge,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
      </div>
      {badge ? (
        <span className="w-fit shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

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
      className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
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

export function SecondaryButton({
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
      className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50/70 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-start gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <span className="mt-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          Preview
        </span>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{summary}</p>
      </div>
      <div className="space-y-5 px-4 py-4">{children}</div>
      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
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
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
        {hint ? <span className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</span> : null}
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
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-zinc-200 bg-white px-3 py-2.5 transition hover:border-zinc-300 has-checked:border-zinc-400 has-checked:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:has-checked:border-zinc-600 dark:has-checked:bg-zinc-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-zinc-900 dark:accent-zinc-100"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {meta ? (
          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{meta}</span>
        ) : null}
        {children}
      </span>
    </label>
  );
}

export function BulletList({ items, tone = "default" }: { items: string[]; tone?: "default" | "quote" }) {
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li
          key={i}
          className={
            tone === "quote"
              ? "border-l-2 border-zinc-300 pl-3 text-sm italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              : "flex gap-2 text-sm text-zinc-700 dark:text-zinc-300"
          }
        >
          {tone === "quote" ? item : <><span className="text-zinc-400">•</span><span>{item}</span></>}
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
      className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200"
    >
      <span className="font-medium">{message}</span>
      {showApprovalsLink ? (
        <Link href="/approvals" className="underline underline-offset-2">
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
      className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200"
    >
      {message}
    </p>
  );
}
