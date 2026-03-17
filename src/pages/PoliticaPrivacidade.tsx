import { Layout } from "@/components/layout/Layout";
import { Shield } from "lucide-react";

export default function PoliticaPrivacidade() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Política de Privacidade</h1>
        </div>

        <p className="text-sm text-muted-foreground">Última atualização: 17 de março de 2026</p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Coleta de Dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Coletamos informações pessoais que você nos fornece diretamente, como nome, e-mail, telefone e dados relacionados à sua atividade política. Também coletamos dados de uso automaticamente, como endereço IP, tipo de navegador e páginas acessadas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Uso dos Dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Utilizamos seus dados para: fornecer e manter nossos serviços; personalizar sua experiência; enviar comunicações relevantes; melhorar a plataforma; e cumprir obrigações legais. Seus dados de eleitores, apoiadores e assessores são armazenados de forma segura e acessíveis apenas por você.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Compartilhamento de Dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Podemos compartilhar dados com prestadores de serviço que nos auxiliam na operação da plataforma, sempre sob acordos de confidencialidade.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Cookies e Tecnologias</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Utilizamos cookies e tecnologias semelhantes para manter sua sessão ativa, lembrar suas preferências e analisar o uso da plataforma. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade do serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Segurança</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Adotamos medidas de segurança técnicas e organizacionais para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição. Utilizamos criptografia, controle de acesso e monitoramento contínuo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Seus Direitos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem direito a: acessar seus dados pessoais; solicitar correção de dados incompletos ou desatualizados; solicitar a exclusão de seus dados; revogar o consentimento; e solicitar a portabilidade dos dados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Retenção de Dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, salvo quando uma retenção mais longa for exigida ou permitida por lei.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para dúvidas, solicitações ou reclamações sobre esta Política de Privacidade ou o tratamento de seus dados, entre em contato conosco através do e-mail disponível na plataforma ou pelos canais de suporte.
          </p>
        </section>
      </div>
    </Layout>
  );
}
