using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using CasalPlanner.Application.DTOs;
using CasalPlanner.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;

namespace CasalPlanner.Infrastructure.Services
{
    public class TikTokPreviewService : ITikTokPreviewService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private readonly ILogger<TikTokPreviewService> _logger;

        private static readonly Regex TikTokVideoUrlRegex = new(
            @"tiktok\.com/@(?<author>[^/]+)/video/(?<id>\d+)",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        private static readonly Regex YouTubeVideoRegex = new(
            @"(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)(?<id>[a-zA-Z0-9_-]{11})",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public TikTokPreviewService(
            HttpClient httpClient,
            IMemoryCache cache,
            ILogger<TikTokPreviewService> logger)
        {
            _httpClient = httpClient;
            _cache = cache;
            _logger = logger;
        }

        public async Task<List<VideoPreviewDto>> BuscarVideosAsync(string query, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<VideoPreviewDto>();

            var cleanQuery = LimparQuery(query);
            var cacheKey = $"video_previews:{cleanQuery.ToLowerInvariant()}";

            if (_cache.TryGetValue(cacheKey, out List<VideoPreviewDto>? cached) && cached != null)
            {
                _logger.LogInformation("Cache HIT para vídeos de {Query}", cleanQuery);
                return cached;
            }

            var resultados = new List<VideoPreviewDto>();
            var apiKey = Environment.GetEnvironmentVariable("SERPAPI_KEY");

            if (!string.IsNullOrEmpty(apiKey))
            {
                try
                {
                    // 1. Busca vídeos no TikTok via SerpApi com o texto exato do item
                    var tiktokQuery = $"site:tiktok.com {cleanQuery}";
                    var url = $"https://serpapi.com/search.json?engine=duckduckgo&q={Uri.EscapeDataString(tiktokQuery)}&api_key={apiKey}";

                    using var res = await _httpClient.GetAsync(url, cancellationToken);
                    if (res.IsSuccessStatusCode)
                    {
                        var json = await res.Content.ReadAsStringAsync(cancellationToken);
                        using var doc = JsonDocument.Parse(json);

                        if (doc.RootElement.TryGetProperty("organic_results", out var organic) && organic.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var item in organic.EnumerateArray())
                            {
                                var link = item.TryGetProperty("link", out var l) ? l.GetString() ?? "" : "";
                                var match = TikTokVideoUrlRegex.Match(link);

                                if (match.Success)
                                {
                                    var videoId = match.Groups["id"].Value;
                                    var author = match.Groups["author"].Value;
                                    var title = item.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";

                                    // Limpar sufixos comuns do título
                                    title = Regex.Replace(title, @"\s*\|\s*TikTok$", "", RegexOptions.IgnoreCase).Trim();

                                    if (resultados.All(r => r.Id != videoId))
                                    {
                                        resultados.Add(CriarTikTokPreview(videoId, author, link, title));
                                    }
                                }

                                if (resultados.Count >= 5) break;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Erro ao buscar vídeos do TikTok via SerpApi para query: {Query}", cleanQuery);
                }

                // 2. Se encontrar menos de 2 vídeos no TikTok, buscar shorts/reviews no YouTube como complemento
                if (resultados.Count < 2)
                {
                    try
                    {
                        var ytUrl = $"https://serpapi.com/search.json?engine=youtube&search_query={Uri.EscapeDataString(cleanQuery + " review")}&api_key={apiKey}";
                        using var ytRes = await _httpClient.GetAsync(ytUrl, cancellationToken);
                        if (ytRes.IsSuccessStatusCode)
                        {
                            var ytJson = await ytRes.Content.ReadAsStringAsync(cancellationToken);
                            using var ytDoc = JsonDocument.Parse(ytJson);

                            if (ytDoc.RootElement.TryGetProperty("video_results", out var vids) && vids.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var vid in vids.EnumerateArray())
                                {
                                    var link = vid.TryGetProperty("link", out var l) ? l.GetString() ?? "" : "";
                                    var match = YouTubeVideoRegex.Match(link);
                                    if (match.Success)
                                    {
                                        var vidId = match.Groups["id"].Value;
                                        var title = vid.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                                        var channel = vid.TryGetProperty("channel", out var c) && c.TryGetProperty("name", out var cn) ? cn.GetString() : null;
                                        var thumb = vid.TryGetProperty("thumbnail", out var th) && th.TryGetProperty("static", out var st) ? st.GetString() : $"https://i.ytimg.com/vi/{vidId}/hqdefault.jpg";

                                        if (resultados.All(r => r.Id != vidId))
                                        {
                                            resultados.Add(new VideoPreviewDto
                                            {
                                                Id = vidId,
                                                Title = title,
                                                VideoUrl = link,
                                                PlayerUrl = $"https://www.youtube.com/embed/{vidId}?autoplay=1",
                                                EmbedHtml = $"<iframe width=\"325\" height=\"578\" src=\"https://www.youtube.com/embed/{vidId}?autoplay=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
                                                Author = channel,
                                                ThumbnailUrl = thumb,
                                                Platform = "youtube"
                                            });
                                        }
                                    }

                                    if (resultados.Count >= 6) break;
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Erro ao buscar vídeos complementares no YouTube para: {Query}", cleanQuery);
                    }
                }
            }

            // Cache por 30 minutos
            if (resultados.Count > 0)
            {
                _cache.Set(cacheKey, resultados, TimeSpan.FromMinutes(30));
            }

            return resultados;
        }

        public async Task<VideoPreviewDto?> ObterPreviewPorUrlAsync(string url, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(url)) return null;

            url = url.Trim();

            // Verifica se é TikTok
            var matchTikTok = TikTokVideoUrlRegex.Match(url);
            if (matchTikTok.Success || url.Contains("tiktok.com"))
            {
                try
                {
                    var oembedUrl = $"https://www.tiktok.com/oembed?url={Uri.EscapeDataString(url)}";
                    using var res = await _httpClient.GetAsync(oembedUrl, cancellationToken);
                    if (res.IsSuccessStatusCode)
                    {
                        var json = await res.Content.ReadAsStringAsync(cancellationToken);
                        using var doc = JsonDocument.Parse(json);

                        var title = doc.RootElement.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                        var author = doc.RootElement.TryGetProperty("author_name", out var a) ? a.GetString() ?? "" : "";
                        var authorUrl = doc.RootElement.TryGetProperty("author_url", out var au) ? au.GetString() ?? "" : "";
                        var html = doc.RootElement.TryGetProperty("html", out var h) ? h.GetString() ?? "" : "";
                        var thumb = doc.RootElement.TryGetProperty("thumbnail_url", out var th) ? th.GetString() : null;
                        var vidId = doc.RootElement.TryGetProperty("embed_product_id", out var ep) ? ep.GetString() : null;

                        if (string.IsNullOrEmpty(vidId) && matchTikTok.Success)
                            vidId = matchTikTok.Groups["id"].Value;

                        vidId ??= Guid.NewGuid().ToString("N");

                        return new VideoPreviewDto
                        {
                            Id = vidId,
                            Title = string.IsNullOrWhiteSpace(title) ? "Vídeo no TikTok" : title,
                            VideoUrl = url,
                            PlayerUrl = $"https://www.tiktok.com/player/v1/{vidId}?embed_from=oembed&music_info=1&description=1&autoplay=1&muted=1",
                            EmbedHtml = !string.IsNullOrEmpty(html) ? html : CriarIframeTikTok(vidId),
                            Author = author,
                            AuthorUrl = authorUrl,
                            ThumbnailUrl = thumb,
                            Platform = "tiktok"
                        };
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Erro no oEmbed do TikTok para URL: {Url}", url);
                }

                if (matchTikTok.Success)
                {
                    var videoId = matchTikTok.Groups["id"].Value;
                    var author = matchTikTok.Groups["author"].Value;
                    return CriarTikTokPreview(videoId, author, url, "Vídeo do TikTok");
                }
            }

            // Verifica se é YouTube
            var matchYt = YouTubeVideoRegex.Match(url);
            if (matchYt.Success)
            {
                var vidId = matchYt.Groups["id"].Value;
                try
                {
                    var oembedUrl = $"https://www.youtube.com/oembed?url={Uri.EscapeDataString(url)}&format=json";
                    using var res = await _httpClient.GetAsync(oembedUrl, cancellationToken);
                    if (res.IsSuccessStatusCode)
                    {
                        var json = await res.Content.ReadAsStringAsync(cancellationToken);
                        using var doc = JsonDocument.Parse(json);
                        var title = doc.RootElement.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                        var author = doc.RootElement.TryGetProperty("author_name", out var a) ? a.GetString() ?? "" : "";
                        var thumb = doc.RootElement.TryGetProperty("thumbnail_url", out var th) ? th.GetString() : $"https://i.ytimg.com/vi/{vidId}/hqdefault.jpg";

                        return new VideoPreviewDto
                        {
                            Id = vidId,
                            Title = title,
                            VideoUrl = url,
                            PlayerUrl = $"https://www.youtube.com/embed/{vidId}?autoplay=1",
                            EmbedHtml = $"<iframe width=\"325\" height=\"578\" src=\"https://www.youtube.com/embed/{vidId}?autoplay=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
                            Author = author,
                            ThumbnailUrl = thumb,
                            Platform = "youtube"
                        };
                    }
                }
                catch
                {
                    // Fallback se oEmbed falhar
                }

                return new VideoPreviewDto
                {
                    Id = vidId,
                    Title = "Vídeo do YouTube",
                    VideoUrl = url,
                    PlayerUrl = $"https://www.youtube.com/embed/{vidId}?autoplay=1",
                    EmbedHtml = $"<iframe width=\"325\" height=\"578\" src=\"https://www.youtube.com/embed/{vidId}?autoplay=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>",
                    ThumbnailUrl = $"https://i.ytimg.com/vi/{vidId}/hqdefault.jpg",
                    Platform = "youtube"
                };
            }

            return null;
        }

        private static VideoPreviewDto CriarTikTokPreview(string videoId, string author, string link, string title)
        {
            return new VideoPreviewDto
            {
                Id = videoId,
                Title = string.IsNullOrWhiteSpace(title) ? $"Demonstração de @{author}" : title,
                VideoUrl = link,
                PlayerUrl = $"https://www.tiktok.com/player/v1/{videoId}?embed_from=oembed&music_info=1&description=1&autoplay=1&muted=1",
                EmbedHtml = CriarIframeTikTok(videoId),
                Author = author,
                AuthorUrl = $"https://www.tiktok.com/@{author}",
                Platform = "tiktok"
            };
        }

        private static string CriarIframeTikTok(string videoId)
        {
            return $"<iframe height=\"578\" width=\"325\" src=\"https://www.tiktok.com/player/v1/{videoId}?embed_from=oembed&music_info=1&description=1&autoplay=1&muted=1\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share\" allowfullscreen loading=\"lazy\"></iframe>";
        }

        private static string LimparQuery(string q)
        {
            q = Regex.Replace(q, @"[^\w\s\-\.]", " ", RegexOptions.Compiled);
            q = Regex.Replace(q, @"\s+", " ").Trim();
            return q;
        }
    }
}

