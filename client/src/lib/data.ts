export type Availability = "open" | "next" | "full";

export type Professional = {
  slug: string;
  name: string;
  role: string;
  city: string;
  neighborhood: string;
  distance: string;
  rating: number;
  reviews: number;
  availability: Availability;
  verified: boolean;
  sos: boolean;
  gold: boolean;
  avatar: string;
  cover: string;
  initials: string;
  bio: string;
  tags: string[];
  socials: { label: string; icon: string; url: string }[];
  response: string;
  completed: string;
  whatsapp: string;
};

export const professionals: Professional[] = [
  {
    slug: "carlos-piscineiro", name: "Carlos Mendes", role: "Piscineiro & manutenção", city: "Porto Feliz, SP", neighborhood: "Vila Nova", distance: "1,8 km", rating: 4.9, reviews: 86, availability: "open", verified: true, sos: true, gold: true,
    avatar: "https://i.pravatar.cc/160?img=12", cover: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85", initials: "CM",
    bio: "Deixo sua piscina pronta para o próximo mergulho — manutenção, limpeza e reparos com diagnóstico transparente.", tags: ["Piscina", "Bomba", "Limpeza", "SOS 24h"],
    socials: [{ label: "Instagram", icon: "◎", url: "https://instagram.com" }, { label: "TikTok", icon: "♪", url: "https://tiktok.com" }, { label: "YouTube", icon: "▶", url: "https://youtube.com" }], response: "12 min", completed: "412 serviços", whatsapp: "5515999991201",
  },
  {
    slug: "bia-eletrica", name: "Bia Elétrica", role: "Eletricista residencial", city: "Porto Feliz, SP", neighborhood: "Centro", distance: "2,4 km", rating: 5.0, reviews: 54, availability: "open", verified: true, sos: true, gold: true,
    avatar: "https://i.pravatar.cc/160?img=47", cover: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=85", initials: "BE",
    bio: "Instalações seguras, laudos e soluções elétricas sem susto na conta — do projeto ao acabamento.", tags: ["Elétrica", "Laudo", "Chuveiro", "Plantão"], socials: [{ label: "Instagram", icon: "◎", url: "https://instagram.com" }, { label: "Threads", icon: "@", url: "https://threads.net" }], response: "18 min", completed: "289 serviços", whatsapp: "5515999991202",
  },
  {
    slug: "joao-chaveiro", name: "João Chaveiro", role: "Chaveiro 24 horas", city: "Porto Feliz, SP", neighborhood: "Jardim Brasil", distance: "3,1 km", rating: 4.8, reviews: 112, availability: "open", verified: true, sos: true, gold: false,
    avatar: "https://i.pravatar.cc/160?img=68", cover: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1400&q=85", initials: "JC",
    bio: "Acesso rápido para casa, carro e comércio. Atendimento discreto em Porto Feliz e região.", tags: ["Chaveiro", "Carro", "Fechadura", "SOS 24h"], socials: [{ label: "Instagram", icon: "◎", url: "https://instagram.com" }], response: "25 min", completed: "731 serviços", whatsapp: "5515999991203",
  },
  {
    slug: "marina-pinturas", name: "Marina Pinturas", role: "Pintura & restauração", city: "Boituva, SP", neighborhood: "Parque Novo", distance: "12,6 km", rating: 4.9, reviews: 38, availability: "next", verified: true, sos: false, gold: true,
    avatar: "https://i.pravatar.cc/160?img=32", cover: "https://images.unsplash.com/photo-1562259949-2f89f4a9f5aa?auto=format&fit=crop&w=1400&q=85", initials: "MP",
    bio: "Paredes com outra energia. Pintura interna, externa e restauração com curadoria de cor.", tags: ["Pintura", "Textura", "Cores", "Restauração"], socials: [{ label: "Instagram", icon: "◎", url: "https://instagram.com" }, { label: "Pinterest", icon: "P", url: "https://pinterest.com" }], response: "1 hora", completed: "126 serviços", whatsapp: "5515999991204",
  },
  {
    slug: "rafa-bike", name: "Rafa Bike Lab", role: "Oficina de bikes", city: "Sorocaba, SP", neighborhood: "Campolim", distance: "18,2 km", rating: 4.7, reviews: 71, availability: "full", verified: false, sos: false, gold: false,
    avatar: "https://i.pravatar.cc/160?img=11", cover: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?auto=format&fit=crop&w=1400&q=85", initials: "RB",
    bio: "Bike fit, revisão e upgrades para você pedalar mais e parar menos.", tags: ["Bike fit", "Revisão", "Freios", "Upgrades"], socials: [{ label: "YouTube", icon: "▶", url: "https://youtube.com" }], response: "2 dias", completed: "204 serviços", whatsapp: "5515999991205",
  },
  {
    slug: "nina-petcare", name: "Nina Pet Care", role: "Banho, tosa & pet sitter", city: "Porto Feliz, SP", neighborhood: "Vila Progresso", distance: "4,7 km", rating: 4.9, reviews: 63, availability: "next", verified: true, sos: false, gold: false,
    avatar: "https://i.pravatar.cc/160?img=49", cover: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1400&q=85", initials: "NP",
    bio: "Cuidado com calma e carinho para cães e gatos — na sua casa ou no nosso espaço.", tags: ["Banho", "Tosa", "Pet sitter", "Gatos"], socials: [{ label: "Instagram", icon: "◎", url: "https://instagram.com" }, { label: "Kwai", icon: "K", url: "https://kwai.com" }], response: "3 horas", completed: "178 serviços", whatsapp: "5515999991206",
  },
];

