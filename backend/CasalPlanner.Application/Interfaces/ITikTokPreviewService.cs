using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CasalPlanner.Application.DTOs;

namespace CasalPlanner.Application.Interfaces
{
    public interface ITikTokPreviewService
    {
        Task<List<VideoPreviewDto>> BuscarVideosAsync(string query, CancellationToken cancellationToken = default);
        Task<VideoPreviewDto?> ObterPreviewPorUrlAsync(string url, CancellationToken cancellationToken = default);
    }
}

