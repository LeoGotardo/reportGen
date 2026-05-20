# Relatório de Code Review — ReportGen

**Data:** 2026-05-19  
**Escopo:** `src/` completo  
**Stack:** React 19 + Vite, sem estado global, localStorage via hook customizado

---

## Estrutura do Projeto

```
src/
├── App.jsx                    # Shell, roteamento de template, resize, modais
├── components/
│   ├── Bi.jsx                 # Wrapper Bootstrap Icons
│   ├── BugsComponents.jsx     # Cards de problema/teste (bugs)
│   ├── ChangelogComponents.jsx# Card de mudança (changelog)
│   ├── Editors.jsx            # BugsEditor / StudyEditor / ChangelogEditor
│   ├── ExportPanel.jsx        # PDF (pdfmake) + DOCX (docx-js) + HTML — carregados por CDN
│   ├── JsonImportModal.jsx    # Import via JSON
│   ├── JsonOutput.jsx         # Visualizador JSON
│   ├── LayoutComponents.jsx   # ResizeHandle, Stats
│   ├── PreviewComponents.jsx  # BugsPreview / StudyPreview / ChangelogPreview
│   ├── StudyComponents.jsx    # Card de tópico (study)
│   ├── TableComponents.jsx    # Card de tabela
│   ├── TemplateSelector.jsx   # Modal seletor de template
│   └── UI.jsx                 # ArrayField, ColorField, LogoField, DragList, SectionHeader
├── constants/
│   ├── initialConfigs.js      # Estado inicial dos 3 templates + factories empty*
│   └── templates.js           # Metadados de templates e CHANGE_TYPES
├── contexts/LangContext.jsx   # Provider de idioma (pt/en)
├── hooks/
│   ├── useIsMobile.js
│   └── useLocalStorageState.js
├── i18n/index.js              # Strings pt + en
└── utils/exportUtils.js       # buildBugsHtml / buildStudyHtml / buildChangelogHtml
```

---

## Falhas por Severidade

### 🔴 Crítico

---

#### C1 — Shadowing do objeto i18n em `handleImport`
**Arquivo:** `App.jsx:189`

```js
// linha 144 — t é o objeto de traduções
const { t, lang, setLang } = useLang();

// linha 189 — t é sobrescrito como string de template
const handleImport = merged => {
  const t = merged.template || "bugs";  // ← shadow! o t de useLang() some
  setActiveTemplate(t);
  ...
};
```

Dentro de `handleImport`, `t` passa a ser uma string (`"bugs"` / `"study"` / `"changelog"`), não o objeto i18n. Se alguém usar `t.algumaCampoI18n` dentro do escopo desse handler no futuro, vai receber `undefined` silenciosamente.

**Correção:** renomear a variável local para `tmpl`.

```js
const handleImport = merged => {
  const tmpl = merged.template || "bugs";
  setActiveTemplate(tmpl);
  if      (tmpl === "study")     setStudyConfig(merged);
  else if (tmpl === "changelog") setChangelogConfig(merged);
  else                           setBugsConfig(merged);
};
```

---

#### C2 — `URL.revokeObjectURL` síncrono após `a.click()`
**Arquivo:** `ExportPanel.jsx:1043`

```js
a.click();
URL.revokeObjectURL(a.href); // ← revoga antes do download completar
```

O browser programa o download de forma assíncrona. Revogar a URL imediatamente pode cancelar o download em alguns browsers (Firefox em particular).

**Correção:**
```js
a.click();
setTimeout(() => URL.revokeObjectURL(a.href), 1000);
```
Mesmo padrão já deveria ser aplicado no handler DOCX (linha 1057 — mesmo problema).

---

#### C3 — `loadScript` não detecta falha em carregamentos anteriores
**Arquivo:** `ExportPanel.jsx:9–16`

```js
function loadScript(id, src) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; } // ← resolve mesmo se carregou com erro
    ...
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
```

