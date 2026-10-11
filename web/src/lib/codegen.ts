import type { Endpoint } from "@shared/types";
import { buildJsonBody, buildRequestUrl, fileParams, valueParams, type FormFiles, type FormValues } from "./tryRequest";
import { API_BASE } from "./apiBase";

/** Origen que aparece en los ejemplos generados (backend separado o mismo origen). */
function origin(): string {
  if (API_BASE) return API_BASE;
  return typeof location !== "undefined" ? location.origin : "";
}

function placeholder(ep: Endpoint, name: string): string {
  const param = ep.params.find((p) => p.name === name);
  if (!param) return "";
  if (param.default !== undefined) return String(param.default);
  if (param.enum?.length) return param.enum[0];
  if (param.type === "number") return "1";
  if (param.type === "boolean") return "true";
  return `<${name}>`;
}

function sampleValues(ep: Endpoint, values: FormValues): FormValues {
  const out: FormValues = {};
  for (const param of valueParams(ep)) {
    const v = values[param.name];
    out[param.name] = v !== undefined && v !== "" ? v : (placeholder(ep, param.name) as string);
  }
  return out;
}

/** Ejemplo en JavaScript (fetch) con los valores actuales del formulario. */
export function buildJsExample(ep: Endpoint, values: FormValues, files: FormFiles): string {
  const vals = sampleValues(ep, values);
  const base = origin();
  const hasFiles = fileParams(ep).length > 0;
  if (ep.method === "GET") {
    const url = buildRequestUrl(ep, vals);
    return `const res = await fetch("${base}${url}");\nconst data = await res.json();\nconsole.log(data);`;
  }
  if (hasFiles) {
    const lines = ["const form = new FormData();"];
    for (const fp of fileParams(ep)) {
      const file = files[fp.name]?.[0];
      lines.push(`form.append("${fp.name}", fileInput.files[0]); // ${file ? file.name : fp.accept || "archivo"}`);
    }
    for (const param of valueParams(ep)) {
      const v = vals[param.name];
      if (v !== undefined && v !== "") lines.push(`form.append("${param.name}", ${JSON.stringify(String(v))});`);
    }
    lines.push(
      `const res = await fetch("${base}${ep.path}", { method: "POST", body: form });`,
      `const data = await res.json();`,
      `console.log(data);`
    );
    return lines.join("\n");
  }
  const body = buildJsonBody(ep, vals);
  const url = buildRequestUrl(ep, vals);
  const init = body
    ? `, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${JSON.stringify(body, null, 2).split("\n").join("\n  ")})\n}`
    : `, { method: "POST" }`;
  return `const res = await fetch("${base}${url}"${init});\nconst data = await res.json();\nconsole.log(data);`;
}

/** Ejemplo en cURL con los valores actuales del formulario. */
export function buildCurlExample(ep: Endpoint, values: FormValues, files: FormFiles): string {
  const vals = sampleValues(ep, values);
  const base = origin();
  if (ep.method === "GET") {
    return `curl "${base}${buildRequestUrl(ep, vals)}"`;
  }
  const hasFiles = fileParams(ep).length > 0;
  if (hasFiles) {
    const parts = [`curl -X POST "${base}${ep.path}"`];
    for (const fp of fileParams(ep)) {
      const file = files[fp.name]?.[0];
      parts.push(`  -F "${fp.name}=@${file ? file.name : "archivo.png"}"`);
    }
    for (const param of valueParams(ep)) {
      const v = vals[param.name];
      if (v !== undefined && v !== "") parts.push(`  -F "${param.name}=${String(v).replace(/"/g, '\\"')}"`);
    }
    return parts.join(" \\\n");
  }
  const body = buildJsonBody(ep, vals);
  const url = buildRequestUrl(ep, vals);
  if (body) {
    return `curl -X POST "${base}${url}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`;
  }
  return `curl -X POST "${base}${url}"`;
}
