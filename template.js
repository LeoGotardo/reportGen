/**
 * ============================================================
 *  GERADOR DE RELATÓRIO TÉCNICO
 * ============================================================
 *
 *  COMO USAR:
 *  1. Edite o arquivo config.json com os dados do seu relatório
 *  2. Execute: node template.js
 *  3. O arquivo será salvo como: relatorio.docx
 *
 *  Formatos suportados:
 *    ABNT  — A4 (210x297mm), margens sup/esq 3cm, inf/dir 2cm, corpo 12pt, espaço 1,5
 *    CARTA — US Letter (8,5x11"), margens 1" em todos os lados
 * ============================================================
 */

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, PageBreak, Header, Footer
} = require('docx');
const fs   = require('fs');
const path = require('path');

// ── Leitura do config.json ────────────────────────────────────────────────────

const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(configPath)) {
  console.error('❌ Arquivo config.json não encontrado na mesma pasta que template.js');
  process.exit(1);
}

let CONFIG;
try {
  CONFIG = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  console.error('❌ Erro ao ler config.json — verifique se o JSON é válido:', e.message);
  process.exit(1);
}

// ── Data automática ───────────────────────────────────────────────────────────

CONFIG.data = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  .replace(/^\w/, c => c.toUpperCase());

// ── Configuração de página por formato ───────────────────────────────────────
// DXA: 1 polegada = 1440 | 1 cm = 567

const FORMATOS = {
  ABNT: {
    pageWidth:    11906,  // 210mm
    pageHeight:   16838,  // 297mm
    marginTop:    1701,   // 3cm (margem superior)
    marginBottom: 1134,   // 2cm (margem inferior)
    marginLeft:   1701,   // 3cm (margem esquerda — encadernação)
    marginRight:  1134,   // 2cm (margem direita)
    contentWidth: 9071,   // 11906 - 1701 - 1134
    fontSize:     24,     // 12pt (ABNT NBR 14724)
    lineSpacing:  480,    // 1,5 linhas (ABNT NBR 14724)
  },
  CARTA: {
    pageWidth:    12240,  // 8,5"
    pageHeight:   15840,  // 11"
    marginTop:    1440,   // 1"
    marginBottom: 1440,
    marginLeft:   1440,
    marginRight:  1440,
    contentWidth: 9360,
    fontSize:     22,     // 11pt
    lineSpacing:  276,    // simples
  }
};

const formato = (CONFIG.formato || 'ABNT').toUpperCase();

if (!FORMATOS[formato]) {
  console.error(`❌ Formato "${CONFIG.formato}" inválido. Use "ABNT" ou "CARTA".`);
  process.exit(1);
}

const FMT = FORMATOS[formato];
const C   = CONFIG.cores;

console.log(`📄 Formato: ${formato} | Corpo: ${FMT.fontSize / 2}pt | Espaçamento: ${FMT.lineSpacing === 480 ? '1,5' : 'simples'}`);

// ── Helpers de borda ─────────────────────────────────────────────────────────

const mkBorder  = (color = 'CCCCCC') => ({ style: BorderStyle.SINGLE, size: 1, color });
const mkBorders = (color = 'CCCCCC') => ({
  top: mkBorder(color), bottom: mkBorder(color),
  left: mkBorder(color), right: mkBorder(color),
});

function severityColor(sev) {
  if (sev === 'ALTA')  return { text: C.altaSev,  fill: 'FDECEA' };
  if (sev === 'MÉDIA') return { text: C.mediaSev, fill: 'FEF3EC' };
  return                      { text: C.baixaSev, fill: 'EFF7EF' };
}

// ── Elementos de conteúdo ─────────────────────────────────────────────────────

function spacer(before = 120) {
  return new Paragraph({ spacing: { before, after: 0 }, children: [new TextRun('')] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160, line: FMT.lineSpacing },
    children: [new TextRun({ text, font: 'Arial', size: 32, bold: true, color: C.primaria })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120, line: FMT.lineSpacing },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.secundaria, space: 4 } },
    children: [new TextRun({ text, font: 'Arial', size: 26, bold: true, color: C.secundaria })]
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80, line: FMT.lineSpacing },
    children: [new TextRun({ text, font: 'Arial', size: 23, bold: true, color: '333333' })]
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 120, line: FMT.lineSpacing },
    children: [new TextRun({ text, font: 'Arial', size: FMT.fontSize, color: '222222', ...opts })]
  });
}

