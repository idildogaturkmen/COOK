type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
    >
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2> : null}
      {children}
    </section>
  );
}
