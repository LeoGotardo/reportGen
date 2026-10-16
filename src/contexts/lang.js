import { createContext, useContext } from "react";

/** Valor do contexto: { lang, setLang, t } — fornecido por <LangProvider> (LangContext.jsx). */
export const LangContext = createContext(null);

export const useLang = () => useContext(LangContext);
