import { ArrowRight, Check, ChevronRight, Clock3, Heart, LocateFixed, MessageCircle, Search, ShieldCheck, Star, Users, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getSosStatus, professionals, type Availability } from "@/lib/data";

function availabilityLabel(value: Availability) {
  if (value === "open") return "Agenda aberta";
  if (value === "next") return "Próxima semana";
  return "Agenda lotada";
}

export function ProfessionalCard({ person, onNotify }: { person: typeof professionals[number]; onNotify?: (message: string) => void }) {
  const [, navigate] = useLocation();
  const sosEnabled = getSosStatus(person.slug, person.sos);
  const whatsappUrl = `https://wa.me/${person.whatsapp}?text=${encodeURIComponent(`Olá, ${person.name.split(" ")[0]}! Encontrei seu perfil no LE.FIND.`)}`;
  return <article className="profile-card glass-card" onClick={() => navigate(`/profissional/${person.slug}`)} role="link" tabIndex={0} onKeyDown={event => event.key === "Enter" && navigate(`/profissional/${person.slug}`)}>
    {sosEnabled && <div className="sos-ribbon"><span className="pulse" /> SOS disponível</div>}
    <div className="profile-cover" style={{ backgroundImage: `url(${person.cover})` }} />
    <div className="profile-main">
      <div className="card-topline"><img className="profile-avatar" src={person.avatar} alt={person.name} /><div>{person.gold && <span className="gold-badge">◆ Profissional ouro</span>}</div></div>
      <h3>{person.name} {person.verified && <span className="verified"><ShieldCheck size={13} fill="currentColor" /></span>}</h3>
      <div className="card-role">{person.role}</div>
      <div className="card-meta"><span className="rating">★ {person.rating.toFixed(1)} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({person.reviews})</span></span><span>{person.distance}</span><span>{person.city.split(",")[0]}</span></div>
      <div className="card-status"><span className={`status-dot ${person.availability}`} />{availabilityLabel(person.availability)} <span style={{ color: "var(--muted)" }}>· responde em {person.response}</span></div>
      <div className="card-tags">{person.tags.slice(0, 3).map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
      <div className="card-footer"><span className="response">{person.completed}</span><a className="card-action" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={event => event.stopPropagation()}>Chamar agora <ArrowRight size={13} style={{ verticalAlign: "-2px" }} /></a></div>
    </div>
  </article>;
}

function SearchBar({ value, onChange, onSubmit }: { value: string; onChange: (value: string) => void; onSubmit: () => void }) {
  return <div className="search-box"><Search size={20} className="search-icon" /><input value={value} onChange={event => onChange(event.target.value)} onKeyDown={event => event.key === "Enter" && onSubmit()} placeholder="O que você precisa resolver hoje?" aria-label="Buscar profissionais, produtos ou bairros" /><button className="search-submit" onClick={onSubmit}>Encontrar</button></div>;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => professionals.filter(person => {
    const q = query.toLowerCase();
    const matchesQuery = !q || `${person.name} ${person.role} ${person.city} ${person.neighborhood} ${person.tags.join(" ")}`.toLowerCase().includes(q);
    const matchesFilter = activeFilter === "Todos" || (activeFilter === "SOS 24h" && getSosStatus(person.slug, person.sos)) || (activeFilter === "Verificados" && person.verified) || (activeFilter === "Melhores" && person.rating >= 4.9) || (activeFilter === "Perto de mim" && parseFloat(person.distance.replace(",", ".")) <= 5);
    return matchesQuery && matchesFilter;
  }).slice(0, 6), [query, activeFilter]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3000); };
  const submit = () => { if (query.trim()) navigate(`/buscar?q=${encodeURIComponent(query)}`); else notify("Digite uma profissão, produto ou bairro para começar"); };

  return <AppShell>
    <main>
      <section className="hero"><div className="container hero-grid"><div><div className="eyebrow">A rede local que resolve</div><h1>Encontre quem faz <span>acontecer.</span></h1><p className="hero-copy">Profissionais confiáveis, lojas do seu bairro e recomendações de quem mora perto. Tudo em um só lugar, sem perder tempo.</p><SearchBar value={query} onChange={setQuery} onSubmit={submit} /><div className="filter-row" aria-label="Filtros rápidos">{["Todos", "SOS 24h", "Verificados", "Melhores", "Perto de mim"].map((filter, index) => <button key={filter} className={`filter-chip ${activeFilter === filter ? "active" : ""}`} onClick={() => { setActiveFilter(filter); if (filter === "Perto de mim") notify("Mostrando profissionais em até 5 km de Porto Feliz"); }}><span className={`dot ${index === 1 ? "red" : index === 2 ? "cyan" : index === 3 ? "amber" : ""}`} />{filter}</button>)}</div></div><div className="hero-metric"><div className="metric-number">24.8k<span style={{ color: "var(--lime)" }}>+</span></div><div className="metric-label">profissionais e lojas ativos em comunidades locais</div><div style={{ display: "flex", gap: 7, marginTop: 20, alignItems: "center", color: "var(--lime)", fontSize: 11 }}><LocateFixed size={14} /> Porto Feliz, SP <ChevronRight size={13} /></div></div></div></section>

      <section className="container"><div className="section-heading"><div><h2>Resolve perto de você</h2><p>Disponíveis agora em Porto Feliz e região</p></div><Link href="/buscar" className="section-link">Ver todos <ArrowRight size={14} /></Link></div><div className="profile-grid">{filtered.slice(0, 3).map(person => <ProfessionalCard key={person.slug} person={person} onNotify={notify} />)}</div></section>

      <section className="container discovery-band"><div className="signal-card glass-card"><div className="eyebrow">Modo plantão</div><h3>Problema urgente? Tem alguém online.</h3><p>Ative SOS 24h e encontre profissionais que assumem chamados agora, noite ou fim de semana.</p><button className="signal-cta" onClick={() => { setActiveFilter("SOS 24h"); window.scrollTo({ top: 280, behavior: "smooth" }); }}>Encontrar atendimento <Zap size={14} /></button></div><div className="community-strip glass-card"><div><div className="eyebrow">Sua comunidade indica</div><h3>Quem o seu bairro recomenda</h3><p>248 moradores no Alvorada já salvaram seus favoritos.</p><Link href="/comunidades" className="signal-cta">Explorar rede <ArrowRight size={14} /></Link></div><div className="mini-avatars"><img className="mini-avatar" src="https://i.pravatar.cc/70?img=49" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=12" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=47" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=32" alt="" /></div></div></section>

      <section className="container"><div className="section-heading"><div><h2>Descubra por categoria</h2><p>Atalhos para o que as pessoas mais procuram</p></div></div><div className="filter-row" style={{ marginTop: 0 }}>{["Casa & manutenção", "Auto", "Beleza", "Pet", "Aulas", "Eventos", "Tecnologia"].map(item => <button className="filter-chip" key={item} onClick={() => { setQuery(item); navigate(`/buscar?q=${encodeURIComponent(item)}`); }}>{item} <ArrowRight size={12} /></button>)}</div></section>

      <section className="container" style={{ marginTop: 25 }}><div className="section-heading"><div><h2>Como o LE.FIND funciona</h2><p>Menos busca. Mais confiança para fechar.</p></div></div><div className="profile-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>{[{ icon: Search, title: "Busque local", text: "Digite o que você precisa e filtre por bairro, distância ou disponibilidade." }, { icon: ShieldCheck, title: "Escolha com confiança", text: "Veja avaliações, selos e recomendações de quem já contratou." }, { icon: MessageCircle, title: "Chame direto", text: "Converse no WhatsApp, combine o serviço e avalie depois." }].map(({ icon: Icon, title, text }, index) => <div className="glass-card" key={title} style={{ padding: 20 }}><div className="card-icon" style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 12, background: index === 1 ? "rgba(114,242,228,.1)" : "rgba(200,255,53,.1)", color: index === 1 ? "var(--cyan)" : "var(--lime)" }}><Icon size={18} /></div><h3 style={{ margin: "17px 0 6px", fontSize: 15 }}>{title}</h3><p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.6, margin: 0 }}>{text}</p></div>)}</div></section>
    </main>{toast && <div className="toast" role="status">{toast}</div>}
  </AppShell>;
}