Se o CDN falhar na primeira chamada, o elemento `<script>` é adicionado ao DOM (sem o script carregado). Na segunda chamada, `getElementById(id)` encontra o elemento e resolve imediatamente — mas `window.pdfMake` / `window.docx` são `undefined`. A exportação quebra silenciosamente com erro genérico.

**Correção:** marcar o elemento com `data-loaded` e só resolver quando esse atributo existir.

```js
function loadScript(id, src) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing?.dataset.loaded) { resolve(); return; }
    if (existing) existing.remove(); // remove falha anterior
    const s = document.createElement("script");
    s.id = id; s.src = src;
    s.onload = () => { s.dataset.loaded = "1"; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
```

---

### 🟠 Alto

---

#### A1 — Capa do DOCX não usa i18n — hardcodado em português
**Arquivo:** `ExportPanel.jsx:513–520`

```js
const metaLines = [
  config.autor   ? `Autor: ${config.autor}` : null,
  `Versão: ${config.versao}`,
  config.formato ? `Formato: ${config.formato}` : null,
  activeTemplate === "changelog" && config.projeto     ? `Projeto: ${config.projeto}` : null,
  activeTemplate === "changelog" && config.repositorio ? `Repositório: ${config.repositorio}` : null,
  ...
];
```

Todas as labels da capa do DOCX são strings literais em português. Quando o usuário troca para English, o PDF e o HTML são traduzidos, mas a capa do DOCX continua em PT. O objeto `t` (i18n) está disponível no escopo de `buildDocxBlob(config, activeTemplate, t)`.

**Correção:** usar as chaves de tradução já existentes (ex.: `t.doc_bugs_fieldAuthor`, `t.doc_changelog_fieldVersion`, etc.).

---

#### A2 — `StudyPreview` com data, locale e label hardcodados
**Arquivo:** `PreviewComponents.jsx:202–203`

```jsx
<span><strong style={{ color: "#555" }}>Data:</strong> {new Date().toLocaleDateString("pt-BR")}</span>
```

Três problemas:
1. `"Data:"` não está no i18n — nunca será traduzido para inglês.
2. `toLocaleDateString("pt-BR")` ignora o idioma selecionado pelo usuário.
3. A data exibida é *hoje*, não uma data pertencente ao documento — confunde o leitor do preview.
4. `new Date()` é chamado em cada render — cria objeto desnecessário.

O template de study não tem campo de data no `initialStudyConfig`. Ou adiciona o campo e exibe a data do usuário, ou remove essa linha do preview.

---

#### A3 — Geração de IDs por `Date.now() + Math.random()` não é confiável
**Arquivo:** `constants/initialConfigs.js:2, 9, 26, 34, 42`

```js
export const emptyTable = () => ({
  id: Date.now() + Math.random(),
  ...
});
```

`Date.now()` retorna inteiro em ms; somado com `Math.random()` (float 0–1) produz floats próximos. Quando o usuário adiciona múltiplos itens em sequência rápida (mesmo milissegundo), os IDs podem colidir ou ser confusos como chaves React.

**Correção:**
```js
id: crypto.randomUUID()
```
`crypto.randomUUID()` está disponível em todos os browsers modernos e no Node ≥ 19.

---

#### A4 — Logo armazenada como base64 no localStorage sem validação de tamanho
**Arquivo:** `UI.jsx:53–57`

```js
const handleFile = f => {
  if (!f || !f.type.startsWith("image/")) return;
  const r = new FileReader();
  r.onload = e => onChange(e.target.result, f.name); // base64 ilimitado
  r.readAsDataURL(f);
};
```

Uma imagem de 3 MB vira ~4 MB em base64. O localStorage tem limite de ~5 MB por origin. Com logo + 3 templates salvos, o limite é facilmente estourado. Quando estoura, o catch silencioso em `useLocalStorageState.js:22` descarta a escrita — o usuário perde dados sem aviso.

**Correção:** validar tamanho antes de ler:
```js
const handleFile = f => {
  if (!f || !f.type.startsWith("image/")) return;
  if (f.size > 512 * 1024) { alert("Imagem muito grande (máx 512 KB)"); return; }
  ...
};
```

