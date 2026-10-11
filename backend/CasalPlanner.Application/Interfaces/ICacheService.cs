using System;
using System.Threading.Tasks;

namespace CasalPlanner.Application.Interfaces
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key);
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
        Task RemoveAsync(string key);
        Task InvalidateUsuarioCacheAsync(string usuarioId);
        Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null);
        bool IsRedisConnected { get; }
    }
}
