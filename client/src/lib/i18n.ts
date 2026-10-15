import { useSyncExternalStore } from "react";

export type Locale = "pt-BR" | "en" | "es";
export const localeNames: Record<Locale, string> = { "pt-BR": "PT", en: "EN", es: "ES" };
export const navLabels: Record<Locale, string[]> = {
  "pt-BR": ["Início", "Buscar", "Rede", "Lojas", "Painel"],
  en: ["Home", "Search", "Network", "Stores", "Dashboard"],
  es: ["Inicio", "Buscar", "Red", "Tiendas", "Panel"],
};

type Copy = Record<string, string>;
const copy: Record<Locale, Copy> = {
  "pt-BR": {},
  en: {
    "Início": "Home", "Buscar": "Search", "Rede": "Network", "Lojas": "Stores", "Painel": "Dashboard",
    "Entrar": "Sign in", "Cadastrar Profissional": "Join as a professional", "Criar meu perfil": "Create my profile",
    "Encontrar serviço": "Find a service", "Sou profissional · Criar perfil": "I am a professional · Create profile",
    "Quero anunciar": "I want to advertise", "Ver todos": "View all", "Ver plantão local": "View local on-call",
    "Zero comissões": "Zero commissions", "Contacto direto": "Direct contact", "Contato direto": "Direct contact", "Avaliações reais": "Real reviews",
    "Painel ADM": "Administration panel", "Controle administrativo": "Administration control", "Entitlements": "Administration panel",
    "Entitlements sob controle.": "Administration panel in control.", "Automação ativa": "Automation active",
    "Acesso ADM necessário": "Admin access required", "Carregando dados do banco...": "Loading data...",
    "Profissional Ouro": "Gold Professional", "Anúncio Ativo": "Active Ad", "Ativo": "Active", "Revogado": "Revoked",
    "Cortesia": "Grant courtesy", "Cancelar": "Cancel", "Embaixadores": "Ambassadors", "Código de indicação": "Referral code",
    "Código de Indicação / Embaixador": "Referral / Ambassador code", "Indicados": "Referrals", "Cadastrar": "Sign up",
    "Publicar meu serviço": "Publish my service", "Profissão ou serviço": "Profession or service", "Cidade": "City", "Bairro (opcional)": "Neighborhood (optional)",
    "Nome completo": "Full name", "Idade": "Age", "WhatsApp": "WhatsApp", "Foto (URL opcional)": "Photo (optional URL)",
    "Voltar ao painel": "Back to dashboard", "Atualizar": "Refresh", "Notificações": "Notifications", "Mudar localização": "Change location",
    "O que você precisa resolver hoje?": "What do you need solved today?", "Encontrar": "Find", "Todos": "All", "Melhores": "Top rated", "Perto de mim": "Near me",
    "SOS 24h": "24/7 SOS", "Verificados": "Verified", "Agenda aberta": "Available", "Próxima semana": "Next week", "Agenda lotada": "Fully booked",
    "Idioma alterado para": "Language changed to", "Perfil publicado.": "Profile published.", "sem aprovação manual.": "without manual approval.",
    "Porto Feliz": "Porto Feliz", "Minha cidade": "My city", "Outra cidade": "Other city",
  },
  es: {
    "Início": "Inicio", "Buscar": "Buscar", "Rede": "Red", "Lojas": "Tiendas", "Painel": "Panel",
    "Entrar": "Iniciar sesión", "Cadastrar Profissional": "Registrar profesional", "Criar meu perfil": "Crear mi perfil",
    "Encontrar serviço": "Encontrar servicio", "Sou profissional · Criar perfil": "Soy profesional · Crear perfil",
    "Quero anunciar": "Quiero anunciar", "Ver todos": "Ver todos", "Ver plantão local": "Ver guardia local",
    "Zero comissões": "Cero comisiones", "Contacto direto": "Contacto directo", "Contato direto": "Contacto directo", "Avaliações reais": "Reseñas reales",
    "Painel ADM": "Panel de administración", "Controle administrativo": "Control administrativo", "Entitlements": "Panel de administración",
    "Entitlements sob controle.": "Panel de administración bajo control.", "Automação ativa": "Automatización activa",
    "Acesso ADM necessário": "Se requiere acceso de administrador", "Carregando dados do banco...": "Cargando datos...",
    "Profissional Ouro": "Profesional Oro", "Anúncio Ativo": "Anuncio activo", "Ativo": "Activo", "Revogado": "Revocado",
    "Cortesia": "Conceder cortesía", "Cancelar": "Cancelar", "Embaixadores": "Embajadores", "Código de indicação": "Código de referencia",
    "Código de Indicação / Embaixador": "Código de referencia / Embajador", "Indicados": "Referidos", "Cadastrar": "Registrarse",
    "Publicar meu serviço": "Publicar mi servicio", "Profissão ou serviço": "Profesión o servicio", "Cidade": "Ciudad", "Bairro (opcional)": "Barrio (opcional)",
    "Nome completo": "Nombre completo", "Idade": "Edad", "WhatsApp": "WhatsApp", "Foto (URL opcional)": "Foto (URL opcional)",
    "Voltar ao painel": "Volver al panel", "Atualizar": "Actualizar", "Notificações": "Notificaciones", "Mudar localização": "Cambiar ubicación",
    "O que você precisa resolver hoje?": "¿Qué necesitas resolver hoy?", "Encontrar": "Buscar", "Todos": "Todos", "Melhores": "Mejor valorados", "Perto de mim": "Cerca de mí",
    "SOS 24h": "SOS 24 h", "Verificados": "Verificados", "Agenda aberta": "Agenda abierta", "Próxima semana": "Próxima semana", "Agenda lotada": "Agenda llena",
    "Idioma alterado para": "Idioma cambiado a", "Perfil publicado.": "Perfil publicado.", "sem aprovação manual.": "sin aprobación manual.",
    "Porto Feliz": "Porto Feliz", "Minha cidade": "Mi ciudad", "Outra cidade": "Otra ciudad",
  },
};

