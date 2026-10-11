import { useRef, useState } from "react";
import type { Endpoint, Param } from "@shared/types";
import { Icons } from "./Icons";
import { TypeBadge } from "./Badges";
import { formatBytes } from "../lib/format";
import type { FormFiles, FormValues } from "../lib/tryRequest";

interface Props {
  endpoint: Endpoint;
  values: FormValues;
  files: FormFiles;
  onChangeValue: (name: string, value: string | number | boolean | undefined) => void;
  onChangeFiles: (name: string, files: File[]) => void;
}

const inputCls =
  "h-9 w-full border border-line bg-bg px-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent";

function ValueInput({ param, value, onChange }: { param: Param; value: string | number | boolean | undefined; onChange: Props["onChangeValue"] }) {
  if (param.enum?.length) {
    const options = param.required ? param.enum : ["", ...param.enum];
    return (
      <select className={inputCls} value={value === undefined ? "" : String(value)} onChange={(e) => onChange(param.name, e.target.value === "" ? undefined : e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "— por defecto —" : o}
          </option>
        ))}
      </select>
    );
  }
  if (param.type === "boolean") {
    return (
      <select className={inputCls} value={value === undefined ? "" : String(value)} onChange={(e) => onChange(param.name, e.target.value === "" ? undefined : e.target.value)}>
        <option value="">— por defecto —</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }
  if (param.type === "number") {
    return (
      <input
        type="number"
        className={inputCls}
        value={value === undefined ? "" : String(value)}
        min={param.min}
        max={param.max}
        placeholder={param.default !== undefined ? `por defecto: ${param.default}` : undefined}
        onChange={(e) => onChange(param.name, e.target.value === "" ? undefined : e.target.value)}
      />
    );
  }
  return (
    <input
      type="text"
      className={inputCls}
      value={value === undefined ? "" : String(value)}
      placeholder={param.default !== undefined ? `por defecto: ${param.default}` : "…"}
      onChange={(e) => onChange(param.name, e.target.value === "" ? undefined : e.target.value)}
    />
  );
}

function FileDropzone({ param, files, onChange }: { param: Param; files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const multiple = (param.maxCount ?? 1) > 1;

  function validate(list: File[]): File[] {
    const maxBytes = (param.maxSizeMB ?? 10) * 1024 * 1024;
    const accept = (param.accept ?? "*/*").split(",").map((a) => a.trim());
    const valid: File[] = [];
    for (const f of list) {
      if (f.size > maxBytes) {
        setError(`«${f.name}» supera el límite de ${param.maxSizeMB ?? 10} MB (${formatBytes(f.size)})`);
        continue;
      }
      const okType = accept.some((a) => (a.endsWith("/*") ? f.type.startsWith(a.slice(0, -1)) : a === f.type));
      if (!okType) {
        setError(`«${f.name}» tiene un formato no compatible (${f.type || "desconocido"}). Admitidos: ${param.accept}`);
        continue;
      }
      valid.push(f);
    }
    return valid.slice(0, param.maxCount ?? 1);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          setError(null);
          const list = Array.from(e.dataTransfer.files);
          onChange(multiple ? [...files, ...validate(list)].slice(0, param.maxCount ?? 1) : validate(list));
        }}
        className={`flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed px-3 py-3 text-center text-xs transition-colors ${
          dragging ? "border-accent bg-accent-soft" : "border-line bg-panel hover:border-accent/60"
        }`}
      >
        <Icons.upload size={16} className="text-muted" />
        <span className="text-muted">
          Arrastra aquí o <span className="font-medium text-accent">selecciona</span> {multiple ? `hasta ${param.maxCount} archivos` : "un archivo"}
        </span>
        <span className="text-[10px] text-muted/80">{param.accept} · máx. {param.maxSizeMB ?? 10} MB</span>
        <input
          ref={inputRef}
          type="file"
          accept={param.accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => {
            setError(null);
            const list = Array.from(e.target.files ?? []);
            onChange(multiple ? [...files, ...validate(list)].slice(0, param.maxCount ?? 1) : validate(list));
            e.target.value = "";
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-1.5 space-y-1">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-2 border border-line bg-panel px-2 py-1 text-xs">
              <Icons.file size={13} className="shrink-0 text-muted" />
              <span className="truncate font-medium">{f.name}</span>
              <span className="ml-auto shrink-0 text-muted">{formatBytes(f.size)}</span>
              <button
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="shrink-0 text-muted hover:text-red-500"
                aria-label={`Quitar ${f.name}`}
              >
                <Icons.close size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ParamForm({ endpoint, values, files, onChangeValue, onChangeFiles }: Props) {
  if (!endpoint.params.length) {
    return <p className="text-xs text-muted">Este endpoint no requiere parámetros.</p>;
  }
  return (
    <div className="space-y-3">
      {endpoint.params.map((param) => (
        <div key={param.name}>
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <label htmlFor={`param-${endpoint.id}-${param.name}`} className="font-mono text-xs font-semibold">
              {param.name}
            </label>
            <TypeBadge type={param.type} />
            {param.required ? (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-red-500">obligatorio</span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide text-muted">opcional</span>
            )}
            {param.default !== undefined && (
              <span className="font-mono text-[10px] text-muted">= {String(param.default)}</span>
            )}
          </div>
          <p className="mb-1.5 text-xs leading-snug text-muted">{param.description}</p>
          {param.type === "file" ? (
            <FileDropzone param={param} files={files[param.name] ?? []} onChange={(list) => onChangeFiles(param.name, list)} />
          ) : (
            <ValueInput param={param} value={values[param.name]} onChange={onChangeValue} />
          )}
        </div>
      ))}
    </div>
  );
}
