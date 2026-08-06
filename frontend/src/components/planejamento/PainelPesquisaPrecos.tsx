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
import { getLogoUrl } from "@/lib/logos";
import type { PesquisaPrecoResultado } from "@/services/types";
import { PesquisaPrecosPorFoto } from "./PesquisaPrecosPorFoto";

interface Props {
  initialQuery?: string;
  onEscolher?: (r: PesquisaPrecoResultado) => void;
}

export function PainelPesquisaPrecos({ initialQuery = "", onEscolher }: Props) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState(initialQuery);
  const [ativa, setAtiva] = useState(initialQuery);
  const [registroFoto, setRegistroFoto] = useState<AnaliseFotoPreco | null>(null);

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

  const handleResultadoFoto = (resultado: AnaliseFotoPreco) => {
    const nomeIdentificado = resultado.produtoNome.trim();
    // Inicia a pesquisa online
    setQ(nomeIdentificado);
    setAtiva(nomeIdentificado);
    // Se achou preço, abre o modal de registrar
    if (resultado.preco && resultado.preco > 0) {
      setRegistroFoto(resultado);
    }
  };

  const handleFalhaFoto = () => {
    setQ("");
    setAtiva("");
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAtiva(q.trim());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Ex.: Geladeira Brastemp Frost Free"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setAtiva(q.trim());
              }
            }}
          />
        </div>
        <PesquisaPrecosPorFoto
          disabled={query.isFetching}
          onResultado={handleResultadoFoto}
          onFalha={handleFalhaFoto}
        />
        <Button type="submit" disabled={query.isFetching}>
          {query.isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Pesquisando...
            </>
          ) : (
            "Buscar"
          )}
        </Button>
      </form>

      {query.data?.marcaDetectada && (
        <div className="text-xs text-muted-foreground">
          Marca detectada:{" "}
          <span className="text-foreground font-medium">{query.data.marcaDetectada}</span>
        </div>
      )}

      {query.isError && (
        <div className="text-sm text-destructive">Não foi possível buscar preços agora.</div>
      )}

      {!ativa && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Digite o nome de um produto para ver preços das lojas.
        </div>
      )}

      <div className="space-y-2 max-h-[50dvh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {query.data?.resultados?.map((r, i) => (
          <div
            key={`${r.link}-${i}`}
            className="p-3 rounded-xl border bg-card hover:shadow-soft transition-shadow flex gap-3"
          >
            {r.thumbnail ? (
              <img
                src={r.thumbnail}
                alt=""
                className="h-16 w-16 rounded-lg object-cover border bg-muted"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-16 rounded-lg border grid place-items-center bg-muted">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium line-clamp-2">{r.titulo}</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {r.isTrusted && (
                  <Badge variant="secondary" className="gap-1">
                    <ShieldCheck className="h-3 w-3" /> Loja confiável
                  </Badge>
                )}
                {r.isMarketplace && (
                  <Badge variant="outline" className="gap-1">
                    <Store className="h-3 w-3" /> Marketplace
                  </Badge>
                )}
                {r.isUsed && <Badge variant="outline">Usado</Badge>}
                {r.marca && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 h-5 font-normal bg-muted/30 flex items-center gap-1.5"
                  >
                    {getLogoUrl(r.marca, null, resolvedDomains) && (
                      <img
                        src={getLogoUrl(r.marca, null, resolvedDomains)!}
                        alt=""
                        className="w-3.5 h-3.5 rounded-sm"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    {r.marca}
                  </Badge>
                )}
                {r.loja && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 h-5 font-normal bg-muted/30 flex items-center gap-1.5"
                  >
                    {getLogoUrl(r.loja, r.link, resolvedDomains) && (
                      <img
                        src={getLogoUrl(r.loja, r.link, resolvedDomains)!}
                        alt=""
                        className="w-3.5 h-3.5 rounded-sm"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                    {r.loja}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between mt-2 gap-2">
                <div className="font-display font-semibold text-primary">
                  {r.precoFormatado || brl(r.preco)}
                </div>
                <div className="flex gap-1">
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Abrir <ExternalLink className="h-3 w-3" />
                  </a>
                  {onEscolher && (
                    <Button size="sm" variant="secondary" onClick={() => onEscolher(r)}>
                      Usar este
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {query.data && query.data.resultados?.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-6">
            Nenhum resultado encontrado.
          </div>
        )}
      </div>

      <ConfirmarRegistroPreco
        open={!!registroFoto}
        onOpenChange={(open) => !open && setRegistroFoto(null)}
        itemId={null}
        dados={registroFoto}
        onSalvo={() => setRegistroFoto(null)}
      />
    </div>
  );
}
