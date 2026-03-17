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
      <div className="flex flex-col h-full">
        <header
          className="fixed top-0 left-0 right-0 z-50 flex items-center border-b border-border bg-card px-4 pt-[env(safe-area-inset-top)] pb-2"
          style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform' }}
        >
          <NavLink to="/" className="flex items-center">
            <img src={LOGO_URL} alt="Mandato Intelligence" className="h-8" />
          </NavLink>
        </header>
        <main className="flex-1 flex flex-col px-4 py-4 pb-24 mt-[calc(env(safe-area-inset-top)+3rem)]">
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
