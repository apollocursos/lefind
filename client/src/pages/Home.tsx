import { ArrowRight, Check, ChevronRight, LocateFixed, Mail, MessageCircle, Search, ShieldCheck, Star, Store, Users, Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/AppShell";
import { getSosStatus, professionals, type Availability } from "@/lib/data";

function availabilityLabel(value: Availability) {
  if (value === "open") return "Agenda aberta";
  if (value === "next") return "Próxima semana";
  return "Agenda lotada";
}

export function ProfessionalCard({ person }: { person: typeof professionals[number] }) {
  const [, navigate] = useLocation();
  const sosEnabled = getSosStatus(person.slug, person.sos);
  const whatsappUrl = `https://wa.me/${person.whatsapp}?text=${encodeURIComponent(`Olá, ${person.name.split(" ")[0]}! Encontrei seu perfil no LE.FIND.`)}`;
  return <article className="profile-card glass-card" onClick={() => navigate(`/${person.slug}`)} role="link" tabIndex={0} onKeyDown={event => event.key === "Enter" && navigate(`/${person.slug}`)}>
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
  const [merchantLead, setMerchantLead] = useState({ name: "", city: "Porto Feliz", contact: "" });
  const filtered = useMemo(() => professionals.filter(person => {
    const q = query.toLowerCase();
    const matchesQuery = !q || `${person.name} ${person.role} ${person.city} ${person.neighborhood} ${person.tags.join(" ")}`.toLowerCase().includes(q);
    const matchesFilter = activeFilter === "Todos" || (activeFilter === "SOS 24h" && getSosStatus(person.slug, person.sos)) || (activeFilter === "Verificados" && person.verified) || (activeFilter === "Melhores" && person.rating >= 4.9) || (activeFilter === "Perto de mim" && parseFloat(person.distance.replace(",", ".")) <= 5);
    return matchesQuery && matchesFilter;
  }).slice(0, 6), [query, activeFilter]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3200); };
  const submit = () => { if (query.trim()) navigate(`/buscar?q=${encodeURIComponent(query)}`); else notify("Digite uma profissão, produto ou bairro para começar"); };
  const captureMerchant = (event: FormEvent) => { event.preventDefault(); if (!merchantLead.name || !merchantLead.contact) return notify("Informe seu nome e WhatsApp para receber o contato comercial"); notify(`Obrigado, ${merchantLead.name.split(" ")[0]}! Vamos preparar sua vitrine em ${merchantLead.city}.`); setMerchantLead(current => ({ ...current, name: "", contact: "" })); };

  return <AppShell>
    <main>
      <section className="hero hero-conversion"><div className="container hero-grid"><div><div className="eyebrow">A rede local que resolve</div><h1>Encontre quem faz <span>acontecer.</span></h1><p className="hero-copy">Profissionais confiáveis, lojas do seu bairro e recomendações de quem mora perto. Tudo em um só lugar, sem perder tempo.</p><div className="hero-cta-row"><Link href="/painel" className="primary-button">Sou profissional · Criar perfil <ArrowRight size={15} /></Link><Link href="/buscar" className="secondary-button">Encontrar serviço <Search size={15} /></Link></div><div className="hero-proof"><div className="mini-avatars"><img className="mini-avatar" src="https://i.pravatar.cc/70?img=12" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=47" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=68" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=32" alt="" /></div><div><strong>24,8 mil profissionais ativos</strong><span>4,9/5 de satisfação média na rede</span></div><div className="rating hero-rating">★ 4.9</div></div><SearchBar value={query} onChange={setQuery} onSubmit={submit} /><div className="filter-row" aria-label="Filtros rápidos">{["Todos", "SOS 24h", "Verificados", "Melhores", "Perto de mim"].map((filter, index) => <button key={filter} className={`filter-chip ${activeFilter === filter ? "active" : ""}`} onClick={() => { setActiveFilter(filter); if (filter === "Perto de mim") notify("Mostrando profissionais em até 5 km de Porto Feliz"); }}><span className={`dot ${index === 1 ? "red" : index === 2 ? "cyan" : index === 3 ? "amber" : ""}`} />{filter}</button>)}</div></div><div className="hero-side-card glass-card"><div className="eyebrow">Porto Feliz · agora</div><div className="hero-side-number">18 <span>profissionais disponíveis</span></div><div className="hero-side-status"><span className="status-dot open" /> 7 assumem chamados SOS neste momento</div><Link href="/buscar?q=SOS%2024h" className="signal-cta">Ver plantão local <ArrowRight size={14} /></Link><div className="hero-side-orbit"><LocateFixed size={20} /><span>rede viva<br /><b>perto de você</b></span></div></div></div></section>

      <section className="container conversion-guarantees"><div className="section-heading"><div><div className="eyebrow">Por que a rede cresce</div><h2>Feito para fechar com confiança.</h2></div></div><div className="guarantee-grid">{[{ icon: Check, title: "Zero comissões", text: "O contacto é direto. O valor do seu serviço continua com você." }, { icon: MessageCircle, title: "Contacto direto", text: "WhatsApp, telefone ou mensagem sem intermediários e sem espera." }, { icon: ShieldCheck, title: "Avaliações reais", text: "Escolha com sinais de confiança de clientes e comunidades locais." }].map(({ icon: Icon, title, text }) => <article className="guarantee-card glass-card" key={title}><div className="card-icon"><Icon size={18} /></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="container"><div className="section-heading"><div><h2>Resolve perto de você</h2><p>Disponíveis agora em Porto Feliz e região</p></div><Link href="/buscar" className="section-link">Ver todos <ArrowRight size={14} /></Link></div><div className="profile-grid">{filtered.slice(0, 3).map(person => <ProfessionalCard key={person.slug} person={person} />)}</div></section>

      <section className="container merchant-capture glass-card"><div className="merchant-copy"><div className="eyebrow">Para lojistas da cidade</div><h2>Faça sua loja aparecer quando alguém estiver pronto para comprar.</h2><p>Crie uma vitrine local, destaque produtos e apareça no topo das buscas relacionadas à sua categoria.</p><div className="merchant-points"><span><Store size={14} /> Vitrine por cidade</span><span><Users size={14} /> Alcance por bairro</span><span><Zap size={14} /> Spot patrocinado</span></div></div><form className="merchant-form" onSubmit={captureMerchant}><div className="form-label">Quero anunciar em LE.FIND</div><input aria-label="Nome da loja" placeholder="Nome da loja" value={merchantLead.name} onChange={event => setMerchantLead({ ...merchantLead, name: event.target.value })} /><select aria-label="Cidade" value={merchantLead.city} onChange={event => setMerchantLead({ ...merchantLead, city: event.target.value })}><option>Porto Feliz</option><option>Boituva</option><option>Sorocaba</option><option>Minha cidade</option></select><input aria-label="WhatsApp ou e-mail" placeholder="WhatsApp ou e-mail" value={merchantLead.contact} onChange={event => setMerchantLead({ ...merchantLead, contact: event.target.value })} /><button className="primary-button" type="submit">Quero anunciar <ArrowRight size={14} /></button><small><Mail size={12} /> Retorno comercial sem compromisso.</small></form></section>

      <section className="container discovery-band"><div className="signal-card glass-card"><div className="eyebrow">Modo plantão</div><h3>Problema urgente? Tem alguém online.</h3><p>Ative SOS 24h e encontre profissionais que assumem chamados agora, noite ou fim de semana.</p><button className="signal-cta" onClick={() => { setActiveFilter("SOS 24h"); window.scrollTo({ top: 280, behavior: "smooth" }); }}>Encontrar atendimento <Zap size={14} /></button></div><div className="community-strip glass-card"><div><div className="eyebrow">Sua comunidade indica</div><h3>Quem o seu bairro recomenda</h3><p>248 moradores no Alvorada já salvaram seus favoritos.</p><Link href="/comunidades" className="signal-cta">Explorar rede <ArrowRight size={14} /></Link></div><div className="mini-avatars"><img className="mini-avatar" src="https://i.pravatar.cc/70?img=49" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=12" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=47" alt="" /><img className="mini-avatar" src="https://i.pravatar.cc/70?img=32" alt="" /></div></div></section>

      <section className="container"><div className="section-heading"><div><h2>Descubra por categoria</h2><p>Atalhos para o que as pessoas mais procuram</p></div></div><div className="filter-row" style={{ marginTop: 0 }}>{["Casa & manutenção", "Auto", "Beleza", "Pet", "Aulas", "Eventos", "Tecnologia"].map(item => <button className="filter-chip" key={item} onClick={() => { setQuery(item); navigate(`/buscar?q=${encodeURIComponent(item)}`); }}>{item} <ArrowRight size={12} /></button>)}</div></section>
    </main>{toast && <div className="toast" role="status">{toast}</div>}
  </AppShell>;
}