---

#### A5 — Sem React Error Boundary
**Arquivo:** geral

Nenhum `ErrorBoundary` envolve o app. Qualquer erro de runtime em um componente (ex.: config corrompida no localStorage, resposta inesperada do CDN) derruba a tela inteira sem mensagem ao usuário. Especialmente crítico porque o localStorage pode guardar dados de versões antigas do schema.

---

### 🟡 Médio

---

#### M1 — `key={i}` em listas reordenáveis nos componentes de Preview
**Arquivo:** `PreviewComponents.jsx:94, 115, 147, 231, 255` e outros

```jsx
{config.problemas.map((p, i) => (
  <tr key={i} ...>   // ← index como key
```

Itens têm `id` único (`p.id`, `ts.id`, etc.) que já é usado corretamente em `DragList`. No preview, o index como key faz React reutilizar DOM incorretamente ao reordenar itens.

**Correção:** `<tr key={p.id}>`, `<div key={ts.id}>`, etc.

---

#### M2 — Manipulação direta de estilo DOM para hover — bypassa React
**Arquivo:** `App.jsx:281–282`

```jsx
onMouseEnter={e => e.currentTarget.style.borderColor = tmpl.accent}
onMouseLeave={e => e.currentTarget.style.borderColor = `${tmpl.accent}50`}
```

`style` é modificado diretamente no DOM enquanto React gerencia o mesmo elemento. Pode causar inconsistências em re-renders. Usar CSS `:hover` ou estado controlado.

---

#### M3 — Parâmetro `h` shadowing da função `h()` nos builders de PDF
**Arquivo:** `ExportPanel.jsx:147, 95`

```js
function h(c) { return c?.startsWith("#") ? c : `#${c}`; } // helper de cor

// Mais abaixo, dentro de bugsPdf():
tb.cabecalhos.map(h => ({ text: h, style: "th" })) // h aqui é o header item
```

`h` como parâmetro do callback esconde a função `h()` do escopo exterior. Não causa bug hoje porque `h()` não é chamada dentro desse callback, mas é uma armadilha. Renomear para `col` ou `header`.

---

#### M4 — Abordagem inconsistente para prefixo `#` nas cores
**Arquivo:** `exportUtils.js` vs `ExportPanel.jsx`

Em `exportUtils.js`:
```js
const primary = `#${config.cores.primaria}`; // sempre adiciona #
```

Em `ExportPanel.jsx`:
```js
function h(c) { return c?.startsWith("#") ? c : `#${c}`; } // defensivo
const primary = h(config.cores.primaria);
```

As cores são armazenadas sem `#` (confirmado em `initialConfigs.js` e `ColorField`). Ambas as abordagens funcionam, mas são inconsistentes — dificulta manutenção.

---

#### M5 — `document.write` para popup HTML
**Arquivo:** `ExportPanel.jsx:1049`

```js
const w = window.open("", "_blank");
w.document.write(getHtml());
w.document.close();
```

`document.write` é deprecated no HTML5. Em contextos de popup pode ter comportamento inconsistente entre browsers. Alternativa robusta:

```js
const w = window.open("", "_blank");
const blob = new Blob([getHtml()], { type: "text/html;charset=utf-8" });
const url = URL.createObjectURL(blob);
w.location.href = url;
setTimeout(() => URL.revokeObjectURL(url), 5000);
```

---

#### M6 — CSS global em string dentro de componente React
**Arquivo:** `App.jsx:34–140`

```jsx
const CSS = `...`; // 140 linhas de CSS global como string

export default function App() {
  return (
    <div className="app-shell">
      <style>{CSS}</style>
      ...
    </div>
  );
}
```

Problemas:
- CSS re-parseado pelo browser em cada re-render de `App`
- Sem scoping — classes globais podem colidir
- Sem lint CSS (typos passam sem erro)
- Nome de classe `.div` (linha 84) é confuso por conflito visual com o elemento `<div>`