export const communities = [
  { slug: "condominio-alvorada", name: "Condomínio Alvorada", type: "Privado", members: 248, city: "Porto Feliz", tag: "Recomendados do bairro", accent: "lime", description: "Prestadores aprovados por moradores, direto no seu celular." },
  { slug: "rede-jardim-brasil", name: "Rede Jardim Brasil", type: "Público", members: 1204, city: "Porto Feliz", tag: "Comunidade local", accent: "cyan", description: "Comércio, serviços e achados que fazem o bairro acontecer." },
  { slug: "maes-boituva", name: "Mães de Boituva", type: "Privado", members: 487, city: "Boituva", tag: "Indicações reais", accent: "coral", description: "Uma rede segura para pedir indicação e fechar com confiança." },
];

export const stores = [
  { name: "Casa Norte Materiais", category: "Construção", city: "Porto Feliz", distance: "0,9 km", badge: "Patrocinado", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", products: ["Cimento CP-II", "Tinta acrílica", "Argamassa"], accent: "lime" },
  { name: "AutoMix Peças", category: "Autopeças", city: "Porto Feliz", distance: "2,1 km", badge: "Entrega hoje", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80", products: ["Baterias", "Óleo 5W30", "Palhetas"], accent: "cyan" },
  { name: "Tons & Tintas", category: "Tintas", city: "Boituva", distance: "11,4 km", badge: "Mais escolhida", image: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=800&q=80", products: ["Paleta 2026", "Texturas", "Esmalte"], accent: "coral" },
];

export const testimonials = [
  { name: "Ana P.", initials: "AP", text: "Chegou no horário, explicou tudo e resolveu sem empurrar serviço. Já salvei para indicar.", date: "há 2 dias", rating: 5 },
  { name: "Leandro R.", initials: "LR", text: "O antes e depois deixou tudo muito claro para o condomínio. Atendimento muito profissional.", date: "há 1 semana", rating: 5 },
  { name: "Marta S.", initials: "MS", text: "Pedi orçamento de manhã e a piscina estava pronta à tarde. Recomendo demais.", date: "há 2 semanas", rating: 5 },
];

export const testimonialsBySlug: Record<string, typeof testimonials> = {
  "carlos-piscineiro": testimonials,
  "bia-eletrica": [{ name: "Renata C.", initials: "RC", text: "A Bia explicou o problema sem enrolar e deixou tudo seguro. Voltaria a chamar.", date: "há 3 dias", rating: 5 }, { name: "Diego M.", initials: "DM", text: "Laudo claro e instalação impecável. Recomendo para qualquer reforma.", date: "há 1 semana", rating: 5 }],
  "joao-chaveiro": [{ name: "Caio F.", initials: "CF", text: "Chegou em poucos minutos mesmo sendo domingo. Resolveu e foi muito educado.", date: "há 4 dias", rating: 5 }, { name: "Nádia P.", initials: "NP", text: "Abriu a porta sem danificar a fechadura. Atendimento nota dez.", date: "há 2 semanas", rating: 5 }],
};

export function getSosStatus(slug: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(`lefind:sos:${slug}`) !== "false" && (window.localStorage.getItem(`lefind:sos:${slug}`) === "true" || fallback);
}

export function setSosStatus(slug: string, enabled: boolean) {
  if (typeof window !== "undefined") window.localStorage.setItem(`lefind:sos:${slug}`, String(enabled));
}

export const searchSuggestions = ["eletricista", "piscineiro", "chaveiro 24h", "pintura", "pet sitter"];

const CUSTOM_PROFILES_KEY = "lefind:custom-professionals";

export function getCustomProfessionals(): Professional[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(window.localStorage.getItem(CUSTOM_PROFILES_KEY) ?? "[]") as Professional[]; } catch { return []; }
}

export function getAllProfessionals(): Professional[] {
  const custom = getCustomProfessionals();
  return [...professionals, ...custom.filter(item => !professionals.some(base => base.slug === item.slug))];
}

export function saveCustomProfessional(profile: Professional) {
  if (typeof window === "undefined") return;
  const next = [...getCustomProfessionals().filter(item => item.slug !== profile.slug), profile];
  window.localStorage.setItem(CUSTOM_PROFILES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("lefind:professionals-updated"));
}
