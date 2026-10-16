import { ArrowLeft, ArrowRight, BadgePercent, Filter, LocateFixed, Map, Search as SearchIcon, SlidersHorizontal, Store } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ProfessionalCard } from "@/pages/Home";
import { getAllProfessionals, getSosStatus, type Professional } from "@/lib/data";
import { trpc } from "@/lib/trpc";

export default function SearchPage() {
  const [location] = useLocation();
  const allProfessionals = getAllProfessionals();
  const initialQuery = new URLSearchParams(typeof window !== "undefined" ? window.location.search : location.split("?")[1] ?? "").get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [onlySos, setOnlySos] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [best, setBest] = useState(false);
  const [near, setNear] = useState(false);
  const [geoReady, setGeoReady] = useState(false);
  const remoteSearch = trpc.directory.search.useQuery({ query, city: "Porto Feliz" }, { staleTime: 5000 });
  const requestLocation = () => {
    if (!navigator.geolocation) { setNear(true); return; }
    navigator.geolocation.getCurrentPosition(() => { setGeoReady(true); setNear(true); }, () => setNear(true), { enableHighAccuracy: false, timeout: 5000 });
  };
  const sourceProfessionals = useMemo(() => {
    if (!remoteSearch.data) return allProfessionals;
    return remoteSearch.data.map((person: any) => {
      const local = allProfessionals.find(item => item.slug === person.slug);
      return local ?? { slug: person.slug, name: person.name, initials: person.name.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase(), role: person.role, city: person.city, neighborhood: person.neighborhood ?? "", distance: "região", rating: Number(person.rating ?? 0), reviews: Number(person.reviews ?? person.reviewCount ?? 0), availability: person.availability ?? "open", verified: Boolean(person.verified), gold: Boolean(person.gold), sos: Boolean(person.sos), avatar: person.avatarUrl ?? "", cover: person.coverUrl ?? "", bio: person.bio ?? `Atendimento de ${person.role.toLocaleLowerCase("pt-BR")} em ${person.city}.`, tags: [person.role], socials: [], response: "novo", completed: "novo perfil", whatsapp: person.whatsapp ?? "" } as Professional;
    });
  }, [remoteSearch.data, allProfessionals]);
  const results = useMemo(() => sourceProfessionals.filter(person => {
    const q = query.toLowerCase();
    const text = `${person.name} ${person.role} ${person.city} ${person.neighborhood} ${person.tags.join(" ")}`.toLowerCase();
    return (!q || text.includes(q)) && (!onlySos || getSosStatus(person.slug, person.sos)) && (!onlyVerified || person.verified) && (!best || person.rating >= 4.9) && (!near || parseFloat(person.distance.replace(",", ".")) <= 5);
  }), [sourceProfessionals, query, onlySos, onlyVerified, best, near]);
  const reset = () => { setQuery(""); setOnlySos(false); setOnlyVerified(false); setBest(false); setNear(false); setGeoReady(false); };
  const term = query.trim() || "serviço";
  const requestText = encodeURIComponent(`Olá, LE.FIND. Ainda não encontrei ${term} em Porto Feliz e gostaria de solicitar este profissional.`);
  return <AppShell><PageHeader eyebrow="Diretório local" title="Busque sem complicar." description="Profissão, produto, bairro ou cidade. O resultado certo aparece mais perto do que você imagina." action={<button className="secondary-button" onClick={reset}><SlidersHorizontal size={15} /> Limpar filtros</button>} /><main className="container"><a className="search-sponsored-banner glass-card" href="/lojas"><div className="sponsored-banner-icon"><Store size={20} /></div><div className="sponsored-banner-copy"><div className="eyebrow"><BadgePercent size={11} /> Spot patrocinado · Porto Feliz</div><h2>Casa Norte Materiais</h2><p>Materiais, tintas e argamassa com entrega no bairro. Veja a vitrine mais perto do seu serviço.</p></div><span className="sponsored-banner-cta">Ver vitrine <ArrowRight size={14} /></span></a><div className="search-layout"><aside className="filter-panel glass-card"><h3><Filter size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Filtre do seu jeito</h3><label className="filter-option"><input type="checkbox" checked={onlySos} onChange={event => setOnlySos(event.target.checked)} /> SOS 24h <span style={{ color: "var(--coral)", marginLeft: "auto" }}>●</span></label><label className="filter-option"><input type="checkbox" checked={onlyVerified} onChange={event => setOnlyVerified(event.target.checked)} /> Verificados</label><label className="filter-option"><input type="checkbox" checked={best} onChange={event => setBest(event.target.checked)} /> Nota 4.9+</label><label className="filter-option"><input type="checkbox" checked={near} onChange={event => setNear(event.target.checked)} /> Até 5 km</label><div style={{ borderTop: "1px solid var(--line)", margin: "18px 0", paddingTop: 16 }}><div className="eyebrow">Localização</div><button className="filter-option" style={{ padding: 0, width: "100%", background: "transparent", border: 0 }} onClick={requestLocation}><LocateFixed size={14} color="var(--lime)" /> {geoReady ? "Minha localização ativa" : "Usar minha localização"}<span style={{ marginLeft: "auto" }}>⌄</span></button></div><button className="secondary-button" style={{ width: "100%" }} onClick={requestLocation}><Map size={14} /> Ver no mapa</button></aside><section><div className="search-box" style={{ marginTop: 0, marginBottom: 18 }}><SearchIcon size={18} className="search-icon" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex.: eletricista, pintura, pet sitter" /><button className="search-submit">Buscar</button></div><div className="results-head"><strong>{remoteSearch.isFetching ? "Buscando…" : `${results.length || 0} resultados encontrados`}</strong><span>ordenado por relevância</span></div>{results.length ? <div className="results-grid">{results.map(person => <ProfessionalCard key={person.slug} person={person} />)}</div> : <div className="search-empty glass-card"><div style={{ color: "var(--lime)", marginBottom: 12 }}><SearchIcon size={28} /></div><h3>Ainda não temos um {term} cadastrado em Porto Feliz.</h3><p>Ajude sua região a encontrar este serviço: solicite um profissional ou publique na comunidade local.</p><div className="search-empty-actions"><a className="primary-button" href={`https://wa.me/5515999900000?text=${requestText}`}>Solicitar no WhatsApp <ArrowRight size={14} /></a><Link className="secondary-button" href="/comunidades">Postar na Comunidade Local</Link></div></div>}</section></div></main></AppShell>;
}
