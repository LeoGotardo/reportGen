import { createContext, useContext } from "react";

/** Valor do contexto: goTo(anchor) — rola o preview até o elemento com data-anchor={anchor}. */
export const PreviewNavContext = createContext(null);

export const usePreviewNav = () => useContext(PreviewNavContext);
