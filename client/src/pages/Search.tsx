import { ArrowLeft, Filter, LocateFixed, Map, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { ProfessionalCard } from "@/pages/Home";
import { getSosStatus, professionals } from "@/lib/data";

export default function SearchPage() {
  const [location] = useLocation();
  const initialQuery = new URLSearchParams(location.split("?")[1] ?? "").get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [onlySos, setOnlySos] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [best, setBest] = useState(false);
  const [near, setNear] = useState(false);
  const results = useMemo(() => professionals.filter(person => {
    const q = query.toLowerCase();
    const text = `${person.name} ${person.role} ${person.city} ${person.neighborhood} ${person.tags.join(" ")}`.toLowerCase();
    return (!q || text.includes(q)) && (!onlySos || getSosStatus(person.slug, person.sos)) && (!onlyVerified || person.verified) && (!best || person.rating >= 4.9) && (!near || parseFloat(person.distance.replace(",", ".")) <= 5);
  }), [query, onlySos, onlyVerified, best, near]);
  return <AppShell><PageHeader eyebrow="Diretório local" title="Busque sem complicar." description="Profissão, produto, bairro ou cidade. O resultado certo aparece mais perto do que você imagina." action={<button className="secondary-button" onClick={() => { setQuery(""); setOnlySos(false); setOnlyVerified(false); setBest(false); setNear(false); }}><SlidersHorizontal size={15} /> Limpar filtros</button>} /><main className="container"><div className="search-layout"><aside className="filter-panel glass-card"><h3><Filter size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} /> Filtre do seu jeito</h3><label className="filter-option"><input type="checkbox" checked={onlySos} onChange={event => setOnlySos(event.target.checked)} /> SOS 24h <span style={{ color: "var(--coral)", marginLeft: "auto" }}>●</span></label><label className="filter-option"><input type="checkbox" checked={onlyVerified} onChange={event => setOnlyVerified(event.target.checked)} /> Verificados</label><label className="filter-option"><input type="checkbox" checked={best} onChange={event => setBest(event.target.checked)} /> Nota 4.9+</label><label className="filter-option"><input type="checkbox" checked={near} onChange={event => setNear(event.target.checked)} /> Até 5 km</label><div style={{ borderTop: "1px solid var(--line)", margin: "18px 0", paddingTop: 16 }}><div className="eyebrow">Localização</div><button className="filter-option" style={{ padding: 0, width: "100%", background: "transparent", border: 0 }} onClick={() => setNear(true)}><LocateFixed size={14} color="var(--lime)" /> Porto Feliz, SP <span style={{ marginLeft: "auto" }}>⌄</span></button></div><button className="secondary-button" style={{ width: "100%" }} onClick={() => setNear(true)}><Map size={14} /> Ver no mapa</button></aside><section><div className="search-box" style={{ marginTop: 0, marginBottom: 18 }}><SearchIcon size={18} className="search-icon" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex.: eletricista, pintura, pet sitter" /><button className="search-submit">Buscar</button></div><div className="results-head"><strong>{results.length || 0} resultados encontrados</strong><span>ordenado por relevância</span></div>{results.length ? <div className="results-grid">{results.map(person => <ProfessionalCard key={person.slug} person={person} />)}</div> : <div className="glass-card" style={{ padding: 28, textAlign: "center" }}><div style={{ color: "var(--lime)", marginBottom: 12 }}><SearchIcon size={28} /></div><h3>Nada apareceu ainda.</h3><p style={{ color: "var(--muted)", fontSize: 13 }}>Tente uma profissão diferente ou remova algum filtro.</p><Link href="/" className="signal-cta"><ArrowLeft size={14} /> voltar para início</Link></div>}</section></div></main></AppShell>;
}
