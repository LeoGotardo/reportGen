export function loadScript(id, src) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing?.dataset.loaded) { resolve(); return; }
    if (existing) existing.remove();
    const s = document.createElement("script");
    s.id = id; s.src = src;
    s.onload = () => { s.dataset.loaded = "1"; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function getPdfMake() {
  await loadScript("pdfmake-core", "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js");
  await loadScript("pdfmake-fonts", "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js");
  return window.pdfMake;
}

export async function getDocx() {
  await loadScript("docx-js", "https://unpkg.com/docx@8.5.0/build/index.umd.js");
  return window.docx;
}

export async function getJSZip() {
  await loadScript("jszip", "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");
  return window.JSZip;
}
