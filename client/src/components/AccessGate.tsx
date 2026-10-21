import { ShieldCheck, UserRound, LogIn, UserPlus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type AccessGateProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export default function AccessGate({ children, adminOnly = false }: AccessGateProps) {
  const { loading, user } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const login = trpc.auth.loginLocal.useMutation();
  const register = trpc.auth.registerLocal.useMutation();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    try {
      if (mode === "register") await register.mutateAsync(form);
      else await login.mutateAsync({ email: form.email, password: form.password });
      await utils.auth.me.invalidate();
      navigate("/painel");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível concluir o acesso.");
    }
  };

  if (loading) {
    return <AppShell><main className="page container"><section className="access-card glass-card" aria-live="polite"><div className="access-icon"><UserRound size={24} /></div><h1>Verificando seu acesso</h1><p>Um instante. Estamos conferindo sua sessão com segurança.</p></section></main></AppShell>;
  }

  if (!user) {
    const pending = login.isPending || register.isPending;
    return <AppShell><main className="page container"><section className="access-card glass-card"><div className="access-icon">{mode === "login" ? <LogIn size={24} /> : <UserPlus size={24} />}</div><div className="eyebrow">Área do prestador</div><h1>{mode === "login" ? "Entrar no painel" : "Criar acesso"}</h1><p>Use seu e-mail e uma senha. O cadastro fica protegido no banco LE.FIND; visitantes continuam livres para buscar e chamar profissionais.</p><form className="access-form" onSubmit={submit}>{mode === "register" && <label className="modal-label">Seu nome<input className="modal-input" required minLength={2} maxLength={160} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Ex.: Ana Oliveira" /></label>}<label className="modal-label">E-mail<input className="modal-input" required type="email" autoComplete="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="voce@email.com" /></label><label className="modal-label">Senha<input className="modal-input" required type="password" minLength={8} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Mínimo de 8 caracteres" /></label><button className="primary-button access-button" disabled={pending} type="submit">{pending ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar acesso"}</button></form><button className="secondary-button access-button" type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setLoginError(""); }}>{mode === "login" ? "Ainda não tenho acesso" : "Já tenho acesso"}</button><Link href="/buscar" className="access-link">Continuar buscando sem cadastro</Link>{loginError && <p className="access-error" role="alert">{loginError}</p>}</section></main></AppShell>;
  }

  if (adminOnly && user.role !== "admin") {
    return <AppShell><main className="page container"><section className="access-card glass-card"><div className="access-icon amber"><ShieldCheck size={24} /></div><div className="eyebrow">Acesso restrito</div><h1>Painel de Administração</h1><p>Esta área está disponível somente para usuários autorizados pela equipe LE.FIND.</p><Link href="/painel" className="primary-button access-button">Voltar ao meu painel</Link></section></main></AppShell>;
  }

  return <>{children}</>;
}