Mover para `App.css` importado no topo.

---

### 🔵 Baixo

---

#### B1 — Falta optional chaining em accessos a arrays em `exportUtils.js`
**Arquivo:** `exportUtils.js:117, 175, 247, 317, 387, 423`

```js
// linha 117 — sem ?.
config.resumoExecutivo.some(v => v.trim())

// linha 317
config.mudancas.forEach(m => { ... })
```

Enquanto os `initialConfigs` garantem esses arrays, dados importados via JSON (modal de import) podem não ter todos os campos. A ausência de optional chaining pode causar `TypeError: Cannot read properties of undefined`.

**Correção:** `config.resumoExecutivo?.some(...)`, `config.mudancas?.forEach(...)`.

---

#### B2 — Sem ARIA em botões icon-only
**Arquivo:** `UI.jsx:19, 74`, `App.jsx:307–311`, e outros

```jsx
<button className="btn-icon" title="Remover">
  <Bi name="trash3" size={13} />
</button>
```

`title` ajuda no hover mas não é anunciado por screen readers. Usar `aria-label`:
```jsx
<button className="btn-icon" aria-label="Remover item">
```

---

#### B3 — Drag-and-drop sem suporte a teclado
**Arquivo:** `UI.jsx:96–151`

A implementação usa apenas eventos `drag*` do HTML5. Usuários de teclado não conseguem reordenar itens. Nenhuma alternativa de acessibilidade (botões de mover para cima/baixo).

---

#### B4 — `useLocalStorageState` não valida schema ao carregar
**Arquivo:** `hooks/useLocalStorageState.js:4–8`

```js
const stored = localStorage.getItem(key);
return stored ? JSON.parse(stored) : initialValue;
```

Se um deploy muda a estrutura do config (ex.: adiciona campo obrigatório), o objeto no localStorage da sessão anterior não tem esse campo. Componentes que acessam `config.novocampo.algo` vão crashar. Sem `ErrorBoundary` (ver A5), o app para de funcionar.

Adicionar um merge defensivo: `return stored ? { ...initialValue, ...JSON.parse(stored) } : initialValue`.

---

#### B5 — Sem testes automatizados
**Arquivo:** `package.json`

O projeto tem ESLint mas nenhum teste (unitário, integração, ou e2e). As lógicas de export (PDF/DOCX/HTML) e de import/merge de JSON são especialmente críticas e seriam beneficiadas por testes unitários.

---

---

## Legibilidade e Componentização

### Visão geral por arquivo

| Arquivo | Linhas | Avaliação |
|---------|--------|-----------|
| `ExportPanel.jsx` | 1121 | ❌ Monolítico — 5 responsabilidades distintas |
| `exportUtils.js` | 438 | ⚠️ Duplica toda a lógica visual dos Previews |
| `PreviewComponents.jsx` | 455 | ⚠️ 3 componentes com header/footer idênticos |
| `Editors.jsx` | 354 | ⚠️ Seção Info e Cores repetida 3 vezes |
| `App.jsx` | 411 | ⚠️ CSS + hooks + 3 modais inline + orquestração |
| `BugsComponents.jsx` | 108 | ✅ Bem delimitado |
| `ChangelogComponents.jsx` | 125 | ✅ Bem delimitado |
| `StudyComponents.jsx` | 52 | ✅ Bem delimitado |
| `UI.jsx` | 171 | ✅ Primitivos reutilizáveis bem isolados |

---

### L1 — `ExportPanel.jsx` tem 5 responsabilidades em 1121 linhas

O arquivo mistura sem separação:

```
ExportPanel.jsx
├── loadScript / getPdfMake / getDocx     → carregamento CDN
├── logoToDataUrl                          → conversão de imagem
├── pdfStyles / rule                       → estilos PDF compartilhados
├── bugsPdf / changelogPdf / studyPdf      → builders PDF por template
├── hexToDocxColor / makeDocxBorder*       → helpers DOCX
├── buildDocxBlob (≈685 linhas)            → builder DOCX para 3 templates
└── ExportPanel (componente React)         → UI de exportação
```

