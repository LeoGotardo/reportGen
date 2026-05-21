import express from "express";
import puppeteer from "puppeteer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { buildBugsHtml, buildStudyHtml, buildChangelogHtml } from "./utils/exportUtils.js";
import { getT } from "./utils/i18n.js";

const app  = express();
const PORT = process.env.PORT || 3001;

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath  = join(__dirname, "..", "dist");

app.use(express.json({ limit: "4mb" }));
app.use(express.static(distPath));

app.use("/export", (req, res, next) => {
  const apiKey = process.env.API_KEY;
  if (apiKey && req.headers["x-api-key"] !== apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/export", async (req, res) => {
  const data = req.body;
  const { template, lang = "pt" } = data;

  if (!template) {
    return res.status(400).json({ error: "template is required" });
  }

  const t = getT(lang);

  let html;
  if (template === "bugs")         html = buildBugsHtml(data, t);
  else if (template === "study")   html = buildStudyHtml(data, t);
  else if (template === "changelog") html = buildChangelogHtml(data, t);
  else return res.status(400).json({ error: `unknown template: ${template}` });

  const format = data.formato === "CARTA" ? "Letter" : "A4";
  const filename = `relatorio-${template}-v${data.versao || "1"}.pdf`;

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format,
      printBackground: true,
      margin: { top: "1.5cm", bottom: "1.5cm", left: "1.5cm", right: "1.5cm" },
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
