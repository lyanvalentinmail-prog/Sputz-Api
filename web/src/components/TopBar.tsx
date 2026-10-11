import { useEffect, useRef, useState } from "react";
import type { Endpoint } from "@shared/types";
import { CATEGORIES } from "@shared/catalog";
import { Icons } from "./Icons";
import { MethodChip, StatusBadge } from "./Badges";
import type { ApiStatus } from "../lib/runtime";

interface Props {
  apiName: string;
  apiStatus: ApiStatus | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  endpoints: Endpoint[];
  statusOf: (ep: Endpoint) => "available" | "credentials" | "unavailable";
  onSelectEndpoint: (ep: Endpoint) => void;
}

export function TopBar({ apiName, apiStatus, theme, onToggleTheme, onToggleSidebar, endpoints, statusOf, onSelectEndpoint }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const results = q
    ? endpoints
        .filter((ep) => {
          const cat = CATEGORIES.find((c) => c.id === ep.category);
          return (
            ep.name.toLowerCase().includes(q) ||
            ep.description.toLowerCase().includes(q) ||
            ep.path.toLowerCase().includes(q) ||
            (cat?.name.toLowerCase().includes(q) ?? false)
          );
        })
        .slice(0, 30)
    : [];

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function choose(ep: Endpoint) {
    onSelectEndpoint(ep);
    setOpen(false);
    setQuery("");
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-line bg-bg px-3 sm:gap-3 sm:px-4">
      {/* Botón de menú (solo móvil/tablet) */}
      <button
        onClick={onToggleSidebar}
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-ink hover:bg-panel md:hidden"
        aria-label="Abrir menú"
      >
        <Icons.menu size={18} />
      </button>

      {/* Logotipo y nombre */}
      <div className="flex min-w-0 shrink items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-accent text-white">
          <Icons.bolt size={15} />
        </span>
        <span className="hidden truncate text-sm font-semibold tracking-tight sm:block">{apiName}</span>
      </div>

      {/* Buscador global */}
      <div ref={boxRef} className="relative mx-auto w-full max-w-xl">
        <div className="flex h-9 items-center gap-2 border border-line bg-panel px-2.5 focus-within:border-accent">
          <Icons.search size={15} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              else if (e.key === "Enter" && results[active]) choose(results[active]);
              else if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Buscar endpoints…  (pulsa /)"
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted"
            aria-label="Buscador global de endpoints"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted hover:text-ink" aria-label="Limpiar búsqueda">
              <Icons.close size={14} />
            </button>
          )}
        </div>

        {open && q && (
          <div className="absolute left-0 right-0 top-10 z-50 max-h-[70vh] overflow-y-auto border border-line bg-bg shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
            {results.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted">
                Sin coincidencias para «{query.trim()}»
              </div>
            ) : (
              <>
                <div className="border-b border-line px-3 py-1.5 text-[11px] text-muted">
                  {results.length} resultado{results.length === 1 ? "" : "s"}
                </div>
                {results.map((ep, i) => {
                  const cat = CATEGORIES.find((c) => c.id === ep.category);
                  return (
                    <button
                      key={ep.id}
                      onClick={() => choose(ep)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center gap-2 border-b border-line px-3 py-2 text-left last:border-b-0 ${i === active ? "bg-accent-soft" : "hover:bg-panel"}`}
                    >
                      <MethodChip method={ep.method} />
                      <span className="truncate font-mono text-xs font-medium">{ep.path}</span>
                      <span className="ml-auto hidden shrink-0 text-[11px] text-muted sm:block">{cat?.name}</span>
                      <StatusBadge status={statusOf(ep)} />
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* Estado del servicio */}
      <div
        className="flex shrink-0 items-center gap-1.5 border border-line px-2 py-1.5 text-[11px] text-muted"
        title={apiStatus ? `${apiStatus.name} v${apiStatus.version} · activo hace ${Math.floor(apiStatus.uptime / 60)} min` : "Backend sin respuesta"}
      >
        <span className={`inline-block h-2 w-2 ${apiStatus ? "bg-accent" : "bg-red-500"}`} />
        <span className="hidden lg:inline">{apiStatus ? "Operativo" : "Sin conexión"}</span>
      </div>

      {/* Tema claro/oscuro */}
      <button
        onClick={onToggleTheme}
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-line text-ink hover:bg-panel"
        aria-label={theme === "light" ? "Activar tema oscuro" : "Activar tema claro"}
        title={theme === "light" ? "Tema oscuro" : "Tema claro"}
      >
        {theme === "light" ? <Icons.moon size={16} /> : <Icons.sun size={16} />}
      </button>
    </header>
  );
}
