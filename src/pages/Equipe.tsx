import { Layout } from "@/components/layout/Layout";
import { useNavigate } from "react-router-dom";
import { Users, Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const equipeCards = [
  {
    title: "Assessores",
    description: "Gerencie sua equipe de assessores",
    icon: Users,
    url: "/assessores",
  },
  {
    title: "Apoiadores",
    description: "Gerencie seus apoiadores e colaboradores",
    icon: Heart,
    url: "/apoiadores",
  },
];

export default function Equipe() {
  const navigate = useNavigate();

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Equipe</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {equipeCards.map((card) => (
          <Card
            key={card.url}
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate(card.url)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <card.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </Layout>
  );
}