function codeLines(lines) {
  return lines.map(line =>
    new Paragraph({
      spacing: { before: 0, after: 0 },
      shading: { fill: C.codeBg, type: ShadingType.CLEAR },
      indent: { left: 360, right: 360 },
      children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18, color: C.codeText })]
    })
  );
}

function codeBlock(lines) {
  return [
    new Paragraph({
      spacing: { before: 80, after: 0 },
      shading: { fill: C.codeBg, type: ShadingType.CLEAR },
      indent: { left: 360 },
      children: [new TextRun({ text: ' ', font: 'Courier New', size: 10, color: C.codeBg })]
    }),
    ...codeLines(lines),
    new Paragraph({
      spacing: { before: 0, after: 120 },
      shading: { fill: C.codeBg, type: ShadingType.CLEAR },
      indent: { left: 360 },
      children: [new TextRun({ text: ' ', font: 'Courier New', size: 10, color: C.codeBg })]
    }),
  ];
}

function severityBadge(level) {
  const { text: textColor, fill } = severityColor(level);
  return new Table({
    width: { size: 1800, type: WidthType.DXA },
    columnWidths: [1800],
    rows: [new TableRow({
      children: [new TableCell({
        borders: mkBorders(textColor),
        shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: `SEVERIDADE ${level}`, font: 'Arial', size: 18, bold: true, color: textColor })]
        })]
      })]
    })]
  });
}

// ── Tabela de resumo ──────────────────────────────────────────────────────────

function buildSummaryTable(problemas) {
  const w      = FMT.contentWidth;
  const colProb = Math.round(w * 0.34);
  const colSev  = Math.round(w * 0.13);
  const colRes  = w - colProb - colSev;

  const cellHeader = (text, width) => new TableCell({
    borders: mkBorders(),
    shading: { fill: C.primaria, type: ShadingType.CLEAR },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })]
    })]
  });

  const dataRows = problemas.map(prob => {
    const { text: sevColor, fill: sevFill } = severityColor(prob.severity);
    return new TableRow({
      children: [
        new TableCell({
          borders: mkBorders(), margins: { top: 80, bottom: 80, left: 140, right: 140 },
          width: { size: colProb, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: prob.titulo, font: 'Arial', size: 20, bold: true, color: '222222' })] })]
        }),
        new TableCell({
          borders: mkBorders(sevColor), shading: { fill: sevFill, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 140, right: 140 },
          width: { size: colSev, type: WidthType.DXA },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: prob.severity, font: 'Arial', size: 20, bold: true, color: sevColor })] })]
        }),
        new TableCell({
          borders: mkBorders(), margins: { top: 80, bottom: 80, left: 140, right: 140 },
          width: { size: colRes, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: prob.resolucao, font: 'Arial', size: 20, color: '333333' })] })]
        }),
      ]
    });
  });

  return new Table({
    width: { size: w, type: WidthType.DXA },
    columnWidths: [colProb, colSev, colRes],
    rows: [
      new TableRow({ tableHeader: true, children: [cellHeader('Problema', colProb), cellHeader('Severidade', colSev), cellHeader('Resolução', colRes)] }),
      ...dataRows
    ]
  });
}

// ── Seção detalhada de cada problema ─────────────────────────────────────────

function buildProblemSection(prob) {
  const d = prob.detalhe;
  return [
    spacer(80),
    severityBadge(prob.severity),
    spacer(120),
    h2(`${prob.id}. ${prob.titulo}`),
    h3('Onde ocorre'),
    ...d.ondeOcorre.map(t => p(t)),
    ...(d.codigoOnde?.length ? codeBlock(d.codigoOnde) : []),
    spacer(80),
    h3('Por que é um problema'),
    ...d.porqueProblema.map(t => p(t)),
    spacer(80),
    h3('Resolução proposta'),
    ...d.textoResolucao.map(t => p(t)),
    ...(d.codigoResolucao?.length ? codeBlock(d.codigoResolucao) : []),
    spacer(200),
  ];
}

// ── Header e Footer ───────────────────────────────────────────────────────────

