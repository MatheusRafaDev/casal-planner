import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ExternalLink, Loader2, ShieldCheck, Store, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pesquisaPrecosService } from "@/services/pesquisa-precos";
import type { PesquisaPrecoResultado } from "@/services/types";
import { brl } from "@/lib/formatters";

interface Props {
  initialQuery?: string;
  onEscolher?: (r: PesquisaPrecoResultado) => void;
}

export function PainelPesquisaPrecos({ initialQuery = "", onEscolher }: Props) {
  const [q, setQ] = useState(initialQuery);
  const [ativa, setAtiva] = useState(initialQuery);

  const query = useQuery({
    queryKey: ["pesquisa-precos", ativa],
    queryFn: () => pesquisaPrecosService.buscar(ativa),
    enabled: ativa.trim().length > 2,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAtiva(q.trim());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Ex.: Geladeira Brastemp Frost Free"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={query.isFetching}>
          {query.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
        </Button>
      </form>

      {query.data?.marcaDetectada && (
        <div className="text-xs text-muted-foreground">
          Marca detectada: <span className="text-foreground font-medium">{query.data.marcaDetectada}</span>
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

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
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
                {r.loja && <span className="text-xs text-muted-foreground">{r.loja}</span>}
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
    </div>
  );
}
