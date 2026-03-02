export const TEMPLATES = {
  bugs: {
    id: "bugs",
    label: "Relatório de Bugs",
    icon: "bug-fill",
    description: "Vulnerabilidades e achados técnicos de segurança",
    accent: "#6271f5",
    accentBg: "rgba(98,113,245,0.12)",
  },
  study: {
    id: "study",
    label: "Relatório de Estudo",
    icon: "journal-bookmark-fill",
    description: "Registro de aprendizado, conceitos e práticas de um tema",
    accent: "#f59e0b",
    accentBg: "rgba(245,158,11,0.12)",
  },
  changelog: {
    id: "changelog",
    label: "Changelog / Mudanças",
    icon: "git-commit-fill",
    description: "Registro de alterações, refatorações e melhorias de código",
    accent: "#10b981",
    accentBg: "rgba(16,185,129,0.12)",
  },
};

export const initialStudyConfig = {
  template: "study",
  formato: "ABNT",
  cores: { primaria: "1F3864", secundaria: "2E75B6", concept: "f59e0b", practice: "10b981", summary: "6366f1", codeBg: "1E1E1E", codeText: "D4D4D4" },
  logo: null, logoNome: "", titulo: "", subtitulo: "", autor: "", versao: "1.0",
  introducao: [""], topicos: [], conclusao: [""],
};

export const emptyStudyTopic = () => ({
  id: Date.now() + Math.random(), titulo: "", tipo: "CONCEITO", resumo: "",
  detalhe: { explicacao: [""], exemplos: [""], codigo: [""] },
});

export const STUDY_TYPES = {
  CONCEITO: { border: "#f59e0b", text: "#f59e0b", bg: "rgba(245,158,11,0.07)", icon: "lightbulb-fill" },
  PRÁTICA:  { border: "#10b981", text: "#10b981", bg: "rgba(16,185,129,0.07)", icon: "code-square" },
  RESUMO:   { border: "#6366f1", text: "#6366f1", bg: "rgba(99,102,241,0.07)", icon: "text-paragraph" },
};

export const initialBugsConfig = {
  template: "bugs",
  formato: "ABNT",
  cores: { primaria: "1F3864", secundaria: "2E75B6", altaSev: "C00000", mediaSev: "C55A11", baixaSev: "375623", codeBg: "1E1E1E", codeText: "D4D4D4" },
  logo: null, logoNome: "", titulo: "", subtitulo: "", autor: "", versao: "1.0",
  resumoExecutivo: [""], problemas: [], conclusao: [""],
};

export const emptyBugProblem = () => ({
  id: Date.now() + Math.random(), titulo: "", severity: "ALTA", resumo: "", resolucao: "",
  detalhe: { ondeOcorre: [""], codigoOnde: [""], porqueProblema: [""], textoResolucao: [""], codigoResolucao: [""] },
});

export const SEV = {
  ALTA:  { border: "#C00000", text: "#C00000", bg: "rgba(192,0,0,0.07)" },
  MÉDIA: { border: "#C55A11", text: "#C55A11", bg: "rgba(197,90,17,0.07)" },
  BAIXA: { border: "#375623", text: "#375623", bg: "rgba(55,86,35,0.07)" },
};

export const initialChangelogConfig = {
  template: "changelog",
  formato: "ABNT",
  cores: { primaria: "0F4C35", secundaria: "10B981", breaking: "DC2626", feat: "2563EB", fix: "D97706", refactor: "7C3AED", perf: "0891B2", style: "DB2777", chore: "64748B", codeBg: "0D1117", codeText: "E6EDF3" },
  logo: null, logoNome: "", titulo: "", subtitulo: "", autor: "", versao: "1.0",
  projeto: "", repositorio: "", dataInicio: "", dataFim: "",
  descricao: [""],
  mudancas: [],
  resumo: [""],
};

export const CHANGE_TYPES = {
  feat:      { label: "Feature",    color: "#2563EB", bg: "rgba(37,99,235,0.12)",   icon: "stars" },
  fix:       { label: "Fix",        color: "#D97706", bg: "rgba(217,119,6,0.12)",   icon: "bug" },
  breaking:  { label: "Breaking",   color: "#DC2626", bg: "rgba(220,38,38,0.12)",   icon: "exclamation-triangle-fill" },
  refactor:  { label: "Refactor",   color: "#7C3AED", bg: "rgba(124,58,237,0.12)",  icon: "arrow-repeat" },
  perf:      { label: "Perf",       color: "#0891B2", bg: "rgba(8,145,178,0.12)",   icon: "lightning-charge-fill" },
  style:     { label: "Style",      color: "#DB2777", bg: "rgba(219,39,119,0.12)",  icon: "brush-fill" },
  chore:     { label: "Chore",      color: "#64748B", bg: "rgba(100,116,139,0.12)", icon: "tools" },
};

export const emptyChange = () => ({
  id: Date.now() + Math.random(),
  tipo: "feat",
  titulo: "",
  arquivo: "",
  descricao: "",
  motivacao: "",
  impacto: "",
  codigoAntes: "",
  codigoDepois: "",
  notas: "",
});
