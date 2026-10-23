import type { Metadata, Viewport } from "next";
import { Manrope, Pixelify_Sans, Plus_Jakarta_Sans, Tinos, Yeseva_One } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/content/profile";
import "../globals.css";

// Window chrome, taskbar and icons
const pixel = Pixelify_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-pixel",
  display: "swap",
});

// Body text inside the portfolio window, a Times New Roman look-alike
const serif = Tinos({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Big headings
const display = Yeseva_One({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// The uteach demo window uses uteach's own fonts. Not preloaded: they download only when that window opens.
// Manrope covers Cyrillic, which Plus Jakarta Sans doesn't.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
  preload: false,
});

const manrope = Manrope({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-manrope",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#000000",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const base = siteUrl();
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: base ? new URL(base) : undefined,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${pixel.variable} ${serif.variable} ${display.variable} ${jakarta.variable} ${manrope.variable}`}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
