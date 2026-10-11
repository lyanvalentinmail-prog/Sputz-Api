import { useState } from "react";
import { Icons } from "./Icons";
import { copyText } from "../lib/format";

interface Props {
  title?: string;
  code: string;
  language?: string;
}

/** Bloque de código con botón de copiar y desplazamiento horizontal propio. */
export function CodeBlock({ title, code, language }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const done = await copyText(code);
    if (done) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="border border-line">
      <div className="flex items-center justify-between border-b border-line bg-panel px-2.5 py-1">
        <span className="font-mono text-[11px] text-muted">{title ?? language ?? "código"}</span>
        <button onClick={onCopy} className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-accent" aria-label="Copiar código">
          {copied ? <Icons.check size={12} /> : <Icons.copy size={12} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="code-scroll bg-code px-2.5 py-2 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface TabsProps {
  tabs: Array<{ label: string; code: string }>;
}

/** Pestañas JavaScript / cURL con copiado. */
export function CodeTabs({ tabs }: TabsProps) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = tabs[active];

  async function onCopy() {
    const done = await copyText(current.code);
    if (done) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="border border-line">
      <div className="flex items-center border-b border-line bg-panel">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`px-3 py-1.5 text-xs font-medium ${
              i === active ? "border-b-2 border-accent bg-bg text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
        <button onClick={onCopy} className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-[11px] text-muted hover:text-accent" aria-label="Copiar código">
          {copied ? <Icons.check size={12} /> : <Icons.copy size={12} />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="code-scroll max-h-72 bg-code px-2.5 py-2 font-mono text-xs leading-relaxed">
        <code>{current.code}</code>
      </pre>
    </div>
  );
}