let currentLocale: Locale = "pt-BR";
const listeners = new Set<() => void>();

function browserLocale(): Locale {
  if (typeof navigator === "undefined") return "pt-BR";
  const language = navigator.language.toLowerCase();
  return language.startsWith("es") ? "es" : language.startsWith("en") ? "en" : "pt-BR";
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const stored = window.localStorage.getItem("lefind:locale");
  return stored === "en" || stored === "es" || stored === "pt-BR" ? stored : browserLocale();
}

export function getLocale(): Locale { return currentLocale; }
export function t(value: string, locale = currentLocale): string { return copy[locale][value] ?? value; }

function translateElement(root: ParentNode, locale: Locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach(node => {
    const raw = node.nodeValue ?? "";
    const trimmed = raw.trim();
    if (!trimmed || trimmed.length > 180 || node.parentElement?.closest("script,style,svg")) return;
    const translated = t(trimmed, locale);
    if (translated !== trimmed) node.nodeValue = raw.replace(trimmed, translated);
  });
  root.querySelectorAll?.("[placeholder],[aria-label],[title]").forEach(element => {
    (["placeholder", "aria-label", "title"] as const).forEach(attribute => {
      const value = element.getAttribute(attribute);
      if (value) element.setAttribute(attribute, t(value, locale));
    });
  });
}

export function translateDocument(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  translateElement(document.body, locale);
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") window.localStorage.setItem("lefind:locale", locale);
  translateDocument(locale);
  listeners.forEach(listener => listener());
}

export function initLocale() { if (currentLocale === "pt-BR") setLocale(getStoredLocale()); }
export function useLocale() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, () => currentLocale, () => "pt-BR" as Locale);
}

export function formatCurrency(amount: number, locale = currentLocale, currency?: string) {
  const code = currency ?? (locale === "en" ? "USD" : locale === "es" ? "EUR" : "BRL");
  return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(amount);
}
