import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Teach } from "@/components/Teach";
import { Experience } from "@/components/Experience";
import { Method } from "@/components/Method";
import { Tools } from "@/components/Tools";
import { Projects } from "@/components/Projects";
import { Leadership } from "@/components/Leadership";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div className="graph-paper min-h-screen">
      <Header locale={locale as Locale} />
      <main>
        <Hero />
        <Teach />
        <Experience />
        <Method />
        <Tools />
        <Projects />
        <Leadership />
        <Contact />
      </main>
      <Footer locale={locale as Locale} />
    </div>
  );
}
