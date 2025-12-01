import { Link } from "react-router-dom";
import { FileText, Plus, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Política</h1>
              <p className="text-xs text-muted-foreground">Controle de Despesas</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/historico" className="gap-2">
                <FileText className="h-4 w-4" />
                Histórico
              </Link>
            </Button>
            <Button asChild>
              <Link to="/nova-despesa" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Despesa
              </Link>
            </Button>
          </nav>

          <Button asChild className="md:hidden">
            <Link to="/nova-despesa">
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
