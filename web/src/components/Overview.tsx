import { CATEGORIES, ENDPOINTS, endpointsByCategory } from "@shared/catalog";
import type { Category, Endpoint, EndpointStatus } from "@shared/types";
import { Icons, type IconName } from "./Icons";
import { prettyJson } from "../lib/format";

interface Props {
  apiName: string;
  statusOf: (ep: Endpoint) => EndpointStatus;
  onSelectCategory: (cat: Category) => void;
}

/** Panel inicial: resumen compacto de la API y acceso rápido a categorías. */
export function Overview({ apiName, statusOf, onSelectCategory }: Props) {
  const counts = ENDPOINTS.reduce(
    (acc, ep) => {
      acc[statusOf(ep)]++;
      return acc;
    },
    { available: 0, credentials: 0, unavailable: 0 } as Record<EndpointStatus, number>
  );

  return (
    <div className="px-3 py-5 sm:px-5">
      <header className="border-b border-line pb-4">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{apiName}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          Playground y documentación interactiva: explora las {CATEGORIES.length} categorías, consulta los parámetros de cada
          endpoint y prueba las solicitudes directamente desde el navegador. Sin registro ni claves para navegar.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 border border-line bg-panel px-2 py-1">
            <span className="inline-block h-2 w-2 bg-accent" /> {counts.available} disponibles
          </span>
          <span className="inline-flex items-center gap-1.5 border border-line bg-panel px-2 py-1">
            <span className="inline-block h-2 w-2 bg-amber-500" /> {counts.credentials} requieren credencial o servicio
          </span>
          <span className="inline-flex items-center gap-1.5 border border-line bg-panel px-2 py-1">
            <span className="inline-block h-2 w-2 bg-muted" /> {counts.unavailable} no disponibles
          </span>
          <span className="inline-flex items-center gap-1.5 border border-line bg-panel px-2 py-1 font-mono">
            {ENDPOINTS.length} endpoints
          </span>
        </div>
      </header>

      <section className="mt-4">
        <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Categorías</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const Icon = Icons[cat.icon as IconName];
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className="flex items-center gap-2.5 border border-line bg-bg px-3 py-2.5 text-left transition-colors hover:border-accent/50 hover:bg-accent-soft"
              >
                <span className="shrink-0 text-accent">
                  <Icon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{cat.name}</span>
                  <span className="block font-mono text-[10px] text-muted">{endpointsByCategory(cat.id).length} endpoints</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Convención de respuestas</h2>
          <pre className="code-scroll border border-line bg-code px-3 py-2.5 font-mono text-xs leading-relaxed">
            <code>
              {prettyJson({
                status: true,
                creator: apiName,
                data: { "…": "resultado del endpoint" }
              })}
              {"\n\n"}
              {prettyJson({
                status: false,
                creator: apiName,
                code: 400,
                error: "El parámetro «text» es obligatorio"
              })}
            </code>
          </pre>
        </div>
        <div>
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Cómo usarla</h2>
          <ul className="space-y-2 border border-line bg-panel px-3 py-2.5 text-xs leading-relaxed text-muted">
            <li className="flex gap-2">
              <span className="mt-px shrink-0 text-accent"><Icons.arrowRight size={13} /></span>
              Abre una categoría en el menú lateral y pulsa la flecha de un endpoint para ver su documentación completa.
            </li>
            <li className="flex gap-2">
              <span className="mt-px shrink-0 text-accent"><Icons.arrowRight size={13} /></span>
              Rellena el formulario y pulsa «Probar endpoint»: verás el código HTTP, el tiempo de respuesta y el resultado real.
            </li>
            <li className="flex gap-2">
              <span className="mt-px shrink-0 text-accent"><Icons.arrowRight size={13} /></span>
              Copia ejemplos en JavaScript o cURL listos para tu bot de WhatsApp.
            </li>
            <li className="flex gap-2">
              <span className="mt-px shrink-0 text-accent"><Icons.arrowRight size={13} /></span>
              Las claves de proveedores externos viven solo en el servidor; el frontend nunca las expone.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
