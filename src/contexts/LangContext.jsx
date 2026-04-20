import React, { createContext, useContext, useState } from "react";
import { getT, LANGS } from "../i18n";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem("reportgen_lang");
    return LANGS.includes(saved) ? saved : "pt";
  });

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

export function useLang() {
  return useContext(LangContext);
}
