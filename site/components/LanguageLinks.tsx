import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// Short UZ · EN · RU switcher from the header in mockups 1a/1c.
export function LanguageLinks({ locale, label }: { locale: Locale; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-2.5 text-[12px]">
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <Link
            key={l}
            href="/"
            locale={l}
            hrefLang={l}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "text-(--color-accent) no-underline border-b border-(--color-accent)"
                : "text-(--color-text) no-underline opacity-55 hover:opacity-100"
            }
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
