import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import { contact, siteUrl } from "@/content/profile";
import { CopyButton } from "./CopyButton";
import { Section } from "./Section";
import { Todo } from "./Todo";

export async function Contact() {
  const t = await getTranslations("contact");
  const url = siteUrl();
  // Fixed ink-on-paper colours in both themes so the code always scans.
  const qr = url
    ? await QRCode.toString(url, { type: "svg", margin: 0, color: { dark: "#201f1d", light: "#f3f2f2" } })
    : null;

  const rows = [
    { label: t("telegram"), value: contact.telegram, todo: t("telegramTodo") },
    { label: t("phone"), value: contact.phone, todo: t("phoneTodo") },
  ];

  return (
    <Section id="contact" number="08" title={t("title")} strongRule>
      <div className="grid max-w-[880px] gap-[18px] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-12">
        <div className="border-t border-(--color-divider)">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 border-b border-(--color-divider) py-3">
              <div>
                <div className="text-[11px] opacity-60">{row.label}</div>
                <div className="tnum text-[17px] select-text">{row.value ?? row.todo}</div>
              </div>
              <CopyButton value={row.value} label={t("copy")} copiedLabel={t("copied")} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 lg:max-w-[300px]">
          {qr ? (
            <div
              role="img"
              aria-label={t("qrAlt", { url: url! })}
              className="mat h-24 w-24 flex-none bg-[#f3f2f2] p-1 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          ) : (
            <div className="mat grid h-24 w-24 flex-none place-items-center p-1 text-center text-[10px]">
              {t("qrTodo")}
            </div>
          )}
          <p className="m-0 text-[13px] opacity-75">{t("qrNote")}</p>
        </div>
      </div>
    </Section>
  );
}
