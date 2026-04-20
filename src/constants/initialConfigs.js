export const emptyTable = () => ({
  id: Date.now() + Math.random(),
  titulo: "",
  cabecalhos: ["Coluna 1", "Coluna 2"],
  linhas: [["", ""]],
});

export const emptyBugProblem = () => ({
  id: Date.now() + Math.random(),
  titulo: "",
  severity: "ALTA",
  resumo: "",
  resolucao: "",
  detalhe: {
    ondeOcorre: [""],
    codigoOnde: [""],
    porqueProblema: [""],
    textoResolucao: [""],
    codigoResolucao: [""],
  },
});

export const emptyStudyTopic = () => ({
  id: Date.now() + Math.random(),
  titulo: "",
  tipo: "CONCEITO",
  resumo: "",
  detalhe: { explicacao: [""], exemplos: [""], codigo: [""] },
});

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

export const initialBugsConfig = {
  template: "bugs",
  formato: "ABNT",
  cores: {
    primaria: "1F3864",
    secundaria: "2E75B6",
    altaSev: "C00000",
    mediaSev: "C55A11",
    baixaSev: "375623",
    codeBg: "1E1E1E",
    codeText: "D4D4D4",
  },
  logo: null,
  logoNome: "",
  titulo: "",
  subtitulo: "",
  autor: "",
  versao: "1.0",
  resumoExecutivo: [""],
  problemas: [],
  tabelas: [],
  conclusao: [""],
};

export const initialStudyConfig = {
  template: "study",
  formato: "ABNT",
  cores: {
    primaria: "1F3864",
    secundaria: "2E75B6",
    concept: "f59e0b",
    practice: "10b981",
    summary: "6366f1",
    codeBg: "1E1E1E",
    codeText: "D4D4D4",
  },
  logo: null,
  logoNome: "",
  titulo: "",
  subtitulo: "",
  autor: "",
  versao: "1.0",
  introducao: [""],
  topicos: [],
  tabelas: [],
  conclusao: [""],
};

export const initialChangelogConfig = {
  template: "changelog",
  formato: "ABNT",
  cores: {
    primaria: "0F4C35",
    secundaria: "10B981",
    breaking: "DC2626",
    feat: "2563EB",
    fix: "D97706",
    refactor: "7C3AED",
    perf: "0891B2",
    style: "DB2777",
    chore: "64748B",
    codeBg: "0D1117",
    codeText: "E6EDF3",
  },
  logo: null,
  logoNome: "",
  titulo: "",
  subtitulo: "",
  autor: "",
  versao: "1.0",
  projeto: "",
  repositorio: "",
  dataInicio: "",
  dataFim: "",
  descricao: [""],
  mudancas: [],
  tabelas: [],
  resumo: [""],
};