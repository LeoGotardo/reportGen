export const emptyTable = () => ({
  id: crypto.randomUUID(),
  titulo: "",
  cabecalhos: ["Coluna 1", "Coluna 2"],
  linhas: [["", ""]],
});

export const emptyBugProblem = () => ({
  id: crypto.randomUUID(),
  titulo: "",
  severity: "ALTA",
  resumo: "",
  resolucao: "",
  comoReproduzir: "",
  detalhe: {
    ondeOcorre: [""],
    codigoOnde: [""],
    porqueProblema: [""],
    textoResolucao: [""],
    codigoResolucao: [""],
    testesPassam: [""],
  },
});

export const emptyBugTest = () => ({
  id: crypto.randomUUID(),
  titulo: "",
  descricao: "",
  como: "",
  codigo: [""],
});

// Linha da suíte de testes. `id` é interno (chave React); o ID visível do teste fica em `codigo`.
export const SUITE_RESULTS = ["PASS", "FAIL", "UNTESTED"];
export const emptySuiteTest = (codigo = "") => ({
  id: crypto.randomUUID(),
  codigo,
  titulo: "",
  descricao: "",
  resultado: "UNTESTED",
});

export const emptyStudyTopic = () => ({
  id: crypto.randomUUID(),
  titulo: "",
  tipo: "CONCEITO",
  resumo: "",
  detalhe: { explicacao: [""], exemplos: [""], codigo: [""] },
});

export const emptyChange = () => ({
  id: crypto.randomUUID(),
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
  data: "",
  resumoExecutivo: [""],
  problemas: [],
  testes: [],
  suiteTestes: [],
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
  data: "",
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
  data: "",
  projeto: "",
  repositorio: "",
  dataInicio: "",
  dataFim: "",
  descricao: [""],
  mudancas: [],
  tabelas: [],
  resumo: [""],
};