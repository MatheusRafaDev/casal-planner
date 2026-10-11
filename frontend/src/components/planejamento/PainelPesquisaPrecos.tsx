import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, ExternalLink, Loader2, ShieldCheck, Store, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmarRegistroPreco } from "./ConfirmarRegistroPreco";
import type { AnaliseFotoPreco } from "@/services/registro-preco";
import { brl } from "@/lib/formatters";
import { groqService } from "@/services/groq";
import { pesquisaPrecosService } from "@/services/pesquisa-precos";
import { getLogoUrls } from "@/lib/logos";
import type { PesquisaPrecoResultado } from "@/services/types";
import { PesquisaPrecosPorFoto } from "./PesquisaPrecosPorFoto";
import { LogoBadge } from "@/components/ui/LogoBadge";
import { toTitleCase } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  initialQuery?: string;
  onEscolher?: (r: PesquisaPrecoResultado) => void;
}

export function PainelPesquisaPrecos({ initialQuery = "", onEscolher }: Props) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState(initialQuery);
  const [ativa, setAtiva] = useState(initialQuery);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [sort, setSort] = useState<"relevancia" | "menor_preco" | "maior_preco" | "melhor_escolha">(
    "relevancia",
  );

  useEffect(() => {
    setQ(initialQuery);
    setAtiva(initialQuery);
  }, [initialQuery]);

  const query = useQuery({
    queryKey: ["pesquisa-precos", ativa],
    queryFn: () => pesquisaPrecosService.buscar(ativa),
    enabled: ativa.trim().length > 2,
    staleTime: 60_000,
  });

  const namesToResolve = useMemo(() => {
    if (!query.data?.resultados) return [];
    const names = new Set<string>();
    query.data.resultados.forEach((r) => {
      if (r.marca) names.add(r.marca);
      if (r.loja) names.add(r.loja);
    });
    return Array.from(names);
  }, [query.data?.resultados]);

  const dominiosQuery = useQuery({
    queryKey: ["dominios", namesToResolve],
    queryFn: () => groqService.descobrirDominios(namesToResolve),
    enabled: namesToResolve.length > 0,
    staleTime: Infinity,
  });

  const resolvedDomains = dominiosQuery.data ?? {};

  const resultadosOrdenados = useMemo(() => {
    if (!query.data?.resultados) return [];
    const resultados = [...query.data.resultados];

    switch (sort) {
      case "menor_preco":
        return resultados.sort((a, b) => a.preco - b.preco);
      case "maior_preco":
        return resultados.sort((a, b) => b.preco - a.preco);
      case "melhor_escolha":
        return resultados.sort((a, b) => {
          const scoreA = (a.isTrusted ? 100 : 0) + (!a.isUsed ? 50 : 0) - a.preco * 0.01;
          const scoreB = (b.isTrusted ? 100 : 0) + (!b.isUsed ? 50 : 0) - b.preco * 0.01;
          return scoreB - scoreA;
        });
      case "relevancia":
      default:
        return resultados;
    }
  }, [query.data?.resultados, sort]);

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full h-full gap-4">
      {/* Barra de Pesquisa Fixa */}
      <div className="shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) setAtiva(q.trim());
          }}
          className="flex gap-2 p-1 bg-muted/30 rounded-[var(--radius-lg)] border-2 border-border/80"
        >
          <div className="relative flex-1 min-w-0">
            <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              className="pl-10 h-11 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base"
              placeholder="Ex: Geladeira Brastemp Frost Free..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (q.trim()) setAtiva(q.trim());
                }
              }}
            />
          </div>
          <Button
            type="submit"
            disabled={query.isFetching || !q.trim()}
            className="h-11 px-5 rounded-lg font-semibold shrink-0"
          >
            {query.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
          </Button>
        </form>

        {query.data?.marcaDetectada && (
          <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-md w-fit border border-primary/20">
            <Badge className="bg-primary hover:bg-primary uppercase text-[10px] tracking-wider px-1">
              Marca Extraída
            </Badge>
            <span className="font-semibold">{toTitleCase(query.data.marcaDetectada)}</span>
          </div>
        )}
      </div>

      {/* Estados da Pesquisa & Resultados */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {query.isError && (
          <div className="rounded-[var(--radius-lg)] border border-destructive/20 bg-destructive/5 p-6 text-center flex flex-col items-center justify-center gap-2 my-auto">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <Search className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-destructive">
              Ocorreu um erro ao buscar os preços.
            </p>
            <p className="text-xs text-destructive/70">Tente novamente ou modifique sua pesquisa.</p>
          </div>
        )}

        {!ativa && !query.isFetching && (
          <div className="rounded-[var(--radius-lg)] border-2 border-dashed p-8 text-center flex flex-col items-center justify-center gap-3 bg-muted/10 my-auto">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Store className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Pronto para pesquisar</p>
              <p className="text-xs text-muted-foreground max-w-sm">
                Digite o nome de um produto acima para comparar ofertas reais de várias lojas.
              </p>
            </div>
          </div>
        )}

        {query.isFetching && (
          <div className="rounded-[var(--radius-lg)] border-2 border-dashed p-8 text-center flex flex-col items-center justify-center gap-3 bg-muted/5 my-auto">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-bold">Analisando ofertas online...</p>
              <p className="text-xs text-muted-foreground">
                Buscando os melhores preços e lojas confiáveis.
              </p>
            </div>
          </div>
        )}

        {/* Resultados: O scroll ocorre EXCLUSIVAMENTE aqui dentro */}
        {resultadosOrdenados.length > 0 && !query.isFetching && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-3">
            <div className="flex items-center justify-between gap-3 shrink-0 px-1">
              <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                Ofertas Encontradas{" "}
                <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                  {resultadosOrdenados.length}
                </Badge>
              </h3>
              <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
                <SelectTrigger className="w-[160px] h-8 text-xs bg-background">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevancia">Relevância</SelectItem>
                  <SelectItem value="melhor_escolha">Melhor Escolha</SelectItem>
                  <SelectItem value="menor_preco">Menor Preço</SelectItem>
                  <SelectItem value="maior_preco">Maior Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Container com scroll isolado no resultado da pesquisa */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-muted/30 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-2">
                {resultadosOrdenados.map((r, i) => (
                  <div
                    key={`${r.link}-${i}`}
                    className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3.5 rounded-[var(--radius-lg)] border-2 border-border/80 bg-card hover:border-primary/60 transition-all shadow-sm"
                  >
                    {/* Imagem */}
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-white border flex items-center justify-center overflow-hidden">
                      {r.thumbnail && !imageErrors[`${r.link}-${i}`] ? (
                        <img
                          src={r.thumbnail}
                          alt={r.titulo}
                          className="h-full w-full object-contain p-1"
                          loading="lazy"
                          onError={() =>
                            setImageErrors((prev) => ({ ...prev, [`${r.link}-${i}`]: true }))
                          }
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Informações Básicas */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <h4 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-tight text-foreground/90 group-hover:text-primary transition-colors">
                        {toTitleCase(r.titulo)}
                      </h4>

                      <div className="flex flex-wrap gap-1.5">
                        {r.loja && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 h-5 font-normal bg-muted/60 flex items-center gap-1"
                          >
                            <LogoBadge
                              urls={getLogoUrls(r.loja, r.link, resolvedDomains)}
                              className="w-3.5 h-3.5 rounded-sm"
                            />
                            <span className="max-w-[90px] truncate">{toTitleCase(r.loja)}</span>
                          </Badge>
                        )}
                        {r.marca && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1.5 h-5 font-normal bg-background flex items-center gap-1"
                          >
                            <LogoBadge
                              urls={getLogoUrls(r.marca, null, resolvedDomains)}
                              className="w-3.5 h-3.5 rounded-sm"
                            />
                            <span className="max-w-[70px] truncate">{toTitleCase(r.marca)}</span>
                          </Badge>
                        )}
                        {r.isMarketplace && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-5 font-normal gap-1 border-dashed"
                          >
                            <Store className="h-3 w-3" /> MP
                          </Badge>
                        )}
                        {r.isTrusted && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-5 font-normal gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                          >
                            <ShieldCheck className="h-3 w-3" /> Seguro
                          </Badge>
                        )}
                        {r.isUsed && (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 font-normal">
                            Usado
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Ações e Preço */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2.5 sm:gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border/50 shrink-0">
                      <div className="font-display font-bold text-base text-primary whitespace-nowrap">
                        {r.precoFormatado || brl(r.preco)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={r.link}
                          target="_blank"
                          rel="noreferrer"
                          title="Visitar loja"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md border bg-background hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        {onEscolher && (
                          <Button
                            size="sm"
                            onClick={() => onEscolher(r)}
                            className="h-8 text-xs font-bold px-3 bg-primary hover:bg-primary/90"
                          >
                            Selecionar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {query.data && query.data.resultados?.length === 0 && !query.isFetching && (
          <div className="rounded-[var(--radius-lg)] border-2 border-dashed p-8 text-center flex flex-col items-center justify-center gap-3 bg-muted/10 my-auto">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold">Nenhum resultado encontrado</p>
              <p className="text-xs text-muted-foreground">Não encontramos ofertas para "{ativa}". Tente outros termos.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
