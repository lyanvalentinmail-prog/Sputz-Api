import QRCode from "qrcode";
import type { Handler } from "./types";
import { isgdShorten, tinyurlShorten, googleTranslate } from "../services/external";
import { assertColor } from "../services/canvasFx";
import { assertHttpUrl } from "../lib/http";
import { badRequest } from "../lib/errors";
import { binary, ok } from "../lib/respond";

/**
 * Evaluador seguro de expresiones matemáticas (shunting-yard).
 * Admite: + - * / % ^, paréntesis, decimales y signo negativo unario.
 * No usa eval: cualquier carácter desconocido produce un error 400.
 */
export function safeCalculate(expression: string): number {
  const expr = expression.replace(/\s+/g, "").replace(/×/g, "*").replace(/÷/g, "/").replace(/,/g, ".");
  if (!/^[-+*/%^().0-9]+$/.test(expr)) throw badRequest("La expresión solo puede contener números y los operadores + - * / % ^ ( )");
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < expr.length && /[0-9.]/.test(expr[i])) num += expr[i++];
      if ((num.match(/\./g) || []).length > 1) throw badRequest(`Número no válido: «${num}»`);
      tokens.push(num);
      continue;
    }
    // Menos unario
    if (ch === "-" && (tokens.length === 0 || "+-*/%^(".includes(tokens[tokens.length - 1]))) {
      tokens.push("u-");
      i++;
      continue;
    }
    if ("+-*/%^()".includes(ch)) {
      tokens.push(ch);
      i++;
      continue;
    }
    throw badRequest(`Carácter no admitido: «${ch}»`);
  }

  const prec: Record<string, number> = { "u-": 4, "^": 3, "*": 2, "/": 2, "%": 2, "+": 1, "-": 1 };
  const rightAssoc: Record<string, boolean> = { "^": true, "u-": true };
  const output: string[] = [];
  const ops: string[] = [];
  for (const t of tokens) {
    if (/^[0-9.]+$/.test(t)) {
      output.push(t);
    } else if (t === "(") {
      ops.push(t);
    } else if (t === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") output.push(ops.pop()!);
      if (!ops.length) throw badRequest("Paréntesis desbalanceados");
      ops.pop();
    } else {
      while (ops.length && ops[ops.length - 1] !== "(" && (prec[ops[ops.length - 1]] > prec[t] || (prec[ops[ops.length - 1]] === prec[t] && !rightAssoc[t]))) {
        output.push(ops.pop()!);
      }
      ops.push(t);
    }
  }
  while (ops.length) {
    const op = ops.pop()!;
    if (op === "(" || op === ")") throw badRequest("Paréntesis desbalanceados");
    output.push(op);
  }

  const stack: number[] = [];
  for (const t of output) {
    if (/^[0-9.]+$/.test(t)) {
      stack.push(Number.parseFloat(t));
      continue;
    }
    if (t === "u-") {
      const a = stack.pop();
      if (a === undefined) throw badRequest("Expresión incompleta");
      stack.push(-a);
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) throw badRequest("Expresión incompleta");
    switch (t) {
      case "+": stack.push(a + b); break;
      case "-": stack.push(a - b); break;
      case "*": stack.push(a * b); break;
      case "/":
        if (b === 0) throw badRequest("División por cero");
        stack.push(a / b);
        break;
      case "%":
        if (b === 0) throw badRequest("Módulo por cero");
        stack.push(a % b);
        break;
      case "^": stack.push(Math.pow(a, b)); break;
      default: throw badRequest(`Operador no admitido: «${t}»`);
    }
  }
  if (stack.length !== 1) throw badRequest("Expresión no válida");
  const result = stack[0];
  if (!Number.isFinite(result)) throw badRequest("El resultado no es un número finito");
  return Math.round(result * 1e10) / 1e10;
}

export const toolsHandlers: Record<string, Handler> = {
  qr: async ({ params, res }) => {
    const dark = assertColor(String(params.dark ?? "#000000"), "dark");
    const light = assertColor(String(params.light ?? "#ffffff"), "light");
    const png = await QRCode.toBuffer(String(params.text), {
      type: "png",
      width: Number(params.size),
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark, light }
    });
    binary(res, "image/png", png, "qr.png");
  },

  shorturl: async ({ params, res }) => {
    const url = String(params.url);
    assertHttpUrl(url);
    const short = await isgdShorten(url);
    ok(res, { original: url, short, service: "is.gd" });
  },

  tinyurl: async ({ params, res }) => {
    const url = String(params.url);
    assertHttpUrl(url);
    const short = await tinyurlShorten(url, params.alias ? String(params.alias) : undefined);
    ok(res, { original: url, short, service: "tinyurl" });
  },

  calculate: ({ params, res }) => {
    const expression = String(params.expression);
    const result = safeCalculate(expression);
    ok(res, { expression, result });
  },

  translate: async ({ params, res }) => {
    const text = String(params.text);
    const to = String(params.to ?? "en");
    const from = String(params.from ?? "auto");
    if (!/^[a-zA-Z-]{2,10}$/.test(to) || !/^(auto|[a-zA-Z-]{2,10})$/.test(from)) throw badRequest("Los idiomas deben ser códigos ISO 639-1 (p. ej. es, en, pt)");
    const r = await googleTranslate(text, to, from);
    ok(res, { from: r.from, to, text, translation: r.translation });
  }
};
