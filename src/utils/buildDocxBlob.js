import { CHANGE_TYPES } from "../constants/templates";
import { getDocx } from "./cdnLoaders";
import { formatDate } from "./date";
import { normalizeResult, suiteCounts, SUITE_RESULT_COLORS } from "./testSuite";

function hexToDocxColor(hex) {
  return (hex || "000000").replace("#", "").toUpperCase().padStart(6, "0");
}

function makeDocxBorder(color = "CCCCCC") {
  const c = hexToDocxColor(color);
  return { style: "single", size: 1, color: c };
}

function makeDocxTableBorders(color = "CCCCCC") {
  const b = makeDocxBorder(color);
  return { top: b, bottom: b, left: b, right: b, insideHorizontal: b, insideVertical: b };
}

export async function buildDocxBlob(config, activeTemplate, t) {
  const docx = await getDocx();
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    VerticalAlign, PageNumber, Header, Footer, PageBreak,
    LevelFormat, TabStopType, TabStopPosition,
  } = docx;

  const isLetter  = config.formato === "CARTA";
  const pageW     = isLetter ? 12240 : 11906;
  const marginLR  = 1134;
  const marginTB  = 1134;
  const contentW  = pageW - marginLR * 2;

  const primary   = hexToDocxColor(config.cores.primaria);
  const secondary = hexToDocxColor(config.cores.secundaria);

  const numberingConfig = {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 560, hanging: 280 } } },
        }],
      },
    ],
  };

  const Br = () => new Paragraph({ children: [new TextRun({ text: "" })] });

  const MetaLine = (text) => new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 18, color: "888888", font: "Arial" })],
  });

  const SectionTitle = (text, colorHex = primary) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: colorHex, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 26, color: colorHex, font: "Arial" })],
  });

  const SubTitle = (text, colorHex = primary) => new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, color: colorHex, font: "Arial" })],
  });

  const FieldLabel = (text) => new Paragraph({
    spacing: { before: 140, after: 40 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 16, color: "999999", font: "Arial" })],
  });

  const BodyText = (text) => new Paragraph({
    spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: String(text || ""), size: 22, font: "Arial", color: "333333" })],
  });

  const CodeBlock = (text) => new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { fill: hexToDocxColor(config.cores.codeBg || "1E1E1E"), type: ShadingType.CLEAR },
    indent: { left: 200, right: 200 },
    children: [new TextRun({
      text: String(text || ""),
      font: "Courier New", size: 18,
      color: hexToDocxColor(config.cores.codeText || "D4D4D4"),
    })],
  });

  const BulletItem = (text) => new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 0, after: 60 },
    children: [new TextRun({ text: String(text || ""), size: 22, font: "Arial", color: "333333" })],
  });

  const SeverityBadge = (sev) => {
    const colors = {
      ALTA:  hexToDocxColor(config.cores.altaSev  || "C00000"),
      MÉDIA: hexToDocxColor(config.cores.mediaSev || "C55A11"),
      BAIXA: hexToDocxColor(config.cores.baixaSev || "375623"),
    };
    const c = colors[sev] || colors.ALTA;
    return new Paragraph({
      spacing: { before: 40, after: 80 },
      children: [new TextRun({ text: `  ${sev}  `, bold: true, size: 18, color: c, font: "Arial" })],
    });
  };

  const cellBorder = makeDocxTableBorders("DDDDDD");

  const HeaderCell = (text, widthDxa, colorHex = primary) => new TableCell({
    borders: cellBorder,
    shading: { fill: colorHex, type: ShadingType.CLEAR },
    width: { size: widthDxa, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text, bold: true, size: 18, color: "FFFFFF", font: "Arial" })],
    })],
  });

  const DataCell = (text, widthDxa, opts = {}) => new TableCell({
    borders: cellBorder,
    shading: { fill: opts.fill || "FFFFFF", type: ShadingType.CLEAR },
    width: { size: widthDxa, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      // \n dentro de um TextRun não quebra linha no Word: um run por linha com break.
      children: String(text || "—").split(/\r?\n/).map((line, li) => new TextRun({
        text: line,
        break: li > 0 ? 1 : undefined,
        size: opts.size || 20,
        font: opts.mono ? "Courier New" : "Arial",
        bold: opts.bold || false,
        color: opts.color || "333333",
      })),
    })],
  });

  const docHeader = new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: primary, space: 4 } },
        spacing: { after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: config.titulo || "Relatório", bold: true, size: 18, color: primary, font: "Arial" }),
          new TextRun({ text: `\tv${config.versao}`, size: 16, color: "AAAAAA", font: "Arial" }),
        ],
      }),
    ],
  });

  const docFooter = new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } },
        spacing: { before: 80 },
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
        children: [
          new TextRun({ text: config.autor || "", size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ text: `\t${t.doc_docx_page} `, size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ text: t.doc_docx_of, size: 16, color: "AAAAAA", font: "Arial" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "AAAAAA", font: "Arial" }),
        ],
      }),
    ],
  });

  const coverChildren = [];

  for (let i = 0; i < 6; i++) coverChildren.push(Br());

  const templateLabels = { bugs: t.doc_cover_bugs, study: t.doc_cover_study, changelog: t.doc_cover_changelog };
  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 160 },
    children: [new TextRun({ text: templateLabels[activeTemplate] || "RELATÓRIO TÉCNICO", size: 16, color: "AAAAAA", bold: true, font: "Arial" })],
  }));

  coverChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: primary, space: 8 } },
    children: [new TextRun({ text: config.titulo || "Relatório", size: 52, bold: true, color: primary, font: "Arial" })],
  }));

  if (config.subtitulo) {
    coverChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 120 },
      children: [new TextRun({ text: config.subtitulo, size: 28, color: secondary, font: "Arial" })],
    }));
  }

  for (let i = 0; i < 4; i++) coverChildren.push(Br());

  const metaLines = [
    config.autor    ? `${t.doc_bugs_fieldAuthor}: ${config.autor}` : null,
    `${t.doc_bugs_fieldVersion}: ${config.versao}`,
    formatDate(config.data) ? `${t.doc_common_date}: ${formatDate(config.data)}` : null,
    config.formato  ? `${t.doc_bugs_fieldFormat}: ${config.formato}` : null,
    activeTemplate === "changelog" && config.projeto     ? `${t.doc_changelog_fieldProject}: ${config.projeto}` : null,
    activeTemplate === "changelog" && config.repositorio ? `${t.doc_changelog_fieldRepo}: ${config.repositorio}` : null,
    activeTemplate === "changelog" && config.dataInicio  ? `${t.doc_changelog_fieldPeriod}: ${formatDate(config.dataInicio) || config.dataInicio}${config.dataFim ? ` → ${formatDate(config.dataFim) || config.dataFim}` : ""}` : null,
  ].filter(Boolean);

  metaLines.forEach(line => {
    coverChildren.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: line, size: 20, color: "555555", font: "Arial" })],
    }));
  });

  coverChildren.push(new Paragraph({ children: [new PageBreak()] }));

  const contentChildren = [];

  if (activeTemplate === "bugs") {
    const sevColors = {
      ALTA:  hexToDocxColor(config.cores.altaSev  || "C00000"),
      MÉDIA: hexToDocxColor(config.cores.mediaSev || "C55A11"),
      BAIXA: hexToDocxColor(config.cores.baixaSev || "375623"),
    };

    if (config.resumoExecutivo?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_bugs_execSummary));
      config.resumoExecutivo.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
      contentChildren.push(Br());
    }

    if (config.problemas?.length) {
      contentChildren.push(SectionTitle(t.doc_bugs_problemsTable));

      const colW = [
        Math.round(contentW * 0.05),
        Math.round(contentW * 0.33),
        Math.round(contentW * 0.14),
        Math.round(contentW * 0.48),
      ];

      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          HeaderCell("#", colW[0], primary),
          HeaderCell(t.doc_bugs_thProblem, colW[1], primary),
          HeaderCell(t.doc_bugs_thSeverity, colW[2], primary),
          HeaderCell(t.doc_bugs_thResolution, colW[3], primary),
        ],
      });

      const dataRows = config.problemas.map((p, i) => {
        const fill = i % 2 ? "F8F8FB" : "FFFFFF";
        const sc = sevColors[p.severity] || sevColors.ALTA;
        return new TableRow({
          children: [
            DataCell(String(i + 1), colW[0], { fill, color: "BBBBBB", bold: true }),
            DataCell(p.titulo, colW[1], { fill }),
            DataCell(p.severity, colW[2], { fill, bold: true, color: sc }),
            DataCell(p.resolucao, colW[3], { fill }),
          ],
        });
      });

      contentChildren.push(new Table({
        width: { size: contentW, type: WidthType.DXA },
        columnWidths: colW,
        rows: [headerRow, ...dataRows],
      }));

      contentChildren.push(Br());

      contentChildren.push(SectionTitle(t.doc_bugs_problemsDetail));

      config.problemas.forEach((p, i) => {
        const sc = sevColors[p.severity] || sevColors.ALTA;
        const d  = p.detalhe || {};

        contentChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 60 },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: sc, space: 8 } },
          indent: { left: 200 },
          children: [
            new TextRun({ text: `${i + 1}.  `, bold: true, size: 22, color: sc, font: "Arial" }),
            new TextRun({ text: p.titulo || t.noTitle, bold: true, size: 22, color: "1A1A2E", font: "Arial" }),
          ],
        }));

        contentChildren.push(SeverityBadge(p.severity));

        if (p.resumo?.trim()) {
          contentChildren.push(FieldLabel(t.doc_bugs_fieldDesc));
          contentChildren.push(BodyText(p.resumo));
        }

        if (p.comoReproduzir?.trim()) {
          contentChildren.push(FieldLabel(t.doc_bugs_fieldHowToReproduce));
          contentChildren.push(BodyText(p.comoReproduzir));
        }

        const sec  = (label, arr) => {
          if (!arr?.some(v => v.trim())) return;
          contentChildren.push(FieldLabel(label));
          arr.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
        };
        const codeSec = (label, arr) => {
          if (!arr?.some(v => v.trim())) return;
          contentChildren.push(FieldLabel(label));
          arr.filter(v => v.trim()).forEach(block =>
            block.split("\n").forEach(line => contentChildren.push(CodeBlock(line)))
          );
          contentChildren.push(Br());
        };

        sec(t.doc_bugs_fieldWhere, d.ondeOcorre);
        codeSec(t.doc_bugs_fieldCode, d.codigoOnde);
        sec(t.doc_bugs_fieldWhy, d.porqueProblema);
        sec(t.doc_bugs_fieldResText, d.textoResolucao);
        codeSec(t.doc_bugs_fieldResCode, d.codigoResolucao);
        codeSec(t.doc_bugs_fieldTestsPass, d.testesPassam);

        contentChildren.push(Br());
      });
    }

    if (config.testes?.length) {
      contentChildren.push(SectionTitle(t.doc_bugs_testsSection, "16A34A"));
      config.testes.forEach((ts, i) => {
        contentChildren.push(new Paragraph({
          spacing: { before: 200, after: 60 },
          border: { left: { style: BorderStyle.SINGLE, size: 12, color: "22C55E", space: 8 } },
          indent: { left: 200 },
          children: [new TextRun({ text: `${i + 1}.  ${ts.titulo || t.noTitle}`, bold: true, size: 22, color: "16A34A", font: "Arial" })],
        }));
        if (ts.descricao?.trim()) { contentChildren.push(FieldLabel(t.doc_bugs_testFieldWhat)); contentChildren.push(BodyText(ts.descricao)); }
        if (ts.como?.trim())      { contentChildren.push(FieldLabel(t.doc_bugs_testFieldHow));  contentChildren.push(BodyText(ts.como)); }
        if (ts.codigo?.some(v => v.trim())) {
          ts.codigo.filter(v => v.trim()).forEach(block =>
            block.split("\n").forEach(line => contentChildren.push(CodeBlock(line)))
          );
        }
        contentChildren.push(Br());
      });
    }

    if (config.suiteTestes?.length) {
      const label = k => (k === "UNTESTED" ? t.doc_suite_untested : k);
      const resColor = k => SUITE_RESULT_COLORS[k].replace("#", "").toUpperCase();
      const counts = suiteCounts(config.suiteTestes);
      contentChildren.push(SectionTitle(t.doc_bugs_suiteSection));
      contentChildren.push(new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({ text: `${t.doc_suite_total}: ${config.suiteTestes.length}`, bold: true, size: 18, color: "888888", font: "Arial" }),
          ...["PASS", "FAIL", "UNTESTED"].map(k => new TextRun({ text: `     ${counts[k]} ${label(k)}`, bold: true, size: 18, color: resColor(k), font: "Arial" })),
        ],
      }));
      const colW = [0.13, 0.3, 0.42, 0.15].map(f => Math.round(contentW * f));
      contentChildren.push(new Table({
        width: { size: contentW, type: WidthType.DXA },
        columnWidths: colW,
        rows: [
          new TableRow({
            tableHeader: true,
            children: [t.doc_suite_thId, t.doc_suite_thTest, t.doc_suite_thDesc, t.doc_suite_thResult].map((h, ci) => HeaderCell(h, colW[ci], primary)),
          }),
          ...config.suiteTestes.map((s, i) => {
            const fill = i % 2 ? "F8F8FB" : "FFFFFF";
            const res = normalizeResult(s.resultado);
            return new TableRow({
              children: [
                DataCell(s.codigo || "—", colW[0], { fill, color: "555555", mono: true, size: 18 }),
                DataCell(s.titulo || "—", colW[1], { fill, bold: true }),
                DataCell(s.descricao || "—", colW[2], { fill }),
                DataCell(label(res), colW[3], { fill, bold: true, color: resColor(res), size: 18 }),
              ],
            });
          }),
        ],
      }));
      contentChildren.push(Br());
    }

    if (config.tabelas?.length) {
      contentChildren.push(SectionTitle(t.doc_common_tables));
      config.tabelas.forEach(tb => {
        if (tb.titulo) contentChildren.push(new Paragraph({ spacing: { before: 160, after: 60 }, children: [new TextRun({ text: tb.titulo, bold: true, size: 22, font: "Arial", color: primary })] }));
        if (tb.cabecalhos?.length) {
          const colW = tb.cabecalhos.map(() => Math.round(contentW / tb.cabecalhos.length));
          contentChildren.push(new Table({
            width: { size: contentW, type: WidthType.DXA },
            columnWidths: colW,
            rows: [
              new TableRow({ tableHeader: true, children: tb.cabecalhos.map((col, ci) => HeaderCell(col, colW[ci], primary)) }),
              ...tb.linhas.map((row, ri) => new TableRow({ children: row.map((cell, ci) => DataCell(cell || "—", colW[ci], { fill: ri % 2 ? "F8F8FB" : "FFFFFF" })) })),
            ],
          }));
          contentChildren.push(Br());
        }
      });
    }

    if (config.conclusao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_bugs_conclusion));
      config.conclusao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
    }
  }

  if (activeTemplate === "changelog") {
    const typeOrder = ["breaking", "feat", "fix", "refactor", "perf", "style", "chore"];
    const grouped   = {};
    config.mudancas?.forEach(m => { if (!grouped[m.tipo]) grouped[m.tipo] = []; grouped[m.tipo].push(m); });

    if (config.descricao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_changelog_overview));
      config.descricao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
      contentChildren.push(Br());
    }

    if (config.mudancas?.length) {
      contentChildren.push(SectionTitle(t.doc_changelog_table));

      const colW = [
        Math.round(contentW * 0.05),
        Math.round(contentW * 0.12),
        Math.round(contentW * 0.35),
        Math.round(contentW * 0.28),
        Math.round(contentW * 0.20),
      ];

      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          HeaderCell("#", colW[0], primary),
          HeaderCell(t.doc_changelog_thType, colW[1], primary),
          HeaderCell(t.doc_changelog_thChange, colW[2], primary),
          HeaderCell(t.doc_changelog_thFile, colW[3], primary),
          HeaderCell(t.doc_changelog_thImpact, colW[4], primary),
        ],
      });

      const dataRows = config.mudancas.map((m, i) => {
        const info = CHANGE_TYPES[m.tipo] || CHANGE_TYPES.feat;
        const fill = i % 2 ? "F8F9FB" : "FFFFFF";
        const tc   = hexToDocxColor(info.color);
        return new TableRow({
          children: [
            DataCell(String(i + 1), colW[0], { fill, color: "BBBBBB", bold: true }),
            DataCell(info.label, colW[1], { fill, bold: true, color: tc }),
            DataCell(m.titulo, colW[2], { fill }),
            DataCell(m.arquivo || "—", colW[3], { fill, mono: true, size: 16 }),
            DataCell(m.impacto || "—", colW[4], { fill, size: 18 }),
          ],
        });
      });

      contentChildren.push(new Table({
        width: { size: contentW, type: WidthType.DXA },
        columnWidths: colW,
        rows: [headerRow, ...dataRows],
      }));

      contentChildren.push(Br());

      contentChildren.push(SectionTitle(t.doc_changelog_detail));

      typeOrder.filter(tp => grouped[tp]?.length).forEach(tipo => {
        const info = CHANGE_TYPES[tipo];
        const tc   = hexToDocxColor(info.color);

        contentChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 100 },
          children: [
            new TextRun({ text: `${info.label}`, bold: true, size: 24, color: tc, font: "Arial" }),
            new TextRun({ text: `  (${grouped[tipo].length})`, size: 20, color: "888888", font: "Arial" }),
          ],
        }));

        grouped[tipo].forEach(m => {
          contentChildren.push(new Paragraph({
            spacing: { before: 160, after: 60 },
            border: { left: { style: BorderStyle.SINGLE, size: 12, color: tc, space: 8 } },
            indent: { left: 200 },
            children: [new TextRun({ text: m.titulo || t.noTitle, bold: true, size: 22, color: "1A1A2E", font: "Arial" })],
          }));

          if (m.arquivo) {
            contentChildren.push(new Paragraph({
              indent: { left: 200 },
              spacing: { before: 40, after: 60 },
              children: [new TextRun({ text: m.arquivo, font: "Courier New", size: 18, color: "666666" })],
            }));
          }

          if (m.descricao?.trim()) contentChildren.push(BodyText(m.descricao));

          if (m.motivacao?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldMotiv));
            contentChildren.push(BodyText(m.motivacao));
          }

          if (m.impacto?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldImpact));
            contentChildren.push(BodyText(m.impacto));
          }

          if (m.codigoAntes?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldBefore));
            m.codigoAntes.split("\n").forEach(line => contentChildren.push(CodeBlock(line)));
            contentChildren.push(Br());
          }

          if (m.codigoDepois?.trim()) {
            contentChildren.push(FieldLabel(t.doc_changelog_fieldAfter));
            m.codigoDepois.split("\n").forEach(line => contentChildren.push(CodeBlock(line)));
            contentChildren.push(Br());
          }

          if (m.notas?.trim()) {
            contentChildren.push(new Paragraph({
              spacing: { before: 60, after: 60 },
              shading: { fill: "FFFBEB", type: ShadingType.CLEAR },
              indent: { left: 200 },
              children: [
                new TextRun({ text: t.doc_docx_notePrefix, bold: true, size: 20, color: "D97706", font: "Arial" }),
                new TextRun({ text: m.notas, size: 20, color: "555555", font: "Arial" }),
              ],
            }));
          }

          contentChildren.push(Br());
        });
      });
    }

    if (config.resumo?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_changelog_summary));
      config.resumo.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
    }
  }

  if (activeTemplate === "study") {
    const typeColors = {
      CONCEITO: hexToDocxColor(config.cores.concept  || "f59e0b"),
      PRÁTICA:  hexToDocxColor(config.cores.practice || "10b981"),
      RESUMO:   hexToDocxColor(config.cores.summary  || "6366f1"),
    };

    if (config.introducao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_study_intro));
      config.introducao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
      contentChildren.push(Br());
    }

    if (config.topicos?.length) {
      contentChildren.push(SectionTitle(t.doc_study_topicsTable));

      const colW = [
        Math.round(contentW * 0.05),
        Math.round(contentW * 0.38),
        Math.round(contentW * 0.12),
        Math.round(contentW * 0.45),
      ];

      const headerRow = new TableRow({
        tableHeader: true,
        children: [
          HeaderCell("#", colW[0], primary),
          HeaderCell(t.doc_study_thTopic, colW[1], primary),
          HeaderCell(t.doc_study_thType, colW[2], primary),
          HeaderCell(t.doc_study_thSummary, colW[3], primary),
        ],
      });

      const dataRows = config.topicos.map((tp, i) => {
        const fill = i % 2 ? "F8F8FB" : "FFFFFF";
        const tc   = typeColors[tp.tipo] || typeColors.CONCEITO;
        return new TableRow({
          children: [
            DataCell(String(i + 1), colW[0], { fill, color: "BBBBBB", bold: true }),
            DataCell(tp.titulo, colW[1], { fill }),
            DataCell(tp.tipo, colW[2], { fill, bold: true, color: tc }),
            DataCell(tp.resumo, colW[3], { fill }),
          ],
        });
      });

      contentChildren.push(new Table({
        width: { size: contentW, type: WidthType.DXA },
        columnWidths: colW,
        rows: [headerRow, ...dataRows],
      }));

      contentChildren.push(Br());

      contentChildren.push(SectionTitle(t.doc_study_topicsDetail));

      config.topicos.forEach((tp, i) => {
        const tc = typeColors[tp.tipo] || typeColors.CONCEITO;
        const d  = tp.detalhe || {};

        contentChildren.push(new Paragraph({
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 280, after: 60 },
          border: { left: { style: BorderStyle.SINGLE, size: 16, color: tc, space: 8 } },
          indent: { left: 200 },
          children: [
            new TextRun({ text: `${i + 1}.  `, bold: true, size: 22, color: tc, font: "Arial" }),
            new TextRun({ text: tp.titulo || t.noTitle, bold: true, size: 22, color: "1A1A2E", font: "Arial" }),
          ],
        }));

        contentChildren.push(new Paragraph({
          spacing: { before: 40, after: 80 },
          children: [new TextRun({ text: `  ${tp.tipo}  `, bold: true, size: 18, color: tc, font: "Arial" })],
        }));

        if (d.explicacao?.some(v => v.trim())) {
          contentChildren.push(FieldLabel(t.doc_study_fieldExplanation));
          d.explicacao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
        }

        if (d.exemplos?.some(v => v.trim())) {
          contentChildren.push(FieldLabel(t.doc_study_fieldExamples));
          d.exemplos.filter(v => v.trim()).forEach(v => contentChildren.push(BulletItem(v)));
          contentChildren.push(Br());
        }

        if (d.codigo?.some(v => v.trim())) {
          contentChildren.push(FieldLabel(t.doc_study_fieldCode));
          d.codigo.filter(v => v.trim()).forEach(block =>
            block.split("\n").forEach(line => contentChildren.push(CodeBlock(line)))
          );
          contentChildren.push(Br());
        }

        contentChildren.push(Br());
      });
    }

    if (config.conclusao?.some(v => v.trim())) {
      contentChildren.push(SectionTitle(t.doc_study_conclusion));
      config.conclusao.filter(v => v.trim()).forEach(v => contentChildren.push(BodyText(v)));
    }
  }

  const doc = new Document({
    numbering: numberingConfig,
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22, color: "333333" } },
      },
      paragraphStyles: [
        {
          id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 52, bold: true, font: "Arial", color: primary },
          paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0 },
        },
        {
          id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: primary },
          paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 },
        },
        {
          id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, font: "Arial", color: "1A1A2E" },
          paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: pageW, height: isLetter ? 15840 : 16838 },
            margin: { top: marginTB, right: marginLR, bottom: marginTB, left: marginLR },
          },
        },
        children: coverChildren,
      },
      {
        properties: {
          page: {
            size: { width: pageW, height: isLetter ? 15840 : 16838 },
            margin: { top: marginTB + 300, right: marginLR, bottom: marginTB + 300, left: marginLR },
          },
        },
        headers: { default: docHeader },
        footers: { default: docFooter },
        children: contentChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
