import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMotionProps } from "@/hooks/use-reduced-motion";
import { Gift, LayoutDashboard, Search, Check, Users, Wallet, UserPlus, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CasalPlanner - Planeje sua casa nova" },
      {
        name: "description",
        content:
          "Organize suas compras, controle o orçamento e planeje o enxoval de forma profissional, sozinho ou em casal.",
      },
    ],
  }),
  component: Home_,
});

function Home_() {
  const { theme, toggle } = useTheme();

  const fadeUp = useMotionProps({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header
        className="bg-background border-b sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CasalPlanner" className="h-7 w-7 rounded-md" />
            <span className="text-lg font-semibold tracking-tight font-display">CasalPlanner</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggle}
              className="text-muted-foreground hover:text-foreground p-2 rounded-md transition-colors"
              title="Alternar tema"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Entrar
            </Link>
            <Button asChild className="h-9 px-5 rounded-md text-sm font-medium">
              <Link to="/login" search={{ registrar: 1 }}>
                Começar
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Editorial Split Layout */}
      <section className="relative pt-16 md:pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 overflow-hidden">
        {/* Left Side: Copy */}
        <div className="flex-1 w-full max-w-2xl lg:max-w-none flex flex-col justify-center">
          <motion.h1
            {...useMotionProps({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            })}
            className="text-5xl md:text-6xl lg:text-[5rem] font-display font-semibold tracking-tight leading-[1.05] text-balance"
          >
            A casa nova,<br className="hidden lg:block" /> com as contas em dia.
          </motion.h1>
          
          <motion.p
            {...useMotionProps({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
            })}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-6 mb-10 max-w-xl"
          >
            Organize o enxoval por cômodos, saiba exatamente onde seu dinheiro está sendo gasto e mantenha tudo sincronizado com o seu parceiro em tempo real.
          </motion.p>
          
          <motion.div
            {...useMotionProps({
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
            })}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <Button asChild size="lg" className="h-14 px-8 text-base rounded-md">
              <Link to="/login" search={{ registrar: 1 }}>
                Criar uma conta gratuita
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base rounded-md border-border hover:bg-muted/30">
              <a href="#como-funciona">Ver como funciona</a>
            </Button>
          </motion.div>
        </div>

        {/* Right Side: UI Mockup */}
        <motion.div
          {...useMotionProps({
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
          })}
          className="flex-1 w-full max-w-2xl relative"
        >
          {/* Main App Mockup */}
          <div className="bg-card border rounded-[var(--radius)] shadow-card p-6 md:p-8 relative z-10 w-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-display font-semibold tracking-tight">Cozinha</h3>
                <p className="text-sm text-muted-foreground mt-1">12 de 18 itens comprados</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold tracking-tight">R$ 4.250</div>
                <p className="text-sm text-muted-foreground">de R$ 6.500</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden mb-8">
              <div className="h-full bg-primary w-[65%] rounded-full"></div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {[
                { nome: "Geladeira Frost Free 400L", preco: "R$ 3.899", comprado: true, tags: ["Eletro", "Dinheiro"] },
                { nome: "Micro-ondas 20L Inox", preco: "R$ 589", comprado: true, tags: ["Eletro", "VR"] },
                { nome: "Fogão 4 bocas", preco: "R$ 1.299", comprado: false, tags: ["Eletro", "Dinheiro"] },
                { nome: "Jogo de panelas cerâmica", preco: "R$ 449", comprado: false, tags: ["Utensílios"] },
              ].map((item, idx) => (
                <div key={idx} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-colors ${item.comprado ? 'bg-muted/30 border-transparent' : 'bg-background hover:border-border/80'}`}>
                  <div className="flex items-start sm:items-center gap-4">
                    <div className={`mt-0.5 sm:mt-0 shrink-0 h-5 w-5 rounded border flex items-center justify-center ${item.comprado ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'}`}>
                      {item.comprado && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <span className={`block font-medium ${item.comprado ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.nome}</span>
                      <div className="flex gap-2 mt-1.5">
                        {item.tags.map(t => (
                          <span key={t} className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-muted text-muted-foreground rounded-sm">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold mt-3 sm:mt-0 sm:text-right ${item.comprado ? 'text-muted-foreground' : 'text-foreground'}`}>{item.preco}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overlapping Notification Card to demonstrate Couple Sync */}
          <div className="absolute -bottom-6 md:-bottom-8 -left-4 md:-left-8 bg-background border rounded-[var(--radius)] shadow-card p-4 z-20 flex items-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="pr-2">
              <p className="text-sm font-semibold text-foreground">Julia comprou um item</p>
              <p className="text-xs text-muted-foreground mt-0.5">Micro-ondas 20L Inox</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Editorial Bento / Feature Section */}
      <section id="como-funciona" className="py-24 md:py-32 px-6 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-24 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-display font-semibold tracking-tight leading-[1.1] mb-6">
              Não é só uma lista.<br/>É o controle financeiro do seu enxoval.
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Sabemos que mobiliar uma casa custa caro. Por isso, o CasalPlanner foi desenhado para te dar clareza absoluta sobre para onde seu dinheiro está indo, sem a complexidade de planilhas infinitas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Box 1 (Grande) */}
            <motion.div {...fadeUp} className="md:col-span-2 bg-background border p-8 md:p-10 rounded-[var(--radius)] flex flex-col h-full shadow-soft">
              <LayoutDashboard className="h-8 w-8 text-primary mb-6" />
              <h3 className="text-2xl font-display font-semibold tracking-tight mb-3">Organização por Cômodos</h3>
              <p className="text-muted-foreground text-lg leading-relaxed flex-1">
                Divida suas compras entre Cozinha, Quarto, Sala, e defina uma meta de gastos para cada área. Descubra rapidamente onde você está estourando o orçamento.
              </p>
            </motion.div>
            
            {/* Box 2 (Menor) */}
            <motion.div {...fadeUp} transition={{ delay: 0.1, duration: 0.8 }} className="bg-background border p-8 md:p-10 rounded-[var(--radius)] flex flex-col h-full shadow-soft">
              <Wallet className="h-8 w-8 text-primary mb-6" />
              <h3 className="text-xl font-display font-semibold tracking-tight mb-3">Vale ou Dinheiro?</h3>
              <p className="text-muted-foreground leading-relaxed flex-1">
                Marque o item na plataforma. O sistema separa automaticamente o que sai da sua conta corrente do que sai dos benefícios.
              </p>
            </motion.div>
            
            {/* Box 3 (Horizontal Full) */}
            <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.8 }} className="md:col-span-3 bg-background border p-8 md:p-10 rounded-[var(--radius)] flex flex-col md:flex-row items-center gap-8 shadow-soft">
              <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-semibold tracking-tight mb-3">Sincronia a Dois</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Vincule a conta do seu parceiro. Se ele marcar um item como comprado ou adicionar um produto novo no mercado, o seu painel atualiza na mesma hora. Planejar juntos nunca foi tão fácil.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Public List Search */}
      <section className="py-24 px-6 border-t bg-background">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-[var(--radius-lg)] bg-muted text-foreground mb-6">
            <Gift className="h-6 w-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight mb-4">
            Procurando uma lista de presentes?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Foi convidado para um chá de casa nova ou casamento? Digite o código fornecido pelos anfitriões para acessar a lista pública.
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
            className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                name="codigo"
                placeholder="Ex: marcos-e-julia"
                className="pl-12 h-14 bg-muted/50 text-base rounded-md border-transparent focus-visible:border-primary"
                required
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-8 text-base rounded-md w-full sm:w-auto">
              Buscar Lista
            </Button>
          </form>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-display font-semibold tracking-tight mb-6">
            O planejamento da sua vida começa aqui.
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Crie sua conta em menos de um minuto, convide seu parceiro e comece a montar sua nova casa.
          </p>
          <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-base font-semibold rounded-md text-primary">
            <Link to="/login" search={{ registrar: 1 }}>
              Criar minha conta agora
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CasalPlanner" className="h-6 w-6 rounded grayscale opacity-80" />
            <span className="text-sm font-semibold tracking-tight opacity-80 font-display">CasalPlanner</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CasalPlanner. Construído para planejar o futuro.
          </p>
        </div>
      </footer>
    </div>
  );
}
