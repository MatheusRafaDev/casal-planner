using System.Text.Json.Serialization;

namespace CasalPlanner.Application.DTOs
{
    public class VideoPreviewDto
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("videoUrl")]
        public string VideoUrl { get; set; } = string.Empty;

        [JsonPropertyName("playerUrl")]
        public string PlayerUrl { get; set; } = string.Empty;

        [JsonPropertyName("embedHtml")]
        public string? EmbedHtml { get; set; }

        [JsonPropertyName("author")]
        public string? Author { get; set; }

        [JsonPropertyName("authorUrl")]
        public string? AuthorUrl { get; set; }

        [JsonPropertyName("thumbnailUrl")]
        public string? ThumbnailUrl { get; set; }

        [JsonPropertyName("platform")]
        public string Platform { get; set; } = "tiktok";
    }

    public class VideoPreviewRequestDto
    {
        [JsonPropertyName("url")]
        public string Url { get; set; } = string.Empty;
    }
}

