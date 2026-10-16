import { Bell, Compass, LayoutDashboard, MapPin, Search, Users, Store, Plus, X, LogIn, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState, type ReactNode } from "react";
import { getStoredLocale, initLocale, localeNames, navLabels, setLocale, t, translateDocument, useLocale, type Locale } from "@/lib/i18n";
import { startLogin } from "@/const";

const navItems = [
  { href: "/", label: "Início", icon: Compass }, { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/comunidades", label: "Rede", icon: Users }, { href: "/lojas", label: "Lojas", icon: Store }, { href: "/painel", label: "Painel", icon: LayoutDashboard },
];

export function Brand() { return <Link href="/" className="brand" aria-label="LE.FIND início"><span className="brand-mark">LE.</span><span className="brand-word">FIND</span></Link>; }

export function Header({ onNotify }: { onNotify?: (message: string) => void }) {
  const [locale, setCurrentLocale] = useState<Locale>(getStoredLocale);
  const [, navigate] = useLocation();
  useLocale();
  useEffect(() => { initLocale(); }, []);
  useEffect(() => { document.documentElement.lang = locale; translateDocument(locale); }, [locale]);
  const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href);
  const location = useLocation()[0];
  const changeLocale = (next: Locale) => { setCurrentLocale(next); setLocale(next); onNotify?.(`${t("Idioma alterado para", next)} ${localeNames[next]}`); };
  const login = () => { try { startLogin(); } catch (error) { onNotify?.(error instanceof Error ? error.message : "Não foi possível iniciar o login."); } };
  return <header className="site-header"><div className="container header-inner">
    <Brand /><nav className="desktop-nav" aria-label="Navegação principal">{navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={isActive(href) ? "active" : ""}><Icon size={16} />{t(label, locale)}</Link>)}</nav>
    <div className="header-actions"><select className="locale-select" value={locale} onChange={event => changeLocale(event.target.value as Locale)} aria-label="Idioma"><option value="pt-BR">PT</option><option value="en">EN</option><option value="es">ES</option></select>
      <button className="header-login" onClick={login}><LogIn size={15} />{t("Entrar", locale)}</button><Link className="header-signup" href="/painel"><UserPlus size={15} />{t("Cadastrar Profissional", locale)}</Link>
      <button className="icon-button" aria-label={t("Mudar localização", locale)} onClick={() => onNotify?.("Localização atual: Porto Feliz, SP")}><MapPin size={17} /></button>
      <button className="icon-button" aria-label={t("Notificações", locale)} onClick={() => onNotify?.("Você tem 3 novas recomendações na sua região")}><Bell size={17} /></button>
    </div>
  </div></header>;
}

export function BottomNav() { const [location] = useLocation(); const locale = useLocale(); const isActive = (href: string) => href === "/" ? location === "/" : location.startsWith(href); return <nav className="bottom-nav" aria-label="Navegação principal">{navItems.map(({ href, icon: Icon }, index) => <Link key={href} href={href} className={`nav-item ${isActive(href) ? "active" : ""}`}><Icon /><span>{t(navItems[index].label, locale)}</span></Link>)}</nav>; }

export function AppShell({ children, onNotify }: { children: ReactNode; onNotify?: (message: string) => void }) { const [toast, setToast] = useState(""); const notify = (message: string) => { setToast(message); onNotify?.(message); window.setTimeout(() => setToast(""), 3200); }; return <div className="app-shell"><Header onNotify={notify} />{children}<BottomNav />{toast && <div className="toast" role="status">{toast}</div>}</div>; }
export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <section className="inner-hero"><div className="container"><div className="eyebrow">{eyebrow}</div><div className="section-heading" style={{ marginBottom: 0 }}><div><h1>{title}</h1><p>{description}</p></div>{action}</div></div></section>; }
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal-card glass-card" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={16} /></button></div>{children}</div></div>; }
export function CreateButton({ onClick, children }: { onClick: () => void; children: ReactNode }) { return <button className="primary-button" onClick={onClick}><Plus size={15} />{children}</button>; }
