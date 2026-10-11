import type { EndpointStatus, ParamType } from "@shared/types";

/** Chip de método HTTP con colores sobrios. */
export function MethodChip({ method }: { method: "GET" | "POST" }) {
  return (
    <span
      className={`inline-flex items-center justify-center border px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none tracking-wide ${
        method === "GET"
          ? "border-accent/40 bg-accent-soft text-accent"
          : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      }`}
    >
      {method}
    </span>
  );
}

/** Etiqueta de tipo de parámetro. */
export function TypeBadge({ type }: { type: ParamType }) {
  return <span className="border border-line bg-code px-1 py-px font-mono text-[10px] text-muted">{type}</span>;
}

const STATUS_LABEL: Record<EndpointStatus, string> = {
  available: "Disponible",
  credentials: "Falta credencial",
  unavailable: "No disponible"
};

/** Estado del endpoint: disponible / falta credencial o servicio / no disponible. */
export function StatusBadge({ status, detail }: { status: EndpointStatus; detail?: string }) {
  const styles: Record<EndpointStatus, string> = {
    available: "border-accent/40 bg-accent-soft text-accent",
    credentials: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    unavailable: "border-line bg-code text-muted"
  };
  return (
    <span className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[11px] font-medium leading-none ${styles[status]}`} title={detail}>
      <span className={`inline-block h-1.5 w-1.5 ${status === "available" ? "bg-accent" : status === "credentials" ? "bg-amber-500" : "bg-muted"}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