`buildDocxBlob` sozinho contém três blocos `if (activeTemplate === "bugs")` / `"changelog"` / `"study"` de ~200 linhas cada. Para encontrar onde está o header do DOCX do changelog, é preciso navegar centenas de linhas.

**Estrutura recomendada:**
```
utils/
├── exportUtils.js          (HTML — já existe)
├── pdfBuilders.js          (bugsPdf, changelogPdf, studyPdf, pdfStyles)
└── docxBuilders/
    ├── docxHelpers.js      (hexToDocxColor, makeDocxBorder*, paragraphs factory)
    ├── bugsDocx.js
    ├── changelogDocx.js
    └── studyDocx.js
```

---

### L2 — Preview e Export HTML são duas implementações paralelas do mesmo documento

`PreviewComponents.jsx` e `exportUtils.js` renderizam a mesma estrutura visual — um em JSX, o outro em template literals. Toda mudança de layout precisa ser feita em dois lugares.

**Exemplo — cabeçalho do documento Bugs:**

Em `PreviewComponents.jsx:52–62` (JSX):
```jsx
<div style={{ fontSize: 30, fontWeight: 900, color: primary, ... }}>
  {config.titulo || "Título do Relatório"}
</div>
```

Em `exportUtils.js:108` (string):
```js
`<div style="font-size:30px;font-weight:900;color:${primary}...">
  ${esc(config.titulo) || "Título do Relatório"}
</div>`
```

Mesmos valores, dois arquivos. Qualquer diferença entre preview e exportado é um bug que ninguém percebe imediatamente.

**Solução:** usar `renderToStaticMarkup` do React para gerar o HTML de exportação a partir dos próprios componentes de Preview:

```js
import { renderToStaticMarkup } from "react-dom/server";
import { BugsPreview } from "../components/PreviewComponents";

export function buildBugsHtml(config, t) {
  const body = renderToStaticMarkup(<BugsPreview config={config} />);
  return `<!DOCTYPE html><html>...<body>${PRINT_BAR(...)}${body}</body></html>`;
}
```

Isso elimina `exportUtils.js` inteiramente e garante que preview e exportado são sempre idênticos.

---

### L3 — Cabeçalho de card accordion duplicado 4 vezes

`BugProblemCard`, `BugTestCard`, `StudyTopicCard` e `ChangeCard` têm estrutura de header idêntica:

```jsx
// Repetido em cada card:
<div onClick={() => setOpen(o => !o)} style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 22px", cursor:"pointer", ... }}>
  {dragHandleProps && (
    <div {...dragHandleProps} onClick={e => e.stopPropagation()} style={{ cursor:"grab", ... }}>
      <Bi name="grip-vertical" size={16} />
    </div>
  )}
  {/* badge colorido */}
  {/* título com ellipsis */}
  <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon" ...>
    <Bi name="trash3" size={13} />
  </button>
  <Bi name={open ? "chevron-up" : "chevron-down"} size={14} />
</div>
```

Um `AccordionCard` extraído eliminaria ~20 linhas de repetição em cada card:

```jsx
// UI.jsx
export function AccordionCard({ open, onToggle, onRemove, dragHandleProps, accentColor, badge, title, children }) {
  return (
    <div className="card anim" style={{ border: `1px solid ${open ? accentColor + "90" : "var(--b2)"}`, overflow: "hidden" }}>
      <div onClick={onToggle} style={{ /* header styles */ }}>
        {dragHandleProps && <DragHandle {...dragHandleProps} />}
        {badge}
        <span className="card-title">{title}</span>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} className="btn-icon"><Bi name="trash3" size={13} /></button>
        <Bi name={open ? "chevron-up" : "chevron-down"} size={14} />
      </div>
      {open && <div className="anim" style={{ padding: "24px 24px 28px", borderTop: "1px solid var(--b1)" }}>{children}</div>}
    </div>
  );
}
```

