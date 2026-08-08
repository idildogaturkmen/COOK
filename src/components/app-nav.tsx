import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/approvals", label: "Approvals" },
] as const;

export function AppNav() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            COOK
          </Link>
          <nav className="flex gap-4 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <span
          title="Ops, Outreach, and AFTERS run deterministic handlers — no API key needed"
          className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
        >
          Skills live · no API key
        </span>
      </div>
    </header>
  );
}
