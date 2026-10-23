// Facts shown on the portfolio that are not translated. `null` hides the fact:
// fill it in and it appears on the site (see CONTENT_TODO.md).

export const scores = {
  satMath: 750,
  satMathMax: 800,
  satMathMin: 200,
  satTotal: 1440,
  satReadingWriting: 690,
  ielts: "7.0",
};

export const contact = {
  telegram: null as string | null, // e.g. "@username"
  phone: null as string | null, // e.g. "+998 90 123 45 67"
};

export const tools = {
  ieltsUrl: null as string | null, // link to the live IELTS Reading analyzer, if it is online
};

export function siteUrl(): string | null {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return null;
}