---

### L4 — Seção Info + Cores repetida nos 3 Editors

`StudyEditor`, `BugsEditor` e `ChangelogEditor` em `Editors.jsx` repetem a mesma estrutura:

```
formato + versão (grid 2 colunas)
título
subtítulo
autor
LogoField
--- separador ---
ColorField para cada cor
```

`BugsEditor` e `StudyEditor` têm essa seção idêntica (~30 linhas). `ChangelogEditor` tem campos extras (projeto, repositório, datas) mas o miolo é o mesmo.

**Componente extraível:**
```jsx
function EditorInfoSection({ config, upd, updLogo, extraFields }) {
  return (
    <div className="card" style={{ padding: 30 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
        <FormatSelect ... />
        <VersionInput ... />
      </div>
      <TitleInput ... />
      <SubtitleInput ... />
      <AuthorInput ... />
      {extraFields}
      <LogoField ... />
    </div>
  );
}
```

---

### L5 — Inline styles em vez de classes CSS criam linhas de 200+ caracteres

O JSX do projeto é predominantemente `style={{...}}` em cada elemento. Resultado: JSX estruturalmente ilegível.

**Exemplo real de `PreviewComponents.jsx:119–123`:**
```jsx
<div key={i} style={{ marginBottom: 40, borderLeft: `4px solid ${c}`, paddingLeft: 20 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
    <div style={{ width: 28, height: 28, borderRadius: 7, background: c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "monospace" }}>{i + 1}</span>
    </div>
```

Com classes (as variantes dinâmicas ficam como style inline apenas onde necessário):
```jsx
<div key={p.id} className="problem-item" style={{ borderLeftColor: c }}>
  <div className="problem-item__header">
    <div className="problem-item__badge" style={{ background: c }}>
      <span className="problem-item__num">{i + 1}</span>
    </div>
```

A estrutura do JSX fica legível; apenas as 2 propriedades que dependem de variável permanecem inline.

O projeto já tem CSS tokens (`--tx`, `--bg2`, etc.) mas eles raramente chegam até os components — a maioria dos valores hardcodados (`"#1a1a2e"`, `"#333"`, `"#999"`) são os mesmos tokens só que escritos em hex. Isso significa que trocar o tema escuro exigiria varrer todos os arquivos.

---

### L6 — `App.jsx` contém lógica e markup que pertencem a componentes próprios

Três coisas em `App.jsx` que deveriam ser extraídas:

**1. `useBootstrapIcons` — mover para `hooks/useBootstrapIcons.js`**
```js
// App.jsx:23–32 — hook de efeito colateral sem relação com o componente App
function useBootstrapIcons() { ... }
```

**2. Confirm modal inline — extrair para `ConfirmModal`**
```jsx
{/* App.jsx:228–252 — 25 linhas de JSX para confirm dialog */}
{showClearConfirm && (
  <div className="json-modal-backdrop" onClick={() => setShowClearConfirm(false)}>
    <div className="json-modal" style={{ maxWidth: 420 }} ...>
      ...
    </div>
  </div>
)}
```
Esse padrão já existe em `JsonImportModal.jsx` e `TemplateSelector.jsx`. Um `ConfirmModal` genérico poderia substituir os três.

**3. Browser chrome do preview — extrair para `BrowserFrame`**
```jsx
{/* App.jsx:359–376 — fake browser com bolinhas coloridas */}
<div style={{ borderRadius: 18, overflow: "hidden", boxShadow: "..." }}>
  <div style={{ background: "var(--s2)", padding: "13px 20px", ... }}>
    <div style={{ display: "flex", gap: 7 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map(c => (...))}
    </div>
    ...
  </div>
  <div style={{ background: "#fff" }}>
    <PreviewComponent config={config} />
  </div>
</div>
```

---

### L7 — Naming: `t` como variável polissêmica

`t` é usado para três coisas distintas no projeto:

