import type { Metadata } from "next";
import QRCode from "qrcode";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { telegramUrl } from "@/content/profile";
import { Desktop } from "@/components/os/Desktop";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = await getTranslations({ locale, namespace: "meta" });
  const os = await getTranslations({ locale, namespace: "os" });
  return {
    title: `${os("name")} · ${meta("title")}`,
    // The 3D home page is the canonical version of this page
    alternates: { canonical: `/${locale}` },
  };
}

export default async function DesktopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  // The Contact page's QR code opens Telegram. Black on white in a quiet zone so it scans from the screen and on paper
  const url = telegramUrl();
  const qrSvg = url ? await QRCode.toString(url, { type: "svg", margin: 1, color: { dark: "#000000", light: "#ffffff" } }) : null;

  return <Desktop qr={url && qrSvg ? { url, svg: qrSvg } : null} />;
}
