import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  Heart,
  Home,
  Wallet,
  Search,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casal Planner — Enxoval de casa nova, sem dor de cabeça" },
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
    desc: "Digite o item, a IA corrige a marca e busca no Google Shopping filtrando lojas confiáveis.",
  },
  {
    icon: Heart,
    title: "A dois ou solo",
    desc: "Conta individual ou de casal, com dois logins no mesmo enxoval compartilhado.",
  },
];

function Home_() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Casal Planner" className="h-10 w-10 rounded-lg" />
            <span className="font-display text-lg font-semibold">Casal Planner</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-gradient-primary shadow-warm">
              <Link to="/login" search={{ registrar: 1 }}>
                Criar conta
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-70" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3 w-3 text-terracota" /> Novo: pesquisa de preço com IA
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
              A casa nova{" "}
              <span className="italic text-primary">merece</span> um plano bonito.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Liste o que precisa por cômodo, distribua entre VR e dinheiro, e deixe a IA achar o
              melhor preço. Feito para casais que querem começar a vida a dois sem susto na fatura.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-primary shadow-warm">
                <Link to="/login" search={{ registrar: 1 }}>
                  Começar de graça <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Dados protegidos, seus itens ficam
              só com você.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-3xl border bg-card p-6 shadow-warm">
              <div className="flex items-center justify-between mb-4">
                <div className="font-display text-lg">Cozinha</div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  62% comprado
                </span>
              </div>
              <div className="space-y-2">
                {[
                  { n: "Geladeira Frost Free 350L", p: "R$ 2.899", ok: true },
                  { n: "Micro-ondas 20L", p: "R$ 489", ok: true },
                  { n: "Fogão 4 bocas", p: "R$ 1.099", ok: false },
                  { n: "Jogo de panelas", p: "R$ 349", ok: false },
                ].map((i) => (
                  <div
                    key={i.n}
                    className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${i.ok ? "bg-primary" : "bg-mel"}`}
                      />
                      <span className="text-sm">{i.n}</span>
                    </div>
                    <span className="text-sm font-medium">{i.p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meta do cômodo</span>
                <span className="font-display text-lg">R$ 6.500</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">
            Tudo que faltava para o enxoval sair do papel
          </h2>
          <p className="text-muted-foreground">
            Categorias, orçamento, prioridades e comparativo de preço em um só lugar.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-6 rounded-2xl border bg-card shadow-soft"
            >
              <span className="grid place-items-center h-11 w-11 rounded-xl bg-accent text-accent-foreground mb-4">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-gradient-warm border p-10 md:p-14 text-center shadow-elegant">
          <h2 className="font-display text-3xl md:text-4xl font-semibold">
            Pronto para montar a casa dos sonhos?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Crie sua conta em menos de 1 minuto — individual ou de casal — e comece agora.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-primary shadow-warm">
              <Link to="/login" search={{ registrar: 1 }}>
                Criar minha conta
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Casal Planner. Feito com carinho.
      </footer>
    </div>
  );
}
