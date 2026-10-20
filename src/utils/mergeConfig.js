import { initialBugsConfig, initialChangelogConfig, initialStudyConfig, emptyBugProblem, emptyChange, emptyStudyTopic, emptySuiteTest } from "../constants/initialConfigs";
import { normalizeResult } from "./testSuite";

// Item null/número/texto numa lista quebraria o spread de `detalhe` abaixo: só objetos passam.
const isItem = v => v !== null && typeof v === "object" && !Array.isArray(v);

// Fix #2: Proper mergeConfig that normalises arrays, re-assigns IDs,
// and guarantees the nested `detalhe` structure on every item.
export function mergeConfig(incoming) {
  const template = incoming.template || "bugs";
  const base =
    template === "changelog" ? initialChangelogConfig :
    template === "study"     ? initialStudyConfig     :
                               initialBugsConfig;

  const merged = { ...base, ...incoming };
  merged.cores = { ...base.cores, ...(incoming.cores || {}) };

  if (template === "changelog") {
    merged.mudancas = Array.isArray(incoming.mudancas)
      ? incoming.mudancas.filter(isItem).map((m, i) => ({ ...emptyChange(), ...m, id: i + 1 }))
      : [];
    if (!Array.isArray(merged.descricao) || !merged.descricao.length) merged.descricao = [""];
    if (!Array.isArray(merged.resumo)    || !merged.resumo.length)    merged.resumo    = [""];
  } else if (template === "study") {
    merged.topicos = Array.isArray(incoming.topicos)
      ? incoming.topicos.filter(isItem).map((t, i) => ({
          ...emptyStudyTopic(), ...t, id: i + 1,
          detalhe: { explicacao: [""], exemplos: [""], codigo: [""], ...(t.detalhe || {}) },
        }))
      : [];
    if (!Array.isArray(merged.introducao) || !merged.introducao.length) merged.introducao = [""];
    if (!Array.isArray(merged.conclusao)  || !merged.conclusao.length)  merged.conclusao  = [""];
  } else {
    merged.problemas = Array.isArray(incoming.problemas)
      ? incoming.problemas.filter(isItem).map((p, i) => ({
          ...emptyBugProblem(), ...p, id: i + 1,
          detalhe: {
            ondeOcorre: [""], codigoOnde: [""], porqueProblema: [""],
            textoResolucao: [""], codigoResolucao: [""], testesPassam: [""],
            ...(p.detalhe || {}),
          },
        }))
      : [];
    // `codigo` é o ID visível do teste; `id` é interno e sempre regenerado.
    merged.suiteTestes = Array.isArray(incoming.suiteTestes)
      ? incoming.suiteTestes.filter(isItem).map(s => ({
          ...emptySuiteTest(), ...s, id: crypto.randomUUID(),
          // LLMs às vezes mandam o ID do teste em `id`: aproveita como `codigo` se não vier um.
          codigo: s?.codigo ?? (typeof s?.id === "string" ? s.id : ""),
          resultado: normalizeResult(s?.resultado),
        }))
      : [];
    if (!Array.isArray(merged.resumoExecutivo) || !merged.resumoExecutivo.length) merged.resumoExecutivo = [""];
    if (!Array.isArray(merged.conclusao)       || !merged.conclusao.length)       merged.conclusao       = [""];
  }

  return merged;
}
