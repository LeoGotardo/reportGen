import React, { createContext, useContext } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

const AssetsContext = createContext(null);

const initial = { logos: [], palettes: [], snippets: [] };

export function AssetsProvider({ children }) {
  const [assets, setAssets] = useLocalStorageState("rg_assets", initial);

  const addLogo    = (name, dataUrl) => setAssets(a => ({ ...a, logos:    [...a.logos,    { id: crypto.randomUUID(), name, dataUrl }] }));
  const removeLogo = id              => setAssets(a => ({ ...a, logos:    a.logos.filter(x => x.id !== id) }));

  const addPalette    = (name, colors) => setAssets(a => ({ ...a, palettes: [...a.palettes, { id: crypto.randomUUID(), name, colors }] }));
  const removePalette = id             => setAssets(a => ({ ...a, palettes: a.palettes.filter(x => x.id !== id) }));

  const addSnippet    = (name, category, text) => setAssets(a => ({ ...a, snippets: [...a.snippets, { id: crypto.randomUUID(), name, category, text }] }));
  const removeSnippet = id                     => setAssets(a => ({ ...a, snippets: a.snippets.filter(x => x.id !== id) }));

  return (
    <AssetsContext.Provider value={{ assets, addLogo, removeLogo, addPalette, removePalette, addSnippet, removeSnippet }}>
      {children}
    </AssetsContext.Provider>
  );
}

export const useAssets = () => useContext(AssetsContext);
