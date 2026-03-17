import { Home, LayoutDashboard, Receipt, CalendarDays, Menu, X, LogOut, ImageIcon, LifeBuoy, Newspaper, Vote, Users, Building2, Heart } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Início", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Despesas", url: "/despesas", icon: Receipt },
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
];

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMoreOpen(false)} />
      )}

      {moreOpen && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl p-4 space-y-1 animate-in slide-in-from-bottom-4">
          <NavLink
            to="/midia"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
          >
            <ImageIcon className="h-5 w-5" />
            <span>Mídia</span>
          </NavLink>
          <NavLink
            to="/suporte"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
          >
            <LifeBuoy className="h-5 w-5" />
            <span>Suporte</span>
          </NavLink>
          <NavLink
            to="/noticias"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
          >
            <Newspaper className="h-5 w-5" />
            <span>Notícias</span>
          </NavLink>
          <NavLink
            to="/dados-eleitorais"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
          >
            <Vote className="h-5 w-5" />
            <span>Dados Eleitorais</span>
          </NavLink>
          <NavLink
            to="/gestao-de-eleitores"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
          >
            <Users className="h-5 w-5" />
            <span>Gestão de Eleitores</span>
          </NavLink>
          <NavLink
            to="/gestao-de-cidades"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors w-full"
          >
            <Building2 className="h-5 w-5" />
            <span>Cidades</span>
          </NavLink>
          <button
            onClick={() => { setMoreOpen(false); signOut(); }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-muted transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {mainItems.map((item) => {
            const isActive = item.url === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.url);

            return (
              <NavLink
                key={item.url}
                to={item.url}
                end={item.url === "/"}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
              >
                <item.icon
                  className={cn("h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")}
                />
                <span
                  className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground")}
                >
                  {item.title}
                </span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          >
            {moreOpen ? (
              <X className="h-5 w-5 text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-muted-foreground" />
            )}
            <span className={cn("text-[10px] font-medium", moreOpen ? "text-primary" : "text-muted-foreground")}>
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
