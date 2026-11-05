using System.Net.Http;
using System.Threading.Tasks;
using CasalPlanner.Infrastructure.Services;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace CasalPlanner.Tests
{
    public class TikTokPreviewServiceTests
    {
        private readonly TikTokPreviewService _service;

        public TikTokPreviewServiceTests()
        {
            var httpClient = new HttpClient();
            var memoryCache = new MemoryCache(new MemoryCacheOptions());
            var loggerMock = new Mock<ILogger<TikTokPreviewService>>();

            _service = new TikTokPreviewService(httpClient, memoryCache, loggerMock.Object);
        }

        [Fact]
        public async Task BuscarVideosAsync_QueryVazia_RetornaListaVazia()
        {
            var res = await _service.BuscarVideosAsync("");
            Assert.Empty(res);

            var resWhitespace = await _service.BuscarVideosAsync("   ");
            Assert.Empty(resWhitespace);
        }

        [Fact]
        public async Task ObterPreviewPorUrlAsync_UrlInvalida_RetornaNull()
        {
            var res = await _service.ObterPreviewPorUrlAsync("");
            Assert.Null(res);

            var res2 = await _service.ObterPreviewPorUrlAsync("https://google.com");
            Assert.Null(res2);
        }

        [Fact]
        public async Task ObterPreviewPorUrlAsync_TikTokUrlValida_ExtraiInformacoesCorretamente()
        {
            var url = "https://www.tiktok.com/@mondial_br/video/7403085602133921029";
            var preview = await _service.ObterPreviewPorUrlAsync(url);

            Assert.NotNull(preview);
            Assert.Equal("7403085602133921029", preview.Id);
            Assert.Equal("tiktok", preview.Platform);
            Assert.Contains("7403085602133921029", preview.PlayerUrl);
            Assert.Contains("iframe", preview.EmbedHtml);
        }

        [Fact]
        public async Task ObterPreviewPorUrlAsync_YouTubeShortsUrlValida_ExtraiInformacoesCorretamente()
        {
            var url = "https://www.youtube.com/shorts/dQw4w9WgXcQ";
            var preview = await _service.ObterPreviewPorUrlAsync(url);

            Assert.NotNull(preview);
            Assert.Equal("dQw4w9WgXcQ", preview.Id);
            Assert.Equal("youtube", preview.Platform);
            Assert.Contains("dQw4w9WgXcQ", preview.PlayerUrl);
            Assert.Contains("iframe", preview.EmbedHtml);
        }
    }
}

