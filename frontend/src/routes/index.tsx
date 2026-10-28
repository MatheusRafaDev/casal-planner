import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { BrandLogoText, BrandLogoIcon } from "@/components/ui/BrandLogo";
import { Check, ChevronRight, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      try {
        if (localStorage.getItem("cp_cached_user")) {
          throw redirect({ to: "/inicio", replace: true });
        }
      } catch (err) {
        throw err;
      }
    }
  },
  head: () => ({
    meta: [
      { title: "CasalPlanner | Planejar a dois é começar a casa com o pé direito" },
      {
        name: "description",
        content:
          "Cada cômodo, cada compra e o orçamento da casa nova num lugar só. Feito para o casal e também para conta individual.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/inicio", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    document.querySelectorAll(".reveal-section").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 32;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });

      setHighlightedSection(id);
      window.history.pushState(null, "", `#${id}`);

      setTimeout(() => {
        setHighlightedSection((prev) => (prev === id ? null : prev));
      }, 2200);
    }
  };

  return (
    <div className="pg bg-background text-foreground font-sans min-h-screen selection:bg-primary/20">
      <style>{`
        .btn-anexo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 24px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          box-sizing: border-box;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-anexo:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04);
        }
        .btn-anexo:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .h1-anexo {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .h2-anexo {
          margin: 0;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 38px;
          line-height: 1.15;
          letter-spacing: -0.025em;
          color: #0f172a;
        }
        .p-anexo {
          margin: 14px 0 0;
          font-size: 17px;
          line-height: 1.6;
          color: #64748b;
        }
        .blk-anexo {
          display: flex;
          gap: 48px;
          align-items: center;
          flex-wrap: wrap;
          padding: 56px 0;
          border-top: 1px solid #e2e8f0;
        }
        .st-anexo {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.02);
          padding: 24px 26px;
          width: 100%;
          max-width: 400px;
          box-sizing: border-box;
        }
        .rw-anexo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 15px;
          margin-top: 14px;
        }
        .bar-anexo {
          height: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 99px;
          background: #f1f5f9;
          overflow: hidden;
          flex: 1;
        }
        .bar-anexo i {
          display: block;
          height: 100%;
        }
        .tag-anexo {
          padding: 2px 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }
        .ls-anexo {
          margin: 18px 0 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 16px;
          line-height: 1.5;
        }
        .ls-anexo li {
          padding-left: 28px;
          position: relative;
        }
        .ls-anexo li:before {
          content: "";
          position: absolute;
          left: 0;
          top: 7px;
          width: 12px;
          height: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 3px;
          background: #f59e0b;
        }
        .tl-anexo {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.02);
          padding: 24px 26px;
          flex: 1 1 300px;
          box-sizing: border-box;
        }
        .tl-anexo b {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 20px;
          display: block;
          margin-bottom: 6px;
          color: #0f172a;
        }
        .tl-anexo span {
          font-size: 15px;
          line-height: 1.6;
          color: #64748b;
        }
        .row-anexo {
          display: flex;
          gap: 28px;
          align-items: baseline;
          padding: 24px 0;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }
        @media (max-width: 700px) {
          .h1-anexo {
            font-size: 38px !important;
          }
          .h2-anexo {
            font-size: 30px !important;
          }
          .hide-s {
            display: none !important;
          }
        }

        html {
          scroll-behavior: smooth;
        }

        #passos, #recursos, #duvidas {
          scroll-margin-top: 32px;
        }

        .reveal-section {
          opacity: 1;
          transform: none;
        }
        .reveal-section.is-revealed {
          opacity: 1;
          transform: none;
        }

        @keyframes sectionPopHighlight {
          0% {
            transform: scale(0.99);
            box-shadow: 0 0 0 0 rgba(47, 125, 91, 0);
          }
          50% {
            transform: scale(1.005);
            box-shadow: 0 0 0 4px rgba(47, 125, 91, 0.2);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(47, 125, 91, 0);
          }
        }

        .section-highlight {
          animation: sectionPopHighlight 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          border-radius: 20px;
        }

        :target {
          animation: sectionPopHighlight 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .nav-section-link {
          position: relative;
          transition: color 0.2s ease;
        }
        .nav-section-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #6ee7b7;
          border-radius: 99px;
          transition: width 0.25s ease;
        }
        .nav-section-link:hover::after {
          width: 100%;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .section-highlight,
          :target {
            animation: none;
          }
        }
      `}</style>

      {/* Header Sticky - Verde Lar Floresta translúcido com borda suave e respeito ao notch do iPhone */}
      <header className="sticky top-0 z-50 w-full bg-[#174a35]/95 backdrop-blur-md border-b border-[#133c2b] shadow-xs transition-all pt-[env(safe-area-inset-top,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform hover:scale-[1.01]"
            aria-label="CasalPlanner"
          >
            <div className="p-1 rounded-xl bg-white/10 border border-white/15 shadow-2xs">
              <BrandLogoIcon size="sm" className="h-7 w-7" />
            </div>
            <BrandLogoText size="sm" variant="on-dark" />
          </Link>
          <nav className="flex items-center gap-2 sm:gap-6" aria-label="Conta">
            <a
              href="#passos"
              onClick={(e) => scrollToSection(e, "passos")}
              className="hide-s nav-section-link font-semibold text-emerald-100/85 hover:text-white text-sm"
            >
              Como Funciona
            </a>
            <a
              href="#recursos"
              onClick={(e) => scrollToSection(e, "recursos")}
              className="hide-s nav-section-link font-semibold text-emerald-100/85 hover:text-white text-sm"
            >
              Recursos
            </a>
            <a
              href="#duvidas"
              onClick={(e) => scrollToSection(e, "duvidas")}
              className="hide-s nav-section-link font-semibold text-emerald-100/85 hover:text-white text-sm"
            >
              Dúvidas
            </a>
            <div className="flex items-center gap-2.5">

              <Link
                to="/login"
                className="px-5 sm:px-6 py-2 rounded-full bg-white text-[#174a35] hover:bg-emerald-50 font-bold text-sm transition-all whitespace-nowrap shadow-xs"
              >
                Entrar
              </Link>

              <Link
                to="/login"
                search={{ registrar: 1 }}
                className="hidden sm:inline-flex px-4 sm:px-5 py-2 rounded-full border border-white/25 text-white hover:bg-white/10 font-semibold text-sm transition-all whitespace-nowrap shadow-xs backdrop-blur-xs"
              >
                Cadastre-se agora
              </Link>



            </div>
          </nav>
        </div>
      </header>

      <div className="max-w-[1120px] mx-auto px-6 sm:px-8 box-border">
        {/* Hero Section */}
        <section className="flex gap-16 items-center flex-wrap pt-16 pb-24">
          <div className="flex-1 basis-[460px]">
            <h1 className="h1-anexo m-0 font-display font-extrabold text-[48px] sm:text-[62px] leading-[1.08] text-slate-900 tracking-tight">
              Planejar a dois é começar a casa com o{" "}
              <span className="text-primary">pé direito.</span>
            </h1>
            <p className="p-anexo text-[19px] max-w-[500px] mt-6 text-slate-500">
              Cada cômodo, cada compra e o orçamento da casa nova num lugar só.
            </p>
            <p className="mt-5 mb-0 text-[14px] text-slate-400 font-medium">
              Sozinho também funciona: tem conta individual.
            </p>
          </div>

          <div className="flex-1 basis-[420px] relative min-h-[460px] flex items-center justify-center">
            {/* Card Flutuante 1: Geladeira */}
            <div className="hidden sm:flex absolute -top-3 -left-4 z-20 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md items-center gap-2.5 transition-all hover:scale-105">
              <img
                src="/images/products/geladeira.jpg"
                alt="Geladeira Duplex"
                className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1"
              />
              <div className="pr-1 text-left">
                <span className="text-[11px] font-semibold block text-emerald-700 leading-tight">
                  ✓ Cozinha
                </span>
                <span className="text-[13px] font-bold text-slate-900 font-display">
                  Geladeira Duplex
                </span>
                <span className="text-[11px] font-semibold text-slate-500 block">R$ 3.890</span>
              </div>
            </div>

            {/* Card Flutuante 2: Sofá */}
            <div className="hidden sm:flex absolute -bottom-3 -left-4 z-20 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md items-center gap-2.5 transition-all hover:scale-105">
              <img
                src="/images/products/sofa.jpg"
                alt="Sofá Retrátil"
                className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1"
              />
              <div className="pr-1 text-left">
                <span className="text-[11px] font-semibold block text-amber-700 leading-tight">
                  🛋️ Sala
                </span>
                <span className="text-[13px] font-bold text-slate-900 font-display">
                  Sofá 3 Lugares
                </span>
                <span className="text-[11px] font-semibold text-slate-500 block">10x R$ 245</span>
              </div>
            </div>

            {/* Card Flutuante 3: Air Fryer & Café */}
            <div className="hidden md:flex absolute -top-3 -right-4 z-20 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-md items-center gap-2.5 transition-all hover:scale-105">
              <img
                src="/images/products/air-fryer-cafeteira.jpg"
                alt="Air fryer e cafeteira"
                className="w-12 h-12 object-contain rounded-lg bg-slate-50 p-1"
              />
              <div className="pr-1 text-left">
                <span className="text-[11px] font-semibold block text-orange-700 leading-tight">
                  🎁 Presente
                </span>
                <span className="text-[13px] font-bold text-slate-900 font-display">
                  Air Fryer & Café
                </span>
                <span className="text-[11px] font-semibold text-slate-500 block">Padrinhos</span>
              </div>
            </div>

            {/* Ilustração Editorial do Casal no Lar */}
            <div className="rounded-3xl border border-slate-200 shadow-xl overflow-hidden bg-white max-w-[420px] w-full relative">
              <img
                src="/illustrations/hero-couple.jpg"
                alt="Casal planejando o enxoval da casa nova no computador"
                className="w-full h-[320px] object-cover block"
              />
              <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-sm text-slate-900 block">
                    Nosso novo cantinho 🏡
                  </span>
                  <span className="text-xs text-slate-500">Orçamento e escolhas sincronizados</span>
                </div>
                <span className="px-3 py-1 rounded-full border border-emerald-600/20 bg-emerald-50 text-emerald-800 font-semibold text-xs">
                  Tudo em ordem
                </span>
              </div>
            </div>

            {/* Card de Economia & Saldo */}
            <div className="absolute -right-3 -bottom-3 rounded-2xl bg-white border border-slate-200 shadow-lg px-4 py-3 flex flex-col items-center justify-center text-center z-20">
              <span className="text-xs font-semibold text-slate-500">Orçamento restante</span>
              <span className="tabular-nums text-xl font-bold font-display text-primary">
                R$ 2.650
              </span>
            </div>
          </div>
        </section>

        {/* 4 Passos */}
        <section id="passos" className="pb-[72px] pt-12 border-t border-slate-200 reveal-section">
          <h2 className="h2-anexo max-w-[640px]">Do primeiro cadastro à última compra</h2>
          <p className="p-anexo max-w-[640px]">
            O CasalPlanner organiza a montagem da casa em quatro passos simples.
          </p>
          <div className="mt-9 flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 w-full">
              <div className="row-anexo border-b border-slate-200">
                <div className="w-[70px] sm:w-[90px] shrink-0 font-display font-semibold text-[38px] sm:text-[44px] text-primary">
                  01
                </div>
                <div className="w-[220px] sm:w-[260px] shrink-0 font-display font-semibold text-[22px] sm:text-[26px] text-slate-900">
                  Criem a conta
                </div>
                <p className="flex-1 m-0 text-[16px] sm:text-[18px] leading-[1.55] text-slate-600">
                  Um cadastro para o casal, que já deixa as duas pessoas vinculadas. Se preferir,
                  comece sozinho com uma conta individual.
                </p>
              </div>
              <div className="row-anexo border-b border-slate-200">
                <div className="w-[70px] sm:w-[90px] shrink-0 font-display font-semibold text-[38px] sm:text-[44px] text-primary">
                  02
                </div>
                <div className="w-[220px] sm:w-[260px] shrink-0 font-display font-semibold text-[22px] sm:text-[26px] text-slate-900">
                  Montem os cômodos
                </div>
                <p className="flex-1 m-0 text-[16px] sm:text-[18px] leading-[1.55] text-slate-600">
                  Cozinha, sala, quarto, lavanderia, ou o que fizer sentido para a casa de vocês.
                  Cada cômodo recebe o seu orçamento.
                </p>
              </div>
              <div className="row-anexo border-b border-slate-200">
                <div className="w-[70px] sm:w-[90px] shrink-0 font-display font-semibold text-[38px] sm:text-[44px] text-primary">
                  03
                </div>
                <div className="w-[220px] sm:w-[260px] shrink-0 font-display font-semibold text-[22px] sm:text-[26px] text-slate-900">
                  Listem os itens
                </div>
                <p className="flex-1 m-0 text-[16px] sm:text-[18px] leading-[1.55] text-slate-600">
                  Cada item tem preço, quantidade, forma de pagamento e status. Vocês veem o que
                  falta e quanto custa.
                </p>
              </div>
              <div className="row-anexo border-b border-slate-200">
                <div className="w-[70px] sm:w-[90px] shrink-0 font-display font-semibold text-[38px] sm:text-[44px] text-primary">
                  04
                </div>
                <div className="w-[220px] sm:w-[260px] shrink-0 font-display font-semibold text-[22px] sm:text-[26px] text-slate-900">
                  Acompanhem juntos
                </div>
                <p className="flex-1 m-0 text-[16px] sm:text-[18px] leading-[1.55] text-slate-600">
                  O dashboard mostra quanto foi gasto, quanto sobra e as parcelas que vão chegar nos
                  próximos meses.
                </p>
              </div>
            </div>

            {/* Ilustração editorial dos cômodos organizados */}
            <div className="lg:w-[380px] shrink-0 w-full flex justify-center">
              <div className="rounded-2xl border border-slate-200 shadow-md overflow-hidden bg-white max-w-[380px] w-full">
                <img
                  src="/illustrations/cozy-rooms.jpg"
                  alt="Ilustração editorial da casa organizada"
                  className="w-full h-[320px] object-cover block"
                />
                <div className="p-4 bg-white border-t border-slate-100">
                  <span className="font-display font-bold text-sm text-slate-900 block">
                    Cada cômodo no seu tempo
                  </span>
                  <span className="text-xs text-slate-500">
                    Planejamento visual para transformar ideias em lares reais.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Seção Recursos (Fundo Branco com bordas sutis) */}
      <div
        id="recursos"
        className={`bg-white border-y border-slate-200 reveal-section transition-all duration-300 ${
          highlightedSection === "recursos" ? "section-highlight ring-4 ring-emerald-500/20" : ""
        }`}
      >
        <div className="max-w-[1120px] mx-auto px-8 box-border">
          <div className="pt-[72px] pb-2">
            <h2 className="h2-anexo max-w-[640px]">O que tem por dentro</h2>
            <p className="p-anexo max-w-[640px]">Os recursos principais, um por um.</p>
          </div>

          {/* Recurso 1: Cômodos e orçamento */}
          <div className="blk-anexo border-t-0">
            <div className="flex-1 basis-[380px]">
              <div className="font-display font-semibold text-[18px] text-primary mb-2">
                Cômodos e orçamento
              </div>
              <h3 className="h2-anexo text-[32px] sm:text-[34px]">Um limite para cada ambiente</h3>
              <p className="p-anexo">
                Defina quanto pretende gastar em cada cômodo e acompanhe a barra encher conforme as
                compras entram. Quando um cômodo passa do orçamento, ele aparece em alerta.
              </p>
              <ul className="ls-anexo">
                <li>Orçamento por cômodo e total da casa</li>
                <li>Valor gasto, previsto e restante à vista</li>
                <li>Ícones e nomes que vocês escolhem</li>
              </ul>
            </div>
            <div className="flex-1 basis-[380px] flex justify-center">
              <div className="st-anexo">
                <div className="font-display font-semibold text-[22px] text-slate-900">
                  Seus cômodos
                </div>
                <div className="rw-anexo">
                  <span className="w-[92px] text-slate-700">Cozinha</span>
                  <div className="bar-anexo">
                    <i className="w-[78%] bg-primary"></i>
                  </div>
                </div>
                <div className="rw-anexo">
                  <span className="w-[92px] text-slate-700">Sala</span>
                  <div className="bar-anexo">
                    <i className="w-[41%] bg-primary"></i>
                  </div>
                </div>
                <div className="rw-anexo">
                  <span className="w-[92px] text-slate-700">Quarto</span>
                  <div className="bar-anexo">
                    <i className="w-[43%] bg-primary"></i>
                  </div>
                </div>
                <div className="rw-anexo">
                  <span className="w-[92px] text-slate-700">Lavanderia</span>
                  <div className="bar-anexo">
                    <i className="w-[100%] bg-red-600"></i>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="tag-anexo bg-red-50 text-red-700 border-red-200">
                    Lavanderia estourou o orçamento
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recurso 2: Itens */}
          <div className="blk-anexo flex-row-reverse">
            <div className="flex-1 basis-[380px]">
              <div className="font-display font-semibold text-[18px] text-primary mb-2">Itens</div>
              <h3 className="h2-anexo text-[32px] sm:text-[34px]">Cada compra com seu status</h3>
              <p className="p-anexo">
                Adicione um item com preço, quantidade e data prevista de compra. Marque como
                comprado quando chegar em casa. Presentes e itens prometidos por alguém ficam
                separados, para não entrarem na conta como gasto.
              </p>
              <ul className="ls-anexo">
                <li>Itens comprados, pendentes, presentes e prometidos</li>
                <li>Adição guiada, passo a passo, também no celular</li>
                <li>Filtro por cômodo e por status</li>
              </ul>
            </div>
            <div className="flex-1 basis-[380px] flex justify-center">
              <div className="st-anexo">
                <div className="rw-anexo mt-0 items-center">
                  <img
                    src="/images/products/geladeira.jpg"
                    alt="Geladeira"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                  />
                  <span className="flex-1 font-semibold text-slate-800">Geladeira Duplex</span>
                  <span className="tag-anexo bg-emerald-50 text-emerald-800 border-emerald-200">
                    Comprado
                  </span>
                </div>
                <div className="rw-anexo items-center">
                  <img
                    src="/images/products/air-fryer-cafeteira.jpg"
                    alt="Air Fryer e Cafeteira"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                  />
                  <span className="flex-1 font-semibold text-slate-800">Air Fryer & Café</span>
                  <span className="tag-anexo bg-amber-50 text-amber-800 border-amber-200">
                    Presente
                  </span>
                </div>
                <div className="rw-anexo items-center">
                  <img
                    src="/images/products/sofa.jpg"
                    alt="Sofá"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                  />
                  <span className="flex-1 font-semibold text-slate-800">Sofá Conforto</span>
                  <span className="tag-anexo bg-emerald-50 text-emerald-800 border-emerald-200">
                    Prometido
                  </span>
                </div>
                <div className="rw-anexo items-center">
                  <img
                    src="/images/products/smart-tv.jpg"
                    alt="Smart TV"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                  />
                  <span className="flex-1 font-semibold text-slate-800">Smart TV 55" 4K</span>
                  <span className="tag-anexo bg-slate-100 text-slate-700 border-slate-200">
                    Pendente
                  </span>
                </div>
                <div className="rw-anexo items-center">
                  <img
                    src="/images/products/cama-queen.jpg"
                    alt="Cama Box Queen"
                    className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                  />
                  <span className="flex-1 font-semibold text-slate-800">Cama Box Queen</span>
                  <span className="tag-anexo bg-emerald-50 text-emerald-800 border-emerald-200">
                    Comprado
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recurso 3: Divisão entre os dois */}
          <div className="blk-anexo">
            <div className="flex-1 basis-[380px]">
              <div className="font-display font-semibold text-[18px] text-primary mb-2">
                Divisão entre os dois
              </div>
              <h3 className="h2-anexo text-[32px] sm:text-[34px]">
                Quem pagou o quê, sem discussão
              </h3>
              <p className="p-anexo">
                Acompanhem os gastos divididos entre vocês de forma transparente e visual. Saibam
                exatamente quanto cada pessoa investiu e quanto sobra para os próximos passos.
              </p>
              <ul className="ls-anexo">
                <li>Divisão proporcional ou personalizada entre o casal</li>
                <li>Gasto de cada pessoa e do casal juntos com barras comparativas</li>
                <li>Pagamento em dinheiro separado de VR/VA</li>
                <li>Funciona também para conta individual</li>
              </ul>
            </div>
            <div className="flex-1 basis-[380px] flex justify-center">
              <div className="st-anexo">
                <div className="font-display font-semibold text-[22px] text-slate-900">
                  Gastos até agora
                </div>
                <div className="flex h-[24px] border border-slate-200 rounded-full overflow-hidden mt-4">
                  <div className="w-[67%] bg-primary"></div>
                  <div className="w-[33%] bg-amber-500"></div>
                </div>
                <div className="rw-anexo">
                  <i className="w-3.5 h-3.5 rounded-xs bg-primary"></i>
                  <span className="flex-1 text-slate-700">Pessoa 1</span>
                  <span className="tabular-nums font-bold text-slate-900">R$ 14.400</span>
                </div>
                <div className="rw-anexo">
                  <i className="w-3.5 h-3.5 rounded-xs bg-amber-500"></i>
                  <span className="flex-1 text-slate-700">Pessoa 2</span>
                  <span className="tabular-nums font-bold text-slate-900">R$ 6.950</span>
                </div>
                <div className="rw-anexo border-t border-slate-100 pt-3.5">
                  <span className="flex-1 text-slate-500">Pago com VR/VA</span>
                  <span className="tabular-nums font-bold text-slate-900">R$ 1.200</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recurso 4: Parcelas e faturas */}
          <div className="blk-anexo flex-row-reverse">
            <div className="flex-1 basis-[380px]">
              <div className="font-display font-semibold text-[18px] text-primary mb-2">
                Parcelas e faturas
              </div>
              <h3 className="h2-anexo text-[32px] sm:text-[34px]">Saiba o que vem pela frente</h3>
              <p className="p-anexo">
                Compras parceladas viram uma projeção mês a mês. Antes de fechar mais uma compra,
                vocês veem quanto já está comprometido nos próximos meses.
              </p>
              <ul className="ls-anexo">
                <li>Valor de cada parcela distribuído por mês</li>
                <li>Gráfico de faturas no dashboard</li>
                <li>Resumo por cômodo e por categoria</li>
              </ul>
            </div>
            <div className="flex-1 basis-[380px] flex justify-center">
              <div className="st-anexo">
                <div className="font-display font-semibold text-[22px] text-slate-900">
                  Faturas dos próximos meses
                </div>
                <div className="flex items-end gap-3 h-[150px] mt-[18px]">
                  <div className="flex-1 h-full flex flex-col justify-end items-center text-xs font-semibold gap-1.5 text-slate-600">
                    <div className="w-full h-[110px] bg-primary rounded-t-md"></div>
                    Out
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center text-xs font-semibold gap-1.5 text-slate-600">
                    <div className="w-full h-[90px] bg-primary rounded-t-md"></div>
                    Nov
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center text-xs font-semibold gap-1.5 text-slate-600">
                    <div className="w-full h-[100px] bg-primary rounded-t-md"></div>
                    Dez
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center text-xs font-semibold gap-1.5 text-slate-600">
                    <div className="w-full h-[60px] bg-amber-500 rounded-t-md"></div>
                    Jan
                  </div>
                  <div className="flex-1 h-full flex flex-col justify-end items-center text-xs font-semibold gap-1.5 text-slate-600">
                    <div className="w-full h-[40px] bg-amber-500 rounded-t-md"></div>
                    Fev
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recurso 5: Pesquisa de preços */}
          <div className="blk-anexo">
            <div className="flex-1 basis-[380px]">
              <div className="font-display font-semibold text-[18px] text-primary mb-2">
                Pesquisa de preços
              </div>
              <h3 className="h2-anexo text-[32px] sm:text-[34px]">Compare antes de comprar</h3>
              <p className="p-anexo">
                Na loja, leia o código de barras do produto com a câmera do celular, ou tire uma
                foto dele. O sistema ajuda a encontrar o produto e registrar o preço que vocês
                viram.
              </p>
              <ul className="ls-anexo">
                <li>Leitor de código de barras pela câmera</li>
                <li>Pesquisa por foto do produto</li>
                <li>Registro do preço encontrado no item</li>
              </ul>
            </div>
            <div className="flex-1 basis-[380px] flex justify-center">
              <div className="st-anexo">
                <div
                  className="h-[52px] border border-slate-200 rounded-lg"
                  style={{
                    background:
                      "repeating-linear-gradient(90deg, #0f172a 0 2px, #fff 2px 5px, #0f172a 5px 7px, #fff 7px 10px)",
                  }}
                ></div>
                <div className="rw-anexo">
                  <span className="flex-1 text-slate-700">Loja A</span>
                  <span className="tabular-nums font-bold text-slate-900">R$ 749</span>
                </div>
                <div className="rw-anexo">
                  <span className="flex-1 text-slate-700">Loja B</span>
                  <span className="tabular-nums font-bold text-slate-900">R$ 699</span>
                  <span className="tag-anexo bg-amber-100 text-amber-900 border-amber-300">
                    Menor
                  </span>
                </div>
                <div className="rw-anexo">
                  <span className="flex-1 text-slate-700">Loja C</span>
                  <span className="tabular-nums font-bold text-slate-900">R$ 729</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* E tem mais */}
      <div className="max-w-[1120px] mx-auto px-8 box-border">
        <section className="pt-[72px] pb-6">
          <h2 className="h2-anexo">E tem mais</h2>
          <div className="flex gap-5 flex-wrap mt-7">
            <div className="tl-anexo">
              <b>Dia da mudança</b>
              <span>
                Um painel no dashboard para acompanhar a data da mudança e o clima do dia.
              </span>
            </div>
            <div className="tl-anexo">
              <b>Lista por link</b>
              <span>
                Compartilhe a lista de itens com a família e os amigos por um endereço público.
              </span>
            </div>
            <div className="tl-anexo">
              <b>Instale no celular</b>
              <span>
                Adicione à tela inicial e abra como um aplicativo, sem baixar nada pela loja.
              </span>
            </div>
          </div>
          <div className="flex gap-5 flex-wrap mt-5">
            <div className="tl-anexo">
              <b>Atualizações em tempo real</b>
              <span>Mudanças feitas por um aparecem instantaneamente para o outro.</span>
            </div>
            <div className="tl-anexo">
              <b>Recuperação de senha</b>
              <span>Esqueceu a senha? Recupere o acesso por e-mail em poucos passos.</span>
            </div>
            <div className="tl-anexo">
              <b>Para o casal ou só você</b>
              <span>A mesma ferramenta funciona com conta individual ou conta de casal.</span>
            </div>
          </div>
        </section>

        {/* Casal ou individual? */}
        <section className="pt-[72px] pb-6 reveal-section">
          <h2 className="h2-anexo">Casal ou individual?</h2>
          <div className="flex gap-6 flex-wrap mt-7">
            <div className="st-anexo max-w-none flex-1 basis-[380px] bg-emerald-50/50 border-emerald-200">
              <div className="font-display font-semibold text-[26px] text-slate-900">
                Conta de casal
              </div>
              <ul className="ls-anexo">
                <li>Duas pessoas vinculadas à mesma casa</li>
                <li>Divisão personalizada e transparente de cada gasto</li>
                <li>Orçamento, cômodos e itens compartilhados</li>
              </ul>
              <div className="mt-6 inline-flex items-center gap-2 font-semibold text-xs text-emerald-800 bg-emerald-100/70 px-3.5 py-2 rounded-xl border border-emerald-200">
                ✓ Recomendado para quem vai morar junto
              </div>
            </div>
            <div className="st-anexo max-w-none flex-1 basis-[380px]">
              <div className="font-display font-semibold text-[26px] text-slate-900">
                Conta individual
              </div>
              <ul className="ls-anexo">
                <li>Para quem está montando a casa sozinho</li>
                <li>Mesmos cômodos, itens e orçamento</li>
                <li>Pode virar casal depois</li>
              </ul>
              <div className="mt-6 inline-flex items-center gap-2 font-semibold text-xs text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
                ✓ Perfeito para morar sozinho ou planejar antes
              </div>
            </div>
          </div>
        </section>

        {/* Dúvidas comuns */}
        <section
          id="duvidas"
          className={`py-[72px] reveal-section transition-all duration-300 ${
            highlightedSection === "duvidas" ? "section-highlight ring-4 ring-emerald-500/20" : ""
          }`}
        >
          <h2 className="h2-anexo">Dúvidas comuns</h2>
          <div className="mt-7">
            <div className="row-anexo">
              <div className="w-full sm:w-[380px] max-w-full shrink-0 font-display font-semibold text-[20px] text-slate-900">
                Preciso pagar para usar?
              </div>
              <p className="flex-1 basis-[300px] m-0 text-[16px] leading-[1.6] text-slate-600">
                Não. O CasalPlanner é 100% gratuito para planejar a montagem da casa, seja na conta
                individual ou de casal.
              </p>
            </div>
            <div className="row-anexo">
              <div className="w-full sm:w-[380px] max-w-full shrink-0 font-display font-semibold text-[20px] text-slate-900">
                Funciona no celular?
              </div>
              <p className="flex-1 basis-[300px] m-0 text-[16px] leading-[1.6] text-slate-600">
                Sim. Dá para usar no navegador e instalar na tela inicial como aplicativo.
              </p>
            </div>
            <div className="row-anexo">
              <div className="w-full sm:w-[380px] max-w-full shrink-0 font-display font-semibold text-[20px] text-slate-900">
                Nós dois vemos as mesmas informações?
              </div>
              <p className="flex-1 basis-[300px] m-0 text-[16px] leading-[1.6] text-slate-600">
                Na conta de casal, sim: os cômodos, itens e orçamento são os mesmos para as duas
                pessoas.
              </p>
            </div>
            <div className="row-anexo">
              <div className="w-full sm:w-[380px] max-w-full shrink-0 font-display font-semibold text-[20px] text-slate-900">
                Posso usar sem a outra pessoa?
              </div>
              <p className="flex-1 basis-[300px] m-0 text-[16px] leading-[1.6] text-slate-600">
                Pode. A conta individual tem os mesmos recursos de planejamento.
              </p>
            </div>
            <div className="row-anexo border-b border-slate-200">
              <div className="w-full sm:w-[380px] max-w-full shrink-0 font-display font-semibold text-[20px] text-slate-900">
                E se eu esquecer a senha?
              </div>
              <p className="flex-1 basis-[300px] m-0 text-[16px] leading-[1.6] text-slate-600">
                Use a opção de recuperar senha na tela de entrada e siga os passos.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="pb-[72px] flex items-center justify-between gap-6 flex-wrap reveal-section">
          <h2 className="h2-anexo text-[38px] sm:text-[44px] max-w-[600px]">
            Criem a conta e montem o primeiro cômodo.
          </h2>
          <Link
            to="/login"
            search={{ registrar: 1 }}
            className="btn-anexo bg-primary text-white hover:bg-primary-hover border-primary"
          >
            Criar conta de casal
          </Link>
        </section>

        {/* Footer */}
        <footer className="pb-[calc(2.25rem+env(safe-area-inset-bottom,0px))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] text-[14px] text-slate-500 flex justify-between items-center flex-wrap gap-2 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2.5">
            <BrandLogoIcon size="xs" className="h-6 w-6" />
            <BrandLogoText size="sm" withTagline={false} />
          </div>
          <span>Valores mostrados são exemplos.</span>
        </footer>
      </div>
    </div>
  );
}
