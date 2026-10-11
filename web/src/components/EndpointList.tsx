import type { Category, Endpoint, EndpointStatus, RuntimeEndpointInfo } from "@shared/types";
import { Icons } from "./Icons";
import { MethodChip, StatusBadge } from "./Badges";
import { EndpointDetails } from "./EndpointDetails";

interface Props {
  category: Category;
  endpoints: Endpoint[];
  expandedId: string | null;
  onToggle: (id: string) => void;
  statusOf: (ep: Endpoint) => EndpointStatus;
  runtimeOf: (ep: Endpoint) => RuntimeEndpointInfo | undefined;
  apiName: string;
}

/** Vista de una categoría: filas compactas de endpoints, todas cerradas por defecto. */
export function EndpointList({ category, endpoints, expandedId, onToggle, statusOf, runtimeOf, apiName }: Props) {
  return (
    <div>
      <header className="border-b border-line px-3 py-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-semibold tracking-tight">{category.name}</h2>
          <span className="border border-line bg-panel px-1.5 py-0.5 font-mono text-[10px] text-muted">{endpoints.length}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted">{category.description}</p>
      </header>

      <ul>
        {endpoints.map((ep) => {
          const expanded = expandedId === ep.id;
          const status = statusOf(ep);
          return (
            <li key={ep.id} id={`ep-${ep.id}`} className="border-b border-line scroll-mt-16">
              <button
                onClick={() => onToggle(ep.id)}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors sm:gap-3 sm:px-5 ${
                  expanded ? "bg-accent-soft" : "hover:bg-panel"
                }`}
                aria-expanded={expanded}
              >
                {/* Flecha para desplegar (nunca candados) */}
                <span className={`shrink-0 text-muted transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`}>
                  <Icons.chevron size={14} />
                </span>
                <MethodChip method={ep.method} />
                <span className="shrink-0 font-mono text-xs font-semibold sm:text-sm">{ep.name}</span>
                <span className="hidden min-w-0 flex-1 truncate text-xs text-muted sm:block">{ep.description}</span>
                <span className="hidden min-w-0 shrink truncate font-mono text-[11px] text-muted md:block md:max-w-48">{ep.path}</span>
                <span className="ml-auto shrink-0 sm:ml-0">
                  <StatusBadge status={status} detail={runtimeOf(ep)?.reason} />
                </span>
              </button>
              {/* Descripción visible también en móvil */}
              <p className="px-3 pb-2 text-[11px] leading-snug text-muted sm:hidden">
                {ep.description}
              </p>
              {expanded && <EndpointDetails endpoint={ep} status={status} runtime={runtimeOf(ep)} apiName={apiName} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
