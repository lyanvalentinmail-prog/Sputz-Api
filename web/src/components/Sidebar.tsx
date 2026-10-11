import { useEffect, useState } from "react";
import { CATEGORIES, endpointsByCategory } from "@shared/catalog";
import type { Endpoint } from "@shared/types";
import { Icons, type IconName } from "./Icons";
import { MethodChip } from "./Badges";

interface Props {
  open: boolean;
  onClose: () => void;
  activeCategory: string | null;
  activeEndpoint: string | null;
  statusOf: (ep: Endpoint) => "available" | "credentials" | "unavailable";
  onSelectEndpoint: (ep: Endpoint) => void;
}

export function Sidebar({ open, onClose, activeCategory, activeEndpoint, statusOf, onSelectEndpoint }: Props) {
  const [expanded, setExpanded] = useState<string | null>(activeCategory);

  // Si cambia la categoría activa desde fuera (p. ej. desde el buscador), expandirla
  useEffect(() => {
    if (activeCategory) setExpanded(activeCategory);
  }, [activeCategory]);
  const expandedCat = expanded;

  const nav = (
    <nav className="flex h-full flex-col overflow-y-auto bg-bg" aria-label="Categorías de endpoints">
      <div className="flex items-center justify-between border-b border-line px-3 py-2.5 md:hidden">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Menú</span>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center border border-line" aria-label="Cerrar menú">
          <Icons.close size={15} />
        </button>
      </div>
      {CATEGORIES.map((cat) => {
        const eps = endpointsByCategory(cat.id);
        const isOpen = expandedCat === cat.id;
        const Icon = Icons[cat.icon as IconName];
        return (
          <div key={cat.id} className="border-b border-line">
            <button
              onClick={() => setExpanded(isOpen ? null : cat.id)}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors ${
                activeCategory === cat.id ? "bg-accent-soft text-ink" : "hover:bg-panel"
              }`}
              aria-expanded={isOpen}
            >
              <span className={activeCategory === cat.id ? "text-accent" : "text-muted"}>
                <Icon size={17} />
              </span>
              <span className="flex-1 font-medium">{cat.name}</span>
              <span className="font-mono text-[10px] text-muted">{eps.length}</span>
              <span className={`text-muted transition-transform ${isOpen ? "" : "-rotate-90"}`}>
                <Icons.chevron size={14} />
              </span>
            </button>
            {isOpen && (
              <ul className="bg-panel pb-1">
                {eps.map((ep) => {
                  const st = statusOf(ep);
                  return (
                    <li key={ep.id}>
                      <button
                        onClick={() => {
                          onSelectEndpoint(ep);
                          onClose(); // En móvil el menú se cierra al elegir
                        }}
                        className={`flex w-full items-center gap-2 py-1.5 pl-6 pr-3 text-left font-mono text-xs ${
                          activeEndpoint === ep.id ? "border-l-2 border-accent bg-accent-soft font-semibold text-accent" : "border-l-2 border-transparent text-muted hover:text-ink"
                        }`}
                      >
                        <span className="truncate">{ep.name}</span>
                        {st !== "available" && (
                          <span className={`ml-auto h-1.5 w-1.5 shrink-0 ${st === "credentials" ? "bg-amber-500" : "bg-muted/50"}`} title={st === "credentials" ? "Falta credencial o servicio" : "No disponible"} />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
      <div className="mt-auto px-3 py-3 text-[11px] leading-relaxed text-muted">
        Métodos reales, validación completa y límites de uso activos. Las credenciales externas viven solo en el servidor.
      </div>
    </nav>
  );

  return (
    <>
      {/* PC/tablet grande: menú lateral fijo */}
      <aside className="hidden w-60 shrink-0 border-r border-line md:block">{nav}</aside>

      {/* Móvil: cajón lateral con superposición */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-[85vw] max-w-xs border-r border-line bg-bg">{nav}</div>
        </div>
      )}
    </>
  );
}