| Local | Significado de `t` |
|-------|--------------------|
| `App.jsx:144` | objeto i18n (`useLang()`) |
| `App.jsx:189` | string de template (`"bugs"/"study"/"changelog"`) — bug C1 |
| `ChangelogComponents.jsx:23` | objeto de tipo de mudança (`CHANGE_TYPES[change.tipo]`) |
| `exportUtils.js:23` (callback) | objeto de tabela (item do `tabelas.map(t => ...)`) |

`ChangelogComponents.jsx` já resolveu corretamente renomeando para `i18n`:
```js
const { t: i18n } = useLang();
const t = CHANGE_TYPES[change.tipo] || CHANGE_TYPES.feat; // t = tipo
```
O mesmo padrão deveria ser adotado em todos os arquivos — usar `lang` ou `i18n` para o objeto de traduções, liberando `t` como variável local quando necessário.

---

### L8 — `buildDocxBlob` tem helpers de parágrafo redefinidos a cada chamada

Dentro de `buildDocxBlob` (~linha 352–411), factories como `Br`, `MetaLine`, `SectionTitle`, `BodyText`, `CodeBlock` são definidas como funções locais:

```js
async function buildDocxBlob(config, activeTemplate, t) {
  const docx = await getDocx();
  ...
  const Br = () => new Paragraph({ ... });
  const MetaLine = (text) => new Paragraph({ ... });
  const SectionTitle = (text, colorHex) => new Paragraph({ ... });
  // etc.
```

Essas factories são recriadas a cada chamada de `buildDocxBlob`. Como são funções puras que só dependem de `docx` (que é o `window.docx` após carregamento), elas poderiam ser fábricas parametrizadas em módulo separado — tornando-as testáveis e reutilizáveis.

---

### Relocabilidade — Resumo

| Componente/Módulo | Relocável? | Acoplamento |
|-------------------|------------|-------------|
| `UI.jsx` (todos) | ✅ Sim | `LangContext`, `Bi` — mínimo |
| `*Components.jsx` (cards) | ✅ Sim | `constants/templates`, `UI`, `LangContext` |
| `hooks/*` | ✅ Sim | Nenhum |
| `PreviewComponents.jsx` | ⚠️ Parcial | Config shape, `LangContext`, `constants/templates` |
| `Editors.jsx` | ⚠️ Parcial | Config shape, todas as constantes, todos os cards |
| `ExportPanel.jsx` | ❌ Não | Config shape, `exportUtils`, CDN, `templates`, `LangContext` |
| `exportUtils.js` | ❌ Não | Duplica Preview — mudanças precisam ser espelhadas |
| `App.jsx` | ❌ Não | Orquestra tudo; CSS global acoplado a ele |

O **principal bloqueio de relocabilidade** é o CSS em `App.jsx`. Qualquer componente que usa `.card`, `.btn-primary`, `.inp`, `.lbl` depende implicitamente de `App` estar montado. Um componente extraído para uso em outro contexto (storybook, testes) não renderiza corretamente sem a `<style>` injetada por `App`.

---

## Resumo Geral

| Categoria | Qtd | Impacto principal |
|-----------|-----|------------------|
| 🔴 Crítico | 3 | Bugs silenciosos, falhas de download |
| 🟠 Alto    | 5 | i18n incompleto, perda de dados, IDs duplicados |
| 🟡 Médio   | 6 | Comportamento inesperado, manutenibilidade |
| 🔵 Baixo   | 5 | Acessibilidade, robustez, qualidade de código |
| 📐 Estrutura | 8 | Duplicação, acoplamento, legibilidade |

**Prioridade de correção recomendada:**

1. **Bugs imediatos:** C1 → C2 → C3
2. **Integridade de dados:** A3 (IDs) → A4 (logo size) → B4 (schema merge)
3. **i18n completo:** A1 → A2
4. **Resiliência:** A5 (ErrorBoundary)
5. **Estrutura (maior ROI):** L1 (split ExportPanel) → L2 (unificar Preview+HTML) → L5 (CSS para arquivo) → L3 (AccordionCard)
