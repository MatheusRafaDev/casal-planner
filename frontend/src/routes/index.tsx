import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMotionProps } from "@/hooks/use-reduced-motion";
import { Sparkles, Heart, Home, Wallet, Search, ShieldCheck, ArrowRight, Gift, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CasalPlanner - Casa nova, novos planos" },
      {
        name: "description",
        content:
          "Planeje seus cômodos, organize suas compras e acompanhe seu orçamento.",
      },
    ],
  }),
  component: Home_,
});

const features = [
  {
    icon: Home,
    title: "Por cômodo",
    desc: "Cozinha, sala, quarto... tudo separado, com meta e progresso próprios.",
  },
  {
    icon: Wallet,
    title: "VR + Dinheiro",
    desc: "Controle o que sai do vale-refeição e o que sai da conta corrente, sem misturar.",
  },
  {
    icon: Search,
    title: "Preços com IA",
    desc: "Digite o item, a IA corrige a marca e busca no Google Shopping filtrando lojas.",
  },
  {
    icon: Heart,
    title: "A dois ou solo",
    desc: "Conta individual ou de casal, com dois logins no mesmo planejamento.",
  },
];

type Feature = (typeof features)[number];

function FeatureCard({ f, i }: { f: Feature; i: number }) {
  const anim = useMotionProps({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, delay: i * 0.08 },
  });
  return (
    <motion.div {...anim} className="p-6 md:p-8 rounded-2xl border border-border/50 bg-card/50">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-muted mb-5">
        <f.icon className="h-5 w-5 text-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight mb-2 text-foreground">{f.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
    </motion.div>
  );
}

function Home_() {
  const heroText = useMotionProps({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  });
  const heroCard = useMotionProps({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.2 },
  });
  
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans">
      {/* Header */}
      <header
        className="bg-background border-b border-border/40 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="CasalPlanner" className="h-8 w-8 rounded-md" />
            <span className="text-lg font-semibold tracking-tight">CasalPlanner</span>
          </div>
          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground text-sm font-medium px-4 h-9 shadow-sm hover:bg-primary/90 transition-colors">
              <Link to="/login" search={{ registrar: 1 }}>
                Começar
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 bg-muted/5">
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 flex flex-col items-center text-center">
          <motion.div {...heroText} className="space-y-6 max-w-3xl flex flex-col items-center">
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-foreground">
              Casa nova, novos planos.
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Planeje seus cômodos, organize suas compras e acompanhe seu orçamento.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-sm h-12 px-8 text-base font-medium rounded-full hover:bg-primary/90 transition-colors">
                <Link to="/login" search={{ registrar: 1 }}>
                  Começar de graça
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base font-medium rounded-full bg-background shadow-sm hover:bg-muted/50 transition-colors">
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div {...heroCard} className="w-full max-w-5xl mt-16 md:mt-24">
            {/* Mockup Dashboard */}
            <div className="rounded-xl overflow-hidden border border-border/50 bg-background shadow-2xl flex flex-col">
              {/* Fake Window Header */}
              <div className="h-10 bg-muted/30 border-b border-border/40 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border/80"></div>
                  <div className="w-3 h-3 rounded-full bg-border/80"></div>
                  <div className="w-3 h-3 rounded-full bg-border/80"></div>
                </div>
              </div>
              {/* Dashboard Content */}
              <div className="flex flex-col md:flex-row h-[32rem] md:h-[36rem]">
                {/* Fake Sidebar */}
                <div className="hidden md:flex flex-col w-64 border-r border-border/40 bg-muted/10 p-4 space-y-4">
                  <div className="flex items-center gap-3 px-3 py-2 text-foreground font-medium rounded-lg bg-muted/50">
                    <LayoutDashboard className="w-4 h-4" /> Planejamento
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground font-medium rounded-lg">
                    <Heart className="w-4 h-4" /> Convidados
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground font-medium rounded-lg">
                    <Settings className="w-4 h-4" /> Configurações
                  </div>
                </div>
                {/* Fake Main Content */}
                <div className="flex-1 p-6 md:p-10 flex flex-col bg-background">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">Cozinha</h3>
                      <p className="text-sm text-muted-foreground">Orçamento: R$ 6.500</p>
                    </div>
                    <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                      62% completo
                    </span>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-hidden">
                    {[
                      { n: "Geladeira Frost Free 350L", p: "R$ 2.899", ok: true },
                      { n: "Micro-ondas 20L", p: "R$ 489", ok: true },
                      { n: "Fogão 4 bocas", p: "R$ 1.099", ok: false },
                      { n: "Jogo de panelas antiaderentes", p: "R$ 349", ok: false },
                      { n: "Liquidificador", p: "R$ 120", ok: false },
                    ].map((i) => (
                      <div
                        key={i.n}
                        className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/10 px-4 py-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`grid place-items-center h-4 w-4 rounded-full border ${i.ok ? 'bg-primary border-primary' : 'border-muted-foreground/30'}`}>
                            {i.ok && <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className={`text-sm ${i.ok ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{i.n}</span>
                        </div>
                        <span className={`text-sm font-medium ${i.ok ? 'text-muted-foreground' : 'text-foreground'}`}>{i.p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Tudo o que você precisa para o enxoval sair do papel
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Categorias organizadas, controle de orçamento, prioridades claras e comparativo de preços inteligente.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
          {features.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i} />
          ))}
        </div>
      </section>

      {/* Busca de Lista Pública */}
      <section className="border-t border-border/40 bg-muted/5">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-background border border-border/50 text-foreground mb-6 shadow-sm">
            <Gift className="h-5 w-5" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
            Procurando uma lista de presentes?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Foi convidado para um chá de casa nova ou casamento? Digite o código do casal para acessar a lista.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const codigo = formData.get("codigo")?.toString().trim();
              if (codigo) {
                const slug = codigo.split("/").filter(Boolean).pop() || codigo;
                window.location.href = `/lista/${slug}`;
              }
            }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="codigo"
                placeholder="Ex: marcos-e-julia"
                className="pl-11 h-12 rounded-lg bg-background border-border/50 shadow-sm"
                required
              />
            </div>
            <Button type="submit" size="lg" className="rounded-lg h-12 w-full sm:w-auto px-6 shadow-sm">
              Buscar Lista
            </Button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 bg-background">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Pronto para montar a casa nova?
          </h2>
          <p className="text-lg text-muted-foreground mt-4 mb-8 max-w-xl mx-auto leading-relaxed">
            Crie sua conta em menos de 1 minuto, sozinho ou em casal, e comece o seu planejamento.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-sm h-12 px-8 text-base rounded-full hover:bg-primary/90 transition-colors">
            <Link to="/login" search={{ registrar: 1 }}>
              Criar minha conta
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/40 bg-muted/10 py-10 text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="CasalPlanner" className="h-6 w-6 rounded opacity-80" />
            <span className="text-sm font-semibold tracking-tight opacity-80">CasalPlanner</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CasalPlanner. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}


