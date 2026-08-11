import express from "express";
import puppeteer from "puppeteer";
import rateLimit from "express-rate-limit";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { buildBugsHtml, buildStudyHtml, buildChangelogHtml } from "./utils/exportUtils.js";
import { getT } from "./utils/i18n.js";

const app  = express();
const PORT = process.env.PORT || 3001;

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath  = join(__dirname, "..", "dist");

const LIMITS = {
  bodySize:       "1mb",
  maxProblemas:   60,
  maxTopicos:     60,
  maxMudancas:    100,
  maxTestes:      60,
  maxTabelas:     15,
  maxColunas:     10,
  maxLinhas:      100,
  maxResumoItems: 20,
  maxTextLen:     8000,
  puppeteerMs:    25_000,
};

app.use(express.json({ limit: LIMITS.bodySize }));
app.use(express.static(distPath));

const exportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use("/export", exportLimiter);

app.use("/export", (req, res, next) => {
  const apiKey = process.env.API_KEY;
  if (apiKey && req.headers["x-api-key"] !== apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// Esquema explicativo dos payloads (para LLMs/integrações). Sem rate limit nem API key.
const schemaPath = join(__dirname, "..", "report-schema.json");
let reportSchema = null;
try {
  reportSchema = JSON.parse(readFileSync(schemaPath, "utf8"));
} catch (err) {
  console.warn("report-schema.json not loaded:", err.message);
}

app.get("/schema", (_req, res) => {
  if (!reportSchema) return res.status(404).json({ error: "schema unavailable" });
  res.json(reportSchema);
});

function validateText(val, field) {
  if (typeof val === "string" && val.length > LIMITS.maxTextLen) {
    return `${field} exceeds ${LIMITS.maxTextLen} characters`;
  }
  return null;
}

function validateArray(arr, field, maxLen) {
  if (!Array.isArray(arr)) return `${field} must be an array`;
  if (arr.length > maxLen)  return `${field} exceeds ${maxLen} items`;
  return null;
}

function validateBugs(data) {
  let err;
  if ((err = validateArray(data.problemas,      "problemas",      LIMITS.maxProblemas)))   return err;
  if ((err = validateArray(data.testes,         "testes",         LIMITS.maxTestes)))      return err;
  if ((err = validateArray(data.tabelas,        "tabelas",        LIMITS.maxTabelas)))     return err;
  if ((err = validateArray(data.resumoExecutivo,"resumoExecutivo",LIMITS.maxResumoItems))) return err;

  for (const p of data.problemas) {
    if ((err = validateText(p.titulo,        "problema.titulo")))        return err;
    if ((err = validateText(p.resumo,        "problema.resumo")))        return err;
    if ((err = validateText(p.resolucao,     "problema.resolucao")))     return err;
    if ((err = validateText(p.comoReproduzir,"problema.comoReproduzir")))return err;
  }

  for (const t of data.tabelas) {
    if ((err = validateArray(t.cabecalhos, "tabela.cabecalhos", LIMITS.maxColunas))) return err;
    if ((err = validateArray(t.linhas,     "tabela.linhas",     LIMITS.maxLinhas)))  return err;
  }
  return null;
}

function validateStudy(data) {
  let err;
  if ((err = validateArray(data.topicos, "topicos", LIMITS.maxTopicos))) return err;
  if ((err = validateArray(data.tabelas, "tabelas", LIMITS.maxTabelas))) return err;

  for (const t of data.tabelas) {
    if ((err = validateArray(t.cabecalhos, "tabela.cabecalhos", LIMITS.maxColunas))) return err;
    if ((err = validateArray(t.linhas,     "tabela.linhas",     LIMITS.maxLinhas)))  return err;
  }
  return null;
}

function validateChangelog(data) {
  let err;
  if ((err = validateArray(data.mudancas, "mudancas", LIMITS.maxMudancas))) return err;
  if ((err = validateArray(data.tabelas,  "tabelas",  LIMITS.maxTabelas)))  return err;

  for (const t of data.tabelas) {
    if ((err = validateArray(t.cabecalhos, "tabela.cabecalhos", LIMITS.maxColunas))) return err;
    if ((err = validateArray(t.linhas,     "tabela.linhas",     LIMITS.maxLinhas)))  return err;
  }
  return null;
}

app.post("/export", async (req, res) => {
  const data = req.body;
  const { template, lang = "pt" } = data;

  if (!template) {
    return res.status(400).json({ error: "template is required" });
  }

  const t = getT(lang);

  let validationError;
  let html;

  if (template === "bugs") {
    validationError = validateBugs(data);
    if (!validationError) html = buildBugsHtml(data, t);
  } else if (template === "study") {
    validationError = validateStudy(data);
    if (!validationError) html = buildStudyHtml(data, t);
  } else if (template === "changelog") {
    validationError = validateChangelog(data);
    if (!validationError) html = buildChangelogHtml(data, t);
  } else {
    return res.status(400).json({ error: `unknown template: ${template}` });
  }

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const format   = data.formato === "CARTA" ? "Letter" : "A4";
  const filename = `relatorio-${template}-v${data.versao || "1"}.pdf`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: LIMITS.puppeteerMs });

    const pdf = await page.pdf({
      format,
      printBackground: true,
      margin: { top: "1.5cm", bottom: "1.5cm", left: "1.5cm", right: "1.5cm" },
      timeout: LIMITS.puppeteerMs,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "pdf generation failed", detail: err.message });
  } finally {
    await browser?.close();
  }
});

app.get("*", (_req, res) => res.sendFile(join(distPath, "index.html")));

app.listen(PORT, () => console.log(`reportgen-api running on :${PORT}`));
