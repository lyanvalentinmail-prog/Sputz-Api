import { Icons } from "./Icons";
import { explainStatus, formatBytes, prettyJson } from "../lib/format";
import type { TryResult } from "../lib/tryRequest";
import type { ResponseType } from "@shared/types";

interface Props {
  result: TryResult | null;
  loading: boolean;
  responseType: ResponseType;
}

function statusColor(status: number): string {
  if (status === 0) return "border-red-500/40 bg-red-500/10 text-red-500";
  if (status >= 200 && status < 300) return "border-accent/40 bg-accent-soft text-accent";
  if (status >= 400 && status < 500) return "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  return "border-red-500/40 bg-red-500/10 text-red-500";
}

export function ResponsePanel({ result, loading, responseType }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 border border-line bg-panel px-3 py-6 text-sm text-muted">
        <span className="inline-block h-3.5 w-3.5 animate-spin border-2 border-line border-t-accent" />
        Enviando solicitud…
      </div>
    );
  }
  if (!result) {
    return (
      <div className="border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
        La respuesta aparecerá aquí al pulsar «Probar endpoint».
      </div>
    );
  }

  const explanation = explainStatus(result.httpStatus);

  return (
    <div className="border border-line">
      {/* Cabecera: código HTTP, tiempo y tipo */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-panel px-2.5 py-1.5 text-[11px]">
        <span className={`border px-1.5 py-0.5 font-mono font-semibold ${statusColor(result.httpStatus)}`}>
          {result.httpStatus === 0 ? "ERROR" : result.httpStatus}
        </span>
        <span className="inline-flex items-center gap-1 text-muted">
          <Icons.clock size={12} /> {result.timeMs} ms
        </span>
        {result.contentType && <span className="truncate font-mono text-muted">{result.contentType.split(";")[0]}</span>}
        {result.blobSize !== undefined && <span className="ml-auto text-muted">{formatBytes(result.blobSize)}</span>}
      </div>

      {/* Explicación de error */}
      {explanation && (
        <div className="flex items-start gap-2 border-b border-line bg-amber-500/5 px-2.5 py-2 text-xs leading-snug text-amber-700 dark:text-amber-400">
          <Icons.alert size={14} className="mt-px shrink-0" />
          <span>{explanation}</span>
        </div>
      )}

      {/* Cuerpo */}
      <div className="max-h-96 overflow-auto bg-code p-2.5">
        {result.networkError ? (
          <p className="text-xs text-red-500">{result.networkError}</p>
        ) : result.json !== undefined ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">{prettyJson(result.json)}</pre>
        ) : result.blobUrl ? (
          <div className="flex flex-col items-center gap-2 py-2">
            {responseType === "image" || result.contentType.startsWith("image/") ? (
              <img src={result.blobUrl} alt="Resultado del endpoint" className="max-h-72 max-w-full border border-line object-contain" />
            ) : responseType === "audio" || result.contentType.startsWith("audio/") ? (
              <audio src={result.blobUrl} controls className="w-full max-w-md" />
            ) : (
              <a
                href={result.blobUrl}
                download="resultado.zip"
                className="inline-flex items-center gap-2 border border-accent bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent hover:text-white"
              >
                <Icons.download size={14} /> Descargar resultado ({formatBytes(result.blobSize ?? 0)})
              </a>
            )}
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs">{result.text ?? "(sin contenido)"}</pre>
        )}
      </div>
    </div>
  );
}
