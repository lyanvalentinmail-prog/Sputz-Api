import { useMemo, useState, type ReactNode } from "react";
import type { Endpoint, EndpointStatus, RuntimeEndpointInfo } from "@shared/types";
import { Icons } from "./Icons";
import { MethodChip, StatusBadge, TypeBadge } from "./Badges";
import { ParamForm } from "./ParamForm";
import { ResponsePanel } from "./ResponsePanel";
import { CodeBlock, CodeTabs } from "./CodeBlock";
import { copyText, prettyJson } from "../lib/format";
import { tryEndpoint, buildRequestUrl, type FormFiles, type FormValues, type TryResult } from "../lib/tryRequest";
import { buildCurlExample, buildJsExample } from "../lib/codegen";

interface Props {
  endpoint: Endpoint;
  status: EndpointStatus;
  runtime?: RuntimeEndpointInfo;
  apiName: string;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{children}</h4>;
}

export function EndpointDetails({ endpoint: ep, status, runtime, apiName }: Props) {
  const [values, setValues] = useState<FormValues>({});
  const [files, setFiles] = useState<FormFiles>({});
  const [result, setResult] = useState<TryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);

  const jsExample = useMemo(() => buildJsExample(ep, values, files), [ep, values, files]);
  const curlExample = useMemo(() => buildCurlExample(ep, values, files), [ep, values, files]);
  const requestUrl = useMemo(() => buildRequestUrl(ep, values), [ep, values]);

  async function onTest() {
    setLoading(true);
    setResult(null);
    const r = await tryEndpoint(ep, values, files);
    setResult(r);
    setLoading(false);
  }

  async function onCopyPath() {
    const done = await copyText(ep.path);
    if (done) {
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 1500);
    }
  }

  const requiredParams = ep.params.filter((p) => p.required);
  const optionalParams = ep.params.filter((p) => !p.required);
  const disabled = status === "unavailable";

  return (
    <div className="border-t border-line bg-bg px-3 py-4 sm:px-4">
      {/* Avisos de estado */}
      {status !== "available" && (
        <div className="mb-4 flex items-start gap-2 border border-line bg-panel px-3 py-2.5 text-xs leading-relaxed">
          <span className="mt-px shrink-0 text-amber-500">{status === "credentials" ? <Icons.key size={14} /> : <Icons.alert size={14} />}</span>
          <div>
            <p className="font-semibold text-ink">
              {status === "credentials" ? "Requiere configuración en el servidor" : "Endpoint no disponible"}
            </p>
            <p className="mt-0.5 text-muted">
              {runtime?.reason ??
                ep.unavailableReason ??
                (ep.requiresEnv?.length ? `Faltan las variables de entorno: ${ep.requiresEnv.join(", ")}.` : "")}
            </p>
            {status === "credentials" && runtime?.missing && (
              <p className="mt-1 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                Faltan: {runtime.missing.join(", ")} → añádelas al .env del servidor (consulta .env.example)
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {/* ─── Columna de documentación ─── */}
        <div className="min-w-0 space-y-4">
          <section>
            <SectionTitle>Ruta</SectionTitle>
            <div className="flex items-center gap-2 border border-line bg-code px-2.5 py-2">
              <MethodChip method={ep.method} />
              <code className="code-scroll min-w-0 flex-1 font-mono text-xs font-medium">{ep.path}</code>
              <button
                onClick={onCopyPath}
                className="inline-flex shrink-0 items-center gap-1 border border-line bg-bg px-2 py-1 text-[11px] text-muted hover:border-accent hover:text-accent"
                aria-label="Copiar ruta"
              >
                {copiedPath ? <Icons.check size={11} /> : <Icons.copy size={11} />}
                {copiedPath ? "Copiada" : "Copiar"}
              </button>
            </div>
          </section>

          {(requiredParams.length > 0 || optionalParams.length > 0) && (
            <section>
              <SectionTitle>Parámetros</SectionTitle>
              <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-line bg-panel text-[10px] uppercase tracking-wider text-muted">
                      <th className="px-2.5 py-1.5 font-semibold">Nombre</th>
                      <th className="px-2.5 py-1.5 font-semibold">Tipo</th>
                      <th className="px-2.5 py-1.5 font-semibold">Ubicación</th>
                      <th className="px-2.5 py-1.5 font-semibold">Requerido</th>
                      <th className="px-2.5 py-1.5 font-semibold">Por defecto</th>
                      <th className="px-2.5 py-1.5 font-semibold">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ep.params.map((param) => (
                      <tr key={param.name} className="border-b border-line last:border-b-0">
                        <td className="px-2.5 py-1.5 font-mono font-medium">{param.name}</td>
                        <td className="px-2.5 py-1.5"><TypeBadge type={param.type} /></td>
                        <td className="px-2.5 py-1.5 text-muted">{param.in === "file" ? "multipart" : param.in}</td>
                        <td className="px-2.5 py-1.5">
                          {param.required ? <span className="font-semibold text-red-500">sí</span> : <span className="text-muted">no</span>}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono text-muted">{param.default !== undefined ? String(param.default) : "—"}</td>
                        <td className="px-2.5 py-1.5 leading-snug text-muted">
                          {param.description}
                          {param.enum && <span className="ml-1 font-mono text-[10px]">({param.enum.join(" | ")})</span>}
                          {param.type === "number" && (param.min !== undefined || param.max !== undefined) && (
                            <span className="ml-1 font-mono text-[10px]">[{param.min ?? "-∞"} … {param.max ?? "∞"}]</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <SectionTitle>Ejemplo de solicitud</SectionTitle>
            <CodeBlock title={ep.method === "GET" ? "GET" : "POST"} code={`${ep.method} ${requestUrl}`} />
          </section>

          {ep.responseType === "json" && ep.exampleResponse !== undefined && (
            <section>
              <SectionTitle>Ejemplo de respuesta (JSON)</SectionTitle>
              <CodeBlock title="200 OK · application/json" code={prettyJson({ ...ep.exampleResponse as object, creator: apiName })} language="json" />
            </section>
          )}
          {ep.responseType !== "json" && (
            <section>
              <SectionTitle>Respuesta</SectionTitle>
              <p className="border border-line bg-panel px-2.5 py-2 text-xs text-muted">
                Devuelve contenido binario <span className="font-mono">{ep.responseType === "image" ? "image/*" : ep.responseType === "audio" ? "audio/mpeg" : ep.responseType === "zip" ? "application/zip" : "video/*"}</span>. Los errores siempre se devuelven en JSON con el mismo formato envolvente.
              </p>
            </section>
          )}

          <section>
            <SectionTitle>Código de ejemplo</SectionTitle>
            <CodeTabs
              tabs={[
                { label: "JavaScript", code: jsExample },
                { label: "cURL", code: curlExample }
              ]}
            />
          </section>
        </div>

        {/* ─── Columna de pruebas ─── */}
        <div className="min-w-0 space-y-4">
          <section>
            <SectionTitle>Probar endpoint</SectionTitle>
            <div className="border border-line bg-panel p-3">
              <ParamForm
                endpoint={ep}
                values={values}
                files={files}
                onChangeValue={(name, value) => setValues((v) => ({ ...v, [name]: value }))}
                onChangeFiles={(name, list) => setFiles((f) => ({ ...f, [name]: list }))}
              />
              <button
                onClick={onTest}
                disabled={loading || disabled}
                className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors sm:w-auto ${
                  disabled
                    ? "cursor-not-allowed border border-line bg-code text-muted"
                    : loading
                      ? "cursor-wait bg-accent/70 text-white"
                      : "bg-accent text-white hover:bg-accent/90"
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 animate-spin border-2 border-white/40 border-t-white" />
                    Probando…
                  </>
                ) : disabled ? (
                  "No disponible"
                ) : (
                  <>
                    Probar endpoint <Icons.arrowRight size={14} />
                  </>
                )}
              </button>
              {disabled && (
                <p className="mt-2 text-[11px] text-muted">
                  Este endpoint no puede probarse hasta que se configure lo indicado arriba.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionTitle>Respuesta</SectionTitle>
            <ResponsePanel result={result} loading={loading} responseType={ep.responseType} />
          </section>

          <section>
            <SectionTitle>Formato de error</SectionTitle>
            <CodeBlock
              title="application/json"
              language="json"
              code={prettyJson({ status: false, creator: apiName, code: 400, error: "El parámetro «text» es obligatorio" })}
            />
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              Todas las respuestas JSON usan el formato envolvente {"{ status, creator, data }"} en éxitos y {"{ status, code, error }"} en fallos. Los códigos habituales: 400 (parámetros), 413 (archivo grande), 429 (límite de solicitudes), 501 (no implementado), 503 (falta credencial o servicio), 504 (tiempo de espera).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
