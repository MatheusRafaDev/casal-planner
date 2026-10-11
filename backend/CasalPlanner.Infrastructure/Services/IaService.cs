using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;

namespace CasalPlanner.Infrastructure.Services;

/// <summary>
/// Serviço orquestrador de IA / LLM baseado no catálogo https://github.com/mnfst/awesome-free-llm-apis.
/// Utiliza os provedores 100% gratuitos sem cartão de crédito com os maiores limites:
/// 1. Groq (14.400 RPD / 30 RPM com Llama 3.1 8B, 6.000 RPD com Llama 3.3 70B - sem cartão)
/// 2. Google Gemini (1.500 RPD / 15-30 RPM com Gemini 2.5 Flash / 1.5 Flash - sem cartão)
/// 3. OpenRouter (modelos gratuitos :free, ex: meta-llama/llama-3.3-70b-instruct:free - sem cartão)
/// 4. Fallback determinístico offline (regras locais inteligentes para nunca travar a aplicação)
/// </summary>
public class IaService : IIaService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<IaService> _logger;
    private readonly string _groqApiKey;
    private readonly string _geminiApiKey;
    private readonly string _openRouterApiKey;

    public IaService(HttpClient httpClient, ILogger<IaService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _groqApiKey = Environment.GetEnvironmentVariable("GROQ_API_KEY") ?? string.Empty;
        _geminiApiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? string.Empty;
        _openRouterApiKey = Environment.GetEnvironmentVariable("OPENROUTER_API_KEY") ?? string.Empty;
    }

    public async Task<string> CompletarTextoAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken = default)
    {
        // 1. Tentar Groq (maior limite gratuito diário: até 14.400 requisições/dia)
        if (!string.IsNullOrWhiteSpace(_groqApiKey))
        {
            try
            {
                var resposta = await ChamarOpenAiCompativelAsync(
                    url: "https://api.groq.com/openai/v1/chat/completions",
                    apiKey: _groqApiKey,
                    modelo: "llama-3.1-8b-instant",
                    systemPrompt: systemPrompt,
                    userPrompt: userPrompt,
                    cancellationToken: cancellationToken);

                if (!string.IsNullOrWhiteSpace(resposta))
                {
                    _logger.LogInformation("[LLM] Resposta gerada via Groq com sucesso.");
                    return resposta;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[LLM] Falha no Groq. Tentando provedor secundário...");
            }
        }

        // 2. Tentar Google Gemini (1.500 requisições/dia gratuitas no AI Studio)
        if (!string.IsNullOrWhiteSpace(_geminiApiKey))
        {
            try
            {
                var resposta = await ChamarGeminiAsync(systemPrompt, userPrompt, cancellationToken);
                if (!string.IsNullOrWhiteSpace(resposta))
                {
                    _logger.LogInformation("[LLM] Resposta gerada via Google Gemini com sucesso.");
                    return resposta;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[LLM] Falha no Google Gemini. Tentando fallback OpenRouter...");
            }
        }

        // 3. Tentar OpenRouter (:free models)
        if (!string.IsNullOrWhiteSpace(_openRouterApiKey))
        {
            try
            {
                var resposta = await ChamarOpenAiCompativelAsync(
                    url: "https://openrouter.ai/api/v1/chat/completions",
                    apiKey: _openRouterApiKey,
                    modelo: "meta-llama/llama-3.3-70b-instruct:free",
                    systemPrompt: systemPrompt,
                    userPrompt: userPrompt,
                    cancellationToken: cancellationToken,
                    headersCustom: new Dictionary<string, string>
                    {
                        { "HTTP-Referer", "https://casalplanner.vercel.app" },
                        { "X-Title", "CasalPlanner" }
                    });

                if (!string.IsNullOrWhiteSpace(resposta))
                {
                    _logger.LogInformation("[LLM] Resposta gerada via OpenRouter (:free) com sucesso.");
                    return resposta;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[LLM] Falha no OpenRouter.");
            }
        }

        throw new InvalidOperationException("Nenhum provedor de LLM gratuito disponível ou chaves não configuradas.");
    }

    public async Task<IEnumerable<SugestaoItemDto>> ObterSugestoesComodoAsync(string comodo, CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            "Você é um especialista em planejamento de enxoval e compras de casa nova para casais no Brasil. " +
            "Responda estritamente com um JSON array de objetos no formato: " +
            "[{\"nome\": string, \"motivo\": string, \"estimativa\": number, \"prioridade\": \"Alta\"|\"Média\"|\"Baixa\"}]. " +
            "NÃO inclua blocos markdown (```json), NÃO inclua texto explicativo antes ou depois. APENAS o JSON.";

        var userPrompt = $"Sugira entre 6 e 10 itens essenciais e práticos para o cômodo '{comodo}'. Valores de estimativa em Reais (BRL).";

        try
        {
            var texto = await CompletarTextoAsync(systemPrompt, userPrompt, cancellationToken);
            var limpo = LimparJson(texto);
            var resultado = JsonSerializer.Deserialize<List<SugestaoItemDto>>(limpo, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (resultado != null && resultado.Count > 0) return resultado;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[IaService] Falha ao obter sugestões via LLM para o cômodo {Comodo}. Aplicando fallback local.", comodo);
        }

        return ObterSugestoesFallback(comodo);
    }

    public async Task<DetectarDuplicataResponseDto> DetectarDuplicataAsync(string nomeItem, IEnumerable<string> itensExistentes, CancellationToken cancellationToken = default)
    {
        var lista = itensExistentes.Where(i => !string.IsNullOrWhiteSpace(i)).Select(i => i.Trim()).Distinct().ToList();
        if (!lista.Any())
            return new DetectarDuplicataResponseDto { Duplicata = false };

        var systemPrompt =
            "Você é um detector de duplicatas para lista de compras de enxoval de casal. " +
            "Analise se o NOVO ITEM já está essencialmente presente na lista de ITENS EXISTENTES (ex: 'Air Fryer Mondial' e 'Fritadeira Elétrica Electrolux' são o mesmo tipo de eletrodoméstico). " +
            "Responda estritamente em JSON: {\"duplicata\": boolean, \"itemSimilar\": string|null, \"motivo\": string|null}. " +
            "NÃO inclua markdown nem texto adicional.";

        var userPrompt = $"NOVO ITEM: \"{nomeItem}\"\nITENS EXISTENTES NO CÔMODO:\n- {string.Join("\n- ", lista)}";

        try
        {
            var texto = await CompletarTextoAsync(systemPrompt, userPrompt, cancellationToken);
            var limpo = LimparJson(texto);
            var resultado = JsonSerializer.Deserialize<DetectarDuplicataResponseDto>(limpo, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (resultado != null) return resultado;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[IaService] Falha na detecção de duplicata por LLM para '{Item}'. Usando fallback heurístico.", nomeItem);
        }

        // Fallback heurístico simples
        var similar = lista.FirstOrDefault(item =>
            item.Contains(nomeItem, StringComparison.OrdinalIgnoreCase) ||
            nomeItem.Contains(item, StringComparison.OrdinalIgnoreCase));

        return new DetectarDuplicataResponseDto
        {
            Duplicata = similar != null,
            ItemSimilar = similar,
            Motivo = similar != null ? $"Nome similar a '{similar}' já cadastrado." : null
        };
    }

    public async Task<EstimativaComodoDto> ObterEstimativaComodoAsync(string comodo, CancellationToken cancellationToken = default)
    {
        var systemPrompt =
            "Você é um consultor financeiro de enxoval doméstico no Brasil. " +
            "Calcule faixas de orçamento realistas em BRL para mobiliar/equipar o cômodo indicado. " +
            "Responda APENAS com JSON: {\"comodo\": string, \"faixaEssencial\": number, \"faixaMedia\": number, \"faixaCompleta\": number, \"descricao\": string}. " +
            "Sem markdown, sem texto extra.";

        var userPrompt = $"Cômodo: {comodo}";

        try
        {
            var texto = await CompletarTextoAsync(systemPrompt, userPrompt, cancellationToken);
            var limpo = LimparJson(texto);
            var resultado = JsonSerializer.Deserialize<EstimativaComodoDto>(limpo, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (resultado != null) return resultado;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[IaService] Falha na estimativa de orçamento para {Comodo}. Aplicando fallback.", comodo);
        }

        return new EstimativaComodoDto
        {
            Comodo = comodo,
            FaixaEssencial = 1500,
            FaixaMedia = 3500,
            FaixaCompleta = 7000,
            Descricao = $"Estimativa baseada em itens essenciais e acabamentos médios para {comodo}."
        };
    }

    public async Task<Dictionary<string, string>> DescobrirDominiosAsync(IEnumerable<string> lojas, CancellationToken cancellationToken = default)
    {
        var resultado = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var pendentes = new List<string>();

        // 1. Tenta base de conhecimento local conhecida (zero latência)
        foreach (var loja in lojas.Where(l => !string.IsNullOrWhiteSpace(l)).Select(l => l.Trim()).Distinct())
        {
            var dominioConhecido = ObterDominioConhecido(loja);
            if (dominioConhecido != null)
                resultado[loja] = dominioConhecido;
            else
                pendentes.Add(loja);
        }

        if (!pendentes.Any()) return resultado;

        // 2. Resolve pendentes via LLM
        var systemPrompt =
            "Você é um resolvedor de domínios oficiais de e-commerces e lojas do Brasil. " +
            "Dado uma lista de nomes de lojas, retorne um dicionário JSON mapeando o nome da loja para seu domínio oficial (ex: \"Magazine Luiza\": \"magazineluiza.com.br\"). " +
            "Responda estritamente com JSON no formato: {\"Nome Loja\": \"dominio.com.br\"}. Sem markdown.";

        var userPrompt = $"Lojas:\n- {string.Join("\n- ", pendentes)}";

        try
        {
            var texto = await CompletarTextoAsync(systemPrompt, userPrompt, cancellationToken);
            var limpo = LimparJson(texto);
            var dominiosLlm = JsonSerializer.Deserialize<Dictionary<string, string>>(limpo, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (dominiosLlm != null)
            {
                foreach (var (k, v) in dominiosLlm)
                {
                    if (!string.IsNullOrWhiteSpace(v))
                        resultado[k] = v.Trim().ToLowerInvariant().Replace("https://", "").Replace("http://", "").TrimEnd('/');
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[IaService] Falha ao resolver domínios de lojas via LLM.");
        }

        // Preenche os restantes com slug simples
        foreach (var loja in pendentes)
        {
            if (!resultado.ContainsKey(loja))
                resultado[loja] = $"{Regex.Replace(loja.ToLowerInvariant(), @"[^a-z0-9]", "")}.com.br";
        }

        return resultado;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Clientes de Protocolo (OpenAI SDK-compatible & Gemini)
    // ─────────────────────────────────────────────────────────────────────────

    private async Task<string> ChamarOpenAiCompativelAsync(
        string url,
        string apiKey,
        string modelo,
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken,
        Dictionary<string, string>? headersCustom = null)
    {
        var requestBody = new
        {
            model = modelo,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userPrompt }
            },
            temperature = 0.2
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        if (headersCustom != null)
        {
            foreach (var (k, v) in headersCustom)
                request.Headers.TryAddWithoutValidation(k, v);
        }

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Erro no provedor OpenAI-compatível ({url}): [{(int)response.StatusCode}] {responseBody}");
        }

        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;
        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var choice = choices[0];
            if (choice.TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var content))
            {
                return content.GetString()?.Trim() ?? string.Empty;
            }
        }

        return string.Empty;
    }

    private async Task<string> ChamarGeminiAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken)
    {
        var modelo = "gemini-2.5-flash";
        var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent?key={_geminiApiKey}";

        var requestBody = new
        {
            system_instruction = new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            contents = new[]
            {
                new
                {
                    parts = new[] { new { text = userPrompt } }
                }
            },
            generation_config = new
            {
                temperature = 0.2
            }
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
        };

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Erro na chamada ao Google Gemini: [{(int)response.StatusCode}] {responseBody}");
        }

        using var doc = JsonDocument.Parse(responseBody);
        var root = doc.RootElement;
        if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
        {
            var candidate = candidates[0];
            if (candidate.TryGetProperty("content", out var content) &&
                content.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0)
            {
                return parts[0].GetProperty("text").GetString()?.Trim() ?? string.Empty;
            }
        }

        return string.Empty;
    }

    private static string LimparJson(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto)) return "{}";
        var t = texto.Trim();
        t = Regex.Replace(t, @"^```(json)?\s*", "", RegexOptions.IgnoreCase | RegexOptions.Multiline);
        t = Regex.Replace(t, @"\s*```$", "", RegexOptions.Multiline);
        return t.Trim();
    }

    private static string? ObterDominioConhecido(string nome)
    {
        var norm = nome.ToLowerInvariant();
        if (norm.Contains("magalu") || norm.Contains("magazine luiza")) return "magazineluiza.com.br";
        if (norm.Contains("mercado livre") || norm.Contains("mercadolivre")) return "mercadolivre.com.br";
        if (norm.Contains("amazon")) return "amazon.com.br";
        if (norm.Contains("shopee")) return "shopee.com.br";
        if (norm.Contains("tok&stok") || norm.Contains("tok stok") || norm.Contains("tokstok")) return "tokstok.com.br";
        if (norm.Contains("leroy") || norm.Contains("leroy merlin")) return "leroymerlin.com.br";
        if (norm.Contains("camicado")) return "camicado.com.br";
        if (norm.Contains("casas bahia")) return "casasbahia.com.br";
        if (norm.Contains("ponto frio") || norm.Contains("pontofrio")) return "pontofrio.com.br";
        if (norm.Contains("americanas")) return "americanas.com.br";
        if (norm.Contains("fast shop")) return "fastshop.com.br";
        if (norm.Contains("mobly")) return "mobly.com.br";
        if (norm.Contains("madesa")) return "madesa.com";
        if (norm.Contains("polishop")) return "polishop.com.br";
        if (norm.Contains("etna")) return "etna.com.br";
        return null;
    }

    private static List<SugestaoItemDto> ObterSugestoesFallback(string comodo)
    {
        var c = comodo.ToLowerInvariant();
        if (c.Contains("cozinha"))
        {
            return new List<SugestaoItemDto>
            {
                new() { Nome = "Jogo de Panelas Antiaderente (5 peças)", Motivo = "Item indispensável para cozinhar no dia a dia", Estimativa = 249.90m, Prioridade = "Alta" },
                new() { Nome = "Air Fryer 4L", Motivo = "Praticidade e economia de gás/óleo para o casal", Estimativa = 299.00m, Prioridade = "Alta" },
                new() { Nome = "Faqueiro Inox 24 peças", Motivo = "Básico para refeições cotidianas e visitas", Estimativa = 89.90m, Prioridade = "Alta" },
                new() { Nome = "Conjunto de Pratos e Xícaras (16 peças)", Motivo = "Aparelho de jantar essencial para o casal", Estimativa = 159.00m, Prioridade = "Alta" },
                new() { Nome = "Escorredor de Louça Inox", Motivo = "Organização da pia", Estimativa = 79.90m, Prioridade = "Média" },
                new() { Nome = "Tábua de Corte e Utensílios de Silicone", Motivo = "Preserva as panelas antiaderentes", Estimativa = 69.90m, Prioridade = "Média" }
            };
        }

        if (c.Contains("quarto"))
        {
            return new List<SugestaoItemDto>
            {
                new() { Nome = "Jogo de Cama 4 Peças (Percal)", Motivo = "Conforto térmico e durabilidade para dormir bem", Estimativa = 179.90m, Prioridade = "Alta" },
                new() { Nome = "Travesseiros com Suporte Médio (Par)", Motivo = "Saúde postural do casal", Estimativa = 119.00m, Prioridade = "Alta" },
                new() { Nome = "Protetor de Colchão Impermeável", Motivo = "Protege e aumenta a vida útil do colchão novo", Estimativa = 89.90m, Prioridade = "Alta" },
                new() { Nome = "Edredom ou Cobertor Dupla Face", Motivo = "Dias frios e aconchego", Estimativa = 199.00m, Prioridade = "Média" },
                new() { Nome = "Kit Cabides Aveludados (30 un)", Motivo = "Organização do guarda-roupa sem amassar roupas", Estimativa = 69.90m, Prioridade = "Média" }
            };
        }

        if (c.Contains("banheiro"))
        {
            return new List<SugestaoItemDto>
            {
                new() { Nome = "Jogo de Toalhas Banho e Rosto (4 Peças)", Motivo = "Higiene diária do casal", Estimativa = 139.90m, Prioridade = "Alta" },
                new() { Nome = "Kit Acessórios de Pia (Porta Sabonete/Escova)", Motivo = "Organização e estética da bancada", Estimativa = 59.90m, Prioridade = "Alta" },
                new() { Nome = "Tapete Antiderrapante para Box", Motivo = "Segurança e conforto térmico ao sair do banho", Estimativa = 49.90m, Prioridade = "Alta" },
                new() { Nome = "Lixeira com Tampa Click/Pedal Inox", Motivo = "Higiene e contenção de odores", Estimativa = 69.90m, Prioridade = "Alta" }
            };
        }

        if (c.Contains("sala"))
        {
            return new List<SugestaoItemDto>
            {
                new() { Nome = "Almofadas Decorativas (Conjunto 4 un)", Motivo = "Conforto extra no sofá e decoração", Estimativa = 99.00m, Prioridade = "Média" },
                new() { Nome = "Cortina Blackout / Tecido Leve", Motivo = "Controle de luminosidade para assistir TV", Estimativa = 149.00m, Prioridade = "Alta" },
                new() { Nome = "Manta Decorativa para Sofá", Motivo = "Protege o tecido do sofá e aquece", Estimativa = 79.90m, Prioridade = "Média" },
                new() { Nome = "Organizador de Cabos e Filtro de Linha", Motivo = "Segurança elétrica para TV e aparelhos", Estimativa = 49.90m, Prioridade = "Alta" }
            };
        }

        return new List<SugestaoItemDto>
        {
            new() { Nome = $"Kit Básico de Organização para {comodo}", Motivo = "Itens fundamentais para iniciar o ambiente", Estimativa = 120.00m, Prioridade = "Alta" },
            new() { Nome = "Lixeira e Cestos Organizadores", Motivo = "Praticidade e limpeza", Estimativa = 65.00m, Prioridade = "Média" }
        };
    }
}
