import { BadgeCheck, Ban, CheckCircle2, Gift, LockKeyhole, RefreshCw, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { AppShell, PageHeader } from "@/components/AppShell";
import { trpc } from "@/lib/trpc";

export default function AdminPage() {
  const entitlements = trpc.admin.entitlements.useQuery();
  const utils = trpc.useUtils();
  const override = trpc.admin.override.useMutation({ onSuccess: () => utils.admin.entitlements.invalidate() });
  const runOverride = (entry: any, action: "grant" | "revoke") => {
    const isGold = entry.kind === "gold";
    const profileSlug = isGold ? String(entry.targetKey).replace("profile:", "") : undefined;
    const storeId = !isGold ? Number(String(entry.targetKey).replace("store:", "")) || undefined : undefined;
    override.mutate({ kind: entry.kind, profileSlug, storeId, action, reason: action === "grant" ? "Cortesia concedida pelo ADM" : "Cancelamento manual pelo ADM" });
  };

  return <AppShell><PageHeader eyebrow="Controle administrativo" title="Entitlements sob controle." description="Pagamentos aprovados ativam automaticamente. O ADM só intervém para cortesia, revisão ou cancelamento." action={<Link href="/painel" className="secondary-button">Voltar ao painel</Link>} /><main className="container page" style={{ paddingTop: 0 }}><section className="admin-automation-banner glass-card"><div className="admin-banner-icon"><RefreshCw size={20} /></div><div><div className="eyebrow">Automação ativa</div><h2>Pix/Cartão → webhook → banco → status publicado</h2><p>Eventos Stripe são validados por assinatura, deduplicados por eventId e só então ativam Ouro ou Anúncio Ativo.</p></div></section>{entitlements.error ? <section className="glass-card admin-lock"><LockKeyhole size={28} /><h2>Acesso ADM necessário</h2><p>Entre com uma conta com role <strong>admin</strong> para conceder selos cortesia ou cancelar um entitlement.</p><Link href="/" className="primary-button">Voltar ao início</Link></section> : <section className="admin-list glass-card"><div className="section-heading"><div><h2>Entitlements</h2><p>Fonte “pagamento” é automática; fonte “manual” é sobreposição do ADM.</p></div><ShieldAlert size={18} color="var(--amber)" /></div>{entitlements.isLoading ? <p className="panel-kicker">Carregando dados do banco...</p> : entitlements.data?.map((entry: any) => <article className="admin-entitlement" key={entry.targetKey}><div className="admin-entitlement-main"><div className="admin-entitlement-icon">{entry.kind === "gold" ? <BadgeCheck size={17} /> : <Gift size={17} />}</div><div><strong>{entry.targetKey}</strong><span>{entry.kind === "gold" ? "Profissional Ouro" : "Anúncio Ativo"} · origem {entry.source}</span></div></div><div className="admin-entitlement-status"><span className={`status-pill ${entry.status === "active" ? "active" : "revoked"}`}>{entry.status === "active" ? "Ativo" : "Revogado"}</span><button className="secondary-button" onClick={() => runOverride(entry, "grant")} disabled={override.isPending}><CheckCircle2 size={14} /> Cortesia</button><button className="secondary-button danger-button" onClick={() => runOverride(entry, "revoke")} disabled={override.isPending}><Ban size={14} /> Cancelar</button></div></article>)}</section>}</main></AppShell>;
}
