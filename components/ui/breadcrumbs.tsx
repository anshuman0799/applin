import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  variant?: "app" | "auth" | "landing";
};

const breadcrumbStyles = {
  app: {
    nav: "rounded-full border border-white/70 bg-white/75 px-3 py-2 shadow-[0_12px_30px_rgba(87,83,78,0.08)] backdrop-blur",
    text: "text-stone-500",
    link: "text-stone-600 transition hover:text-stone-950",
    current: "text-stone-950",
    separator: "text-stone-300",
  },
  auth: {
    nav: "rounded-full border border-stone-200/80 bg-stone-50/85 px-3 py-2 shadow-[0_10px_24px_rgba(86,83,75,0.08)]",
    text: "text-stone-500",
    link: "text-stone-600 transition hover:text-stone-950",
    current: "text-stone-950",
    separator: "text-stone-300",
  },
  landing: {
    nav: "rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-[0_16px_40px_rgba(87,83,78,0.1)] backdrop-blur",
    text: "text-stone-500",
    link: "text-stone-600 transition hover:text-stone-950",
    current: "text-stone-950",
    separator: "text-stone-300",
  },
} as const;

export type { BreadcrumbItem };

export function Breadcrumbs({ items, variant = "app" }: BreadcrumbsProps) {
  const safeItems = items.filter((item) => item.label.trim().length > 0);

  if (safeItems.length === 0) {
    return null;
  }

  const styles = breadcrumbStyles[variant];

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol
        className={`flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${styles.text}`}
      >
        {safeItems.map((item, index) => {
          const isCurrent = index === safeItems.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-1.5"
            >
              {item.href && !isCurrent ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={isCurrent ? styles.current : styles.link}
                >
                  {item.label}
                </span>
              )}

              {!isCurrent ? (
                <span aria-hidden="true" className={styles.separator}>
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
