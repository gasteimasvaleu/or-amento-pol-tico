import {
  Home,
  LayoutDashboard,
  Receipt,
  Plus,
  History,
  LogOut,
  ChevronDown,
  CalendarDays,
  ImageIcon,
  LifeBuoy,
  Newspaper,
  Vote,
  Users,
  Building2,
  Heart,
  Shield,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const despesasItems = [
  { title: "Painel", url: "/despesas", icon: Receipt },
  { title: "Nova Despesa", url: "/despesas/nova", icon: Plus },
  { title: "Histórico", url: "/despesas/historico", icon: History },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isDespesasActive = location.pathname.startsWith("/despesas");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <NavLink to="/" className="flex items-center group">
          <img
            src="https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/logonavbar.png"
            alt="Unale"
            className={collapsed ? "h-8" : "h-10"}
          />
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Home className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Início</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dashboard"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/agenda"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Agenda</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/midia"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Mídia</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/suporte"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Suporte</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/noticias"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Newspaper className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Notícias</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/equipe"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Equipe</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/dados-eleitorais"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Vote className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Dados Eleitorais</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/gestao-de-eleitores"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Gestão de Eleitores</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/gestao-de-cidades"
                    end
                    className="hover:bg-sidebar-accent/50"
                    activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {!collapsed && <span>Cidades</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Collapsible defaultOpen={isDespesasActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="cursor-pointer">
                      <Receipt className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">Despesas</span>
                          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {despesasItems.map((item) => (
                          <SidebarMenuSubItem key={item.url}>
                            <SidebarMenuSubButton asChild>
                              <NavLink
                                to={item.url}
                                end
                                className="hover:bg-sidebar-accent/50"
                                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                              >
                                <item.icon className="mr-2 h-3.5 w-3.5" />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground truncate mb-2">
            {user.email}
          </p>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="w-full justify-start gap-2"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
