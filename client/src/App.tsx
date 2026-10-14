import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SearchPage from "./pages/Search";
import ProfilePage from "./pages/Profile";
import CommunitiesPage from "./pages/Communities";
import StoresPage from "./pages/Stores";
import ReportsPage from "./pages/Reports";
import DashboardPage from "./pages/Dashboard";
import CommunityDetailPage from "./pages/CommunityDetail";
import ReportDetailPage from "./pages/ReportDetail";
import { Route, Switch } from "wouter";

function NotFound() {
  return <main className="page container"><div className="glass-card" style={{ maxWidth: 560, margin: "10vh auto", padding: 30, textAlign: "center" }}><div className="eyebrow">404 · sinal perdido</div><h1 style={{ fontSize: 42, letterSpacing: "-.07em" }}>Essa rota saiu do mapa.</h1><p style={{ color: "var(--muted)", lineHeight: 1.6 }}>Volte para o início e encontre alguém que resolve.</p><a href="/" className="primary-button">Voltar para o início</a></div></main>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Switch><Route path="/" component={Home} /><Route path="/buscar" component={SearchPage} /><Route path="/profissional/:slug" component={ProfilePage} /><Route path="/br/:city/:slug" component={ProfilePage} /><Route path="/comunidades" component={CommunitiesPage} /><Route path="/comunidade/:slug" component={CommunityDetailPage} /><Route path="/lojas" component={StoresPage} /><Route path="/relatorios" component={ReportsPage} /><Route path="/relatorios/:slug" component={ReportDetailPage} /><Route path="/painel" component={DashboardPage} /><Route component={NotFound} /></Switch></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
