import React, { useEffect, useState } from "react";
import { getT, LANGS } from "../i18n";
import { LangContext } from "./lang";

const HTML_LANG = { pt: "pt-BR", en: "en" };

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem("reportgen_lang");
    return LANGS.includes(saved) ? saved : "pt";
  });

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang] || lang;
  }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem("reportgen_lang", l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: getT(lang) }}>
      {children}
    </LangContext.Provider>
  );
}
