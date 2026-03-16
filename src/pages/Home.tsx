import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Receipt, CalendarDays, ArrowRight, ImageIcon, LifeBuoy } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const quickCards = [
  {
    title: "Minhas Despesas",
    badges: ["Listagem", "Filtros"],
    icon: Receipt,
    route: "/despesas",
    bg: "bg-blue-500",
  },
  {
    title: "Agenda",
    badges: ["Compromissos", "Calendário"],
    icon: CalendarDays,
    route: "/agenda",
    bg: "bg-purple-500",
  },
  {
    title: "Mídia",
    badges: ["Galeria", "Artes"],
    icon: ImageIcon,
    route: "/midia",
    bg: "bg-amber-500",
  },
  {
    title: "Suporte",
    badges: ["Ajuda", "Recursos"],
    icon: LifeBuoy,
    route: "/suporte",
    bg: "bg-rose-500",
  },
];

const CARD_HEIGHT = 160;
const CARD_OVERLAP = 80;

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showSplash, setShowSplash] = useState(false);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "Usuário";

  useEffect(() => {
    if (isMobile && !sessionStorage.getItem("splashShown")) {
      setShowSplash(true);
      sessionStorage.setItem("splashShown", "1");
      const timer = setTimeout(() => setShowSplash(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <video
          src="https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/splash1.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => setShowSplash(false)}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => setShowSplash(false)}
          className="absolute bottom-8 right-6 text-white/60 text-sm border border-white/30 rounded-full px-4 py-1.5 backdrop-blur-sm"
        >
          Pular
        </button>
      </div>
    );
  }
  const stackHeight = CARD_HEIGHT + (quickCards.length - 1) * CARD_OVERLAP;

  return (
    <Layout>
      <div className="flex flex-col flex-1 h-full">
        <img
          src="https://wrriittiqsmzbapbrcwm.supabase.co/storage/v1/object/public/criativos/banner1.png"
          alt="Banner"
          className="w-full aspect-video object-cover rounded-2xl mb-4 border border-border"
        />
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Olá, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground">Acesso rápido</p>
        </div>

        <div className="mt-auto relative mb-[-5rem]" style={{ height: stackHeight }}>
          {quickCards.map((card, index) => (
            <button
              key={card.route}
              onClick={() => navigate(card.route)}
              className={`${card.bg} rounded-2xl p-5 flex items-start justify-between text-left transition-transform active:scale-[0.98] absolute left-0 right-0 shadow-lg`}
              style={{
                top: index * CARD_OVERLAP,
                zIndex: index + 1,
                height: CARD_HEIGHT,
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <card.icon className="h-5 w-5 text-white/90" />
                  <span className="text-lg font-bold text-white">{card.title}</span>
                </div>
                <div className="flex gap-2">
                  {card.badges.map((badge) => (
                    <span
                      key={badge}
                      className="text-[11px] font-medium text-white/90 border border-white/40 rounded-full px-2.5 py-0.5"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-black/80 rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
