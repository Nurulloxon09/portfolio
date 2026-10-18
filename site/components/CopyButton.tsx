"use client";

import { useEffect, useState } from "react";

export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string | null;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); the text stays selectable.
    }
  }

  return (
    <button type="button" className="btn btn-secondary min-h-[44px]" onClick={copy} disabled={!value}>
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
