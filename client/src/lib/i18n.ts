export type Locale = "pt-BR" | "en" | "es";

export const localeNames: Record<Locale, string> = { "pt-BR": "PT", en: "EN", es: "ES" };
export const navLabels: Record<Locale, string[]> = {
  "pt-BR": ["Início", "Buscar", "Rede", "Lojas", "Painel"],
  en: ["Home", "Search", "Network", "Stores", "Dashboard"],
  es: ["Inicio", "Buscar", "Red", "Tiendas", "Panel"],
};

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const value = window.localStorage.getItem("lefind:locale");
  return value === "en" || value === "es" || value === "pt-BR" ? value : "pt-BR";
}