function buildHeader() {
  return new Header({
    children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.primaria, space: 6 } },
      tabStops: [{ type: 'right', position: FMT.contentWidth }],
      children: [
        new TextRun({ text: CONFIG.titulo, font: 'Arial', size: 20, bold: true, color: C.primaria }),
        new TextRun({ text: '\t' }),
        new TextRun({ text: CONFIG.data, font: 'Arial', size: 20, color: '888888' }),
      ],
    })]
  });
}

function buildFooter() {
  return new Footer({
    children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 4 } },
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `${CONFIG.titulo} — v${CONFIG.versao}   Página `, font: 'Arial', size: 18, color: '888888' }),
        new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: '888888' }),
      ]
    })]
  });
}

// ── Montagem do documento ─────────────────────────────────────────────────────

function buildDoc() {
  const altaProbs  = CONFIG.problemas.filter(p => p.severity === 'ALTA');
  const mediaProbs = CONFIG.problemas.filter(p => p.severity === 'MÉDIA');
  const baixaProbs = CONFIG.problemas.filter(p => p.severity === 'BAIXA');

  const children = [

    // CAPA
    new Paragraph({
      spacing: { before: 2400, after: 160 },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: CONFIG.titulo.toUpperCase(), font: 'Arial', size: 56, bold: true, color: C.primaria })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.secundaria, space: 8 } },
      children: [new TextRun({ text: CONFIG.subtitulo, font: 'Arial', size: 28, color: C.secundaria })]
    }),
    spacer(300),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: CONFIG.data, font: 'Arial', size: FMT.fontSize, color: '888888', italics: true })]
    }),
    spacer(120),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${CONFIG.autor}   ·   v${CONFIG.versao}`, font: 'Arial', size: FMT.fontSize, color: '888888' })]
    }),
    spacer(800),
    pageBreak(),

    // 1. RESUMO EXECUTIVO
    h1('1. Resumo Executivo'),
    ...CONFIG.resumoExecutivo.map(t => p(t)),
    spacer(200),

    // 2. TABELA DE PROBLEMAS
    h1('2. Tabela de Problemas'),
    p('A tabela abaixo consolida todos os problemas identificados, sua severidade e a ação de resolução proposta.'),
    spacer(120),
    buildSummaryTable(CONFIG.problemas),
    spacer(200),
    pageBreak(),

    // 3. DETALHAMENTO
    h1('3. Detalhamento dos Problemas'),
  ];

  if (altaProbs.length) {
    children.push(h2('3.1 — Alta Severidade'));
    altaProbs.forEach(prob => children.push(...buildProblemSection(prob)));
  }
  if (mediaProbs.length) {
    children.push(pageBreak(), h2('3.2 — Média Severidade'));
    mediaProbs.forEach(prob => children.push(...buildProblemSection(prob)));
  }
  if (baixaProbs.length) {
    children.push(pageBreak(), h2('3.3 — Baixa Severidade'));
    baixaProbs.forEach(prob => children.push(...buildProblemSection(prob)));
  }

  // 4. CONCLUSÃO
  children.push(
    pageBreak(),
    h1('4. Conclusão'),
    ...CONFIG.conclusao.map(t => p(t)),
    spacer(300),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC', space: 8 } },
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${CONFIG.titulo} — ${CONFIG.data}`, font: 'Arial', size: 18, color: 'AAAAAA', italics: true })]
    })
  );

  return new Document({
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }]
    },
    styles: {
      default: { document: { run: { font: 'Arial', size: FMT.fontSize } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: C.primaria },
          paragraph: { spacing: { before: 320, after: 160, line: FMT.lineSpacing }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial', color: C.secundaria },
          paragraph: { spacing: { before: 280, after: 120, line: FMT.lineSpacing }, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 23, bold: true, font: 'Arial', color: '333333' },
          paragraph: { spacing: { before: 180, after: 80, line: FMT.lineSpacing }, outlineLevel: 2 } },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: FMT.pageWidth, height: FMT.pageHeight },
          margin: { top: FMT.marginTop, bottom: FMT.marginBottom, left: FMT.marginLeft, right: FMT.marginRight }
        }
      },
      headers: { default: buildHeader() },
      footers: { default: buildFooter() },
      children
    }]
  });
}

// ── Execução ──────────────────────────────────────────────────────────────────

Packer.toBuffer(buildDoc()).then(buffer => {
  const outputPath = path.join(__dirname, 'relatorio.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Relatório gerado: ${outputPath}`);
}).catch(err => {
  console.error('❌ Erro ao gerar o relatório:', err);
});
