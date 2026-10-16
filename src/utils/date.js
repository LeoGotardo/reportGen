// Datas dos relatórios: guardadas em ISO (AAAA-MM-DD) no config e exibidas como dd/mm/aaaa.

const pad = n => String(n).padStart(2, "0");

/** Data local (não UTC — toISOString erraria o dia perto da meia-noite). */
export function isoFromDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const todayIso = () => isoFromDate(new Date());

function validIso(y, m, d) {
  const dt = new Date(y, m - 1, d);
  if (y < 1000 || y > 9999 || dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Aceita "AAAA-MM-DD" ou "dd/mm/aaaa" (ex.: JSON vindo de LLM). Data inexistente → null. */
export function toIsoDate(v) {
  if (typeof v !== "string") return null;
  const s = v.trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return validIso(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return validIso(+m[3], +m[2], +m[1]);
  return null;
}

/** dd/mm/aaaa — mesmo padrão em pt e en. Valor inválido → "". */
export function formatDate(v) {
  const iso = toIsoDate(v);
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Máscara de digitação: só dígitos, barras inseridas automaticamente. */
export function maskDate(v) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}
