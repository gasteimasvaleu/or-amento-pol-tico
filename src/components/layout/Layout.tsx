import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

const LOGO_URL = "https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/logonavbar.png";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-12 flex items-center border-b border-border bg-card sticky top-0 z-50 px-4">
          <NavLink to="/" className="flex items-center">
            <img src={LOGO_URL} alt="Mandato Intelligence" className="h-8" />
          </NavLink>
        </header>
        <main className="flex-1 flex flex-col px-4 py-4 pb-20 overflow-visible">
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
