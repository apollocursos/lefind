import { ShieldCheck, UserRound, LogIn } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

type AccessGateProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export default function AccessGate({ children, adminOnly = false }: AccessGateProps) {
  const { loading, user } = useAuth();
  const [loginError, setLoginError] = useState("");

  const login = () => {
    try {
      setLoginError("");
      startLogin();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível iniciar o login.");
    }
  };

  if (loading) {
    return <AppShell><main className="page container"><section className="access-card glass-card" aria-live="polite"><div className="access-icon"><UserRound size={24} /></div><h1>Verificando seu acesso</h1><p>Um instante. Estamos conferindo sua sessão com segurança.</p></section></main></AppShell>;
  }

  if (!user) {
    return <AppShell><main className="page container"><section className="access-card glass-card"><div className="access-icon"><LogIn size={24} /></div><div className="eyebrow">Área exclusiva</div><h1>Entre para continuar</h1><p>Visitantes podem buscar e chamar profissionais sem cadastro. Para criar seu cartão, ativar o SOS ou acompanhar contatos, entre com sua conta LE.FIND.</p><button className="primary-button access-button" onClick={login}><LogIn size={17} /> Entrar com segurança</button><Link href="/buscar" className="secondary-button access-button">Continuar buscando</Link>{loginError && <p className="access-error" role="alert">{loginError}</p>}</section></main></AppShell>;
  }

  if (adminOnly && user.role !== "admin") {
    return <AppShell><main className="page container"><section className="access-card glass-card"><div className="access-icon amber"><ShieldCheck size={24} /></div><div className="eyebrow">Acesso restrito</div><h1>Painel de Administração</h1><p>Esta área está disponível somente para usuários autorizados pela equipe LE.FIND.</p><Link href="/painel" className="primary-button access-button">Voltar ao meu painel</Link></section></main></AppShell>;
  }

  return <>{children}</>;
}
