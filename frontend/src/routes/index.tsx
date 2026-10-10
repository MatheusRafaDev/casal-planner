import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMotionProps } from "@/hooks/use-reduced-motion";
import { Sparkles, Heart, Home, Wallet, Search, ShieldCheck, ArrowRight, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CasalPlanner - Enxoval de casa nova, sem dor de cabeça" },
      {
        name: "description",
        content:
          "Organize a compra dos itens da casa nova por cômodo, controle VR e dinheiro, e pesquise preços com IA — feito para casais e para você.",
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
      <h3 className="font-display text-lg font-semibold tracking-tight mb-2 text-foreground">{f.title}</h3>
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
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.7, delay: 0.15 },
  });
  
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <header
        className="bg-background border-b border-border/40 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="CasalPlanner" className="h-8 w-8 rounded-md" />
            <span className="font-display text-lg font-semibold tracking-tight">CasalPlanner</span>
          </div>
          <nav className="flex items-center gap-3">
            <Button asChild variant="ghost" className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground text-sm font-medium px-4 h-9 shadow-sm hover:bg-primary/90 transition-colors">
              <Link to="/login" search={{ registrar: 1 }}>
                Criar conta
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 bg-muted/10">
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
          <motion.div {...heroText} className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Pesquisa de preços com inteligência artificial
            </div>
            
            <div className="space-y-4">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] tracking-tight text-foreground">
                A casa nova merece um plano bem feito.
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Organize os itens por cômodo, controle os gastos em VR e dinheiro, e deixe a IA encontrar os melhores preços. 
                <span className="block mt-1">Feito para casais sem sustos na fatura.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-sm h-12 px-6 text-base hover:bg-primary/90 transition-colors">
                <Link to="/login" search={{ registrar: 1 }}>
                  Começar de graça <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base bg-background shadow-sm hover:bg-muted/50 transition-colors">
                <Link to="/login">Acessar minha conta</Link>
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-4">
              <ShieldCheck className="h-4 w-4" /> Seus dados e seu planejamento estão seguros.
            </div>
          </motion.div>

          <motion.div {...heroCard} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display text-xl font-semibold tracking-tight text-foreground">Cozinha</div>
                <span className="text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
                  62% completo
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { n: "Geladeira Frost Free 350L", p: "R$ 2.899", ok: true },
                  { n: "Micro-ondas 20L", p: "R$ 489", ok: true },
                  { n: "Fogão 4 bocas", p: "R$ 1.099", ok: false },
                  { n: "Jogo de panelas antiaderentes", p: "R$ 349", ok: false },
                ].map((i) => (
                  <div
                    key={i.n}
                    className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-4 py-3"
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
              <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Meta do cômodo</span>
                <span className="font-display text-lg font-semibold text-foreground">R$ 6.500</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
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
      <section className="border-t border-border/40 bg-muted/10">
        <div className="max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-background border border-border/50 text-foreground mb-6 shadow-sm">
            <Gift className="h-5 w-5" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-4">
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
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Pronto para montar a casa nova?
          </h2>
          <p className="text-lg text-muted-foreground mt-4 mb-8 max-w-xl mx-auto leading-relaxed">
            Crie sua conta em menos de 1 minuto, sozinho ou em casal, e comece o seu planejamento.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-sm h-12 px-8 text-base hover:bg-primary/90 transition-colors">
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
            <span className="font-display text-sm font-semibold tracking-tight opacity-80">CasalPlanner</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CasalPlanner. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

