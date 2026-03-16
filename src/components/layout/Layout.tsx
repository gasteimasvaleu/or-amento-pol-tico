import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Landmark } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-12 flex items-center border-b border-border bg-card sticky top-0 z-50 px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Landmark className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">Unale</span>
          </NavLink>
        </header>
        <main className="flex-1 px-4 py-4 pb-[calc(4rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b border-border bg-card sticky top-0 z-50">
            <SidebarTrigger className="ml-2" />
          </header>
          <main className="flex-1 container mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
