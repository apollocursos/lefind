import { BadgeCheck, Ban, CheckCircle2, Gift, RefreshCw, ShieldAlert, Users, Megaphone } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/AppShell";
import AccessGate from "@/components/AccessGate";
import { trpc } from "@/lib/trpc";
import { t, useLocale } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";

type Entry = { targetKey: string; kind: "gold" | "sponsored_spot"; status: string; source: string; manualOverride?: string };
const demoEntries: Entry[] = [
  { targetKey: "profile:carlos-piscineiro", kind: "gold", status: "active", source: "payment", manualOverride: "none" },
  { targetKey: "store:1", kind: "sponsored_spot", status: "active", source: "manual", manualOverride: "grant" },
];

export default function AdminPage() {
  const locale = useLocale();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const entitlements = trpc.admin.entitlements.useQuery(undefined, { retry: false, enabled: isAdmin });
  const ambassadors = trpc.admin.ambassadors.useQuery(undefined, { retry: false, enabled: isAdmin });
  const utils = trpc.useUtils();
  const override = trpc.admin.override.useMutation({ onSuccess: () => utils.admin.entitlements.invalidate() });
  const [localEntries, setLocalEntries] = useState<Entry[]>(demoEntries);
  const [tab, setTab] = useState<"access" | "ambassadors">("access");
  const entries = (entitlements.data as Entry[] | undefined) ?? localEntries;
  useEffect(() => { if (entitlements.data) setLocalEntries(entitlements.data as Entry[]); }, [entitlements.data]);
  const runOverride = (entry: Entry, action: "grant" | "revoke") => {
    const isGold = entry.kind === "gold";
    const profileSlug = isGold ? String(entry.targetKey).replace("profile:", "") : undefined;
    const storeId = !isGold ? Number(String(entry.targetKey).replace("store:", "")) || undefined : undefined;
    override.mutate({ kind: entry.kind, profileSlug, storeId, action, reason: action === "grant" ? "Cortesia concedida pelo ADM" : "Cancelamento manual pelo ADM" }, {
      onError: () => setLocalEntries(current => current.map(item => item.targetKey === entry.targetKey ? { ...item, status: action === "grant" ? "active" : "revoked", source: "manual", manualOverride: action } : item)),
    });
  };
  return <AccessGate adminOnly><AppShell><PageHeader eyebrow={t("Controle administrativo", locale)} title={t("Painel ADM", locale)} description="Pagamentos aprovados ativam automaticamente. O ADM mantém controle manual de cortesia, banners e cancelamentos." action={<Link href="/painel" className="secondary-button">{t("Voltar ao painel", locale)}</Link>} /><main className="container page" style={{ paddingTop: 0 }}>
    <section className="admin-automation-banner glass-card"><div className="admin-banner-icon"><RefreshCw size={20} /></div><div><div className="eyebrow">{t("Automação ativa", locale)}</div><h2>Pix/Cartão → webhook → banco → status publicado</h2><p>Modo operacional: quando o banco não responde, o painel usa dados locais de contingência e mantém os controles manuais disponíveis.</p></div></section>
    <div className="admin-tabs"><button className={tab === "access" ? "active" : ""} onClick={() => setTab("access")}><ShieldAlert size={15} /> Painel de Administração</button><button className={tab === "ambassadors" ? "active" : ""} onClick={() => setTab("ambassadors")}><Users size={15} /> {t("Embaixadores", locale)}</button></div>
    {tab === "ambassadors" ? <section className="admin-list glass-card"><div className="section-heading"><div><h2>{t("Embaixadores", locale)}</h2><p>Origem dos cadastros por código de indicação.</p></div><Users size={18} color="var(--cyan)" /></div>{(ambassadors.data ?? [{ code: "LEFIND10", name: "Programa LE.FIND", referralCount: 0 }]).map((item: any) => <article className="admin-entitlement" key={item.code}><div className="admin-entitlement-main"><div className="admin-entitlement-icon"><Megaphone size={17} /></div><div><strong>{item.name}</strong><span>#{item.code}</span></div></div><span className="status-pill active">{item.referralCount ?? 0} {t("Indicados", locale)}</span></article>)}</section> : <section className="admin-list glass-card"><div className="section-heading"><div><h2>Painel de Administração</h2><p>Fonte “pagamento” é automática; fonte “manual” é sobreposição do ADM.</p></div><ShieldAlert size={18} color="var(--amber)" /></div>{entitlements.isLoading ? <div className="contingency-note"><RefreshCw size={16} /> Carregando dados… controles de contingência ativos.</div> : null}{entries.map(entry => <article className="admin-entitlement" key={entry.targetKey}><div className="admin-entitlement-main"><div className="admin-entitlement-icon">{entry.kind === "gold" ? <BadgeCheck size={17} /> : <Gift size={17} />}</div><div><strong>{entry.targetKey}</strong><span>{entry.kind === "gold" ? t("Profissional Ouro", locale) : t("Anúncio Ativo", locale)} · origem {entry.source}</span></div></div><div className="admin-entitlement-status"><span className={`status-pill ${entry.status === "active" ? "active" : "revoked"}`}>{entry.status === "active" ? t("Ativo", locale) : t("Revogado", locale)}</span><button className="secondary-button" onClick={() => runOverride(entry, "grant")} disabled={override.isPending}><CheckCircle2 size={14} /> {t("Cortesia", locale)}</button><button className="secondary-button danger-button" onClick={() => runOverride(entry, "revoke")} disabled={override.isPending}><Ban size={14} /> {t("Cancelar", locale)}</button></div></article>)}</section>}
  </main></AppShell></AccessGate>;
}
