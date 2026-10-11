using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using CasalPlanner.Application.Interfaces;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace CasalPlanner.Infrastructure.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<RedisCacheService> _logger;
        private readonly IConnectionMultiplexer? _redis;
        private readonly IDatabase? _db;
        private readonly bool _redisEnabled;

        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public bool IsRedisConnected => _redis != null && _redis.IsConnected;

        public RedisCacheService(
            IMemoryCache memoryCache,
            IConfiguration configuration,
            ILogger<RedisCacheService> logger,
            IConnectionMultiplexer? redis = null)
        {
            _memoryCache = memoryCache;
            _logger = logger;

            if (redis != null)
            {
                _redis = redis;
                _db = _redis.GetDatabase();
                _redisEnabled = true;
                _logger.LogInformation("🚀 [CACHE] Redis injetado e ativo com sucesso!");
            }
            else
            {
                var connStr = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING")
                    ?? Environment.GetEnvironmentVariable("REDIS_URL")
                    ?? configuration.GetConnectionString("Redis");

                if (!string.IsNullOrWhiteSpace(connStr))
                {
                    try
                    {
                        var configOptions = ParseRedisConnectionString(connStr);
                        configOptions.AbortOnConnectFail = false;
                        configOptions.ConnectTimeout = 3500;
                        configOptions.SyncTimeout = 3500;

                        _redis = ConnectionMultiplexer.Connect(configOptions);
                        _db = _redis.GetDatabase();
                        _redisEnabled = true;
                        _logger.LogInformation("🚀 [CACHE] Conectado ao Redis com sucesso ({Endpoints})", string.Join(", ", configOptions.EndPoints));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "⚠️ [CACHE] Falha ao conectar ao Redis. Usando fallback em memória (MemoryCache)");
                        _redis = null;
                        _db = null;
                        _redisEnabled = false;
                    }
                }
                else
                {
                    _logger.LogInformation("ℹ️ [CACHE] Nenhuma connection string do Redis configurada. Usando fallback ultra-rápido em memória (MemoryCache)");
                    _redis = null;
                    _db = null;
                    _redisEnabled = false;
                }
            }
        }

        private static ConfigurationOptions ParseRedisConnectionString(string connectionString)
        {
            // Trata URLs no formato redis://:senha@host:porta ou rediss://...
            if (connectionString.StartsWith("redis://", StringComparison.OrdinalIgnoreCase) ||
                connectionString.StartsWith("rediss://", StringComparison.OrdinalIgnoreCase))
            {
                var uri = new Uri(connectionString);
                var isSsl = connectionString.StartsWith("rediss://", StringComparison.OrdinalIgnoreCase);
                var options = new ConfigurationOptions
                {
                    Ssl = isSsl,
                    EndPoints = { { uri.Host, uri.Port > 0 ? uri.Port : 6379 } }
                };

                if (!string.IsNullOrEmpty(uri.UserInfo))
                {
                    var parts = uri.UserInfo.Split(':');
                    if (parts.Length > 1)
                    {
                        if (!string.IsNullOrEmpty(parts[0]) && parts[0] != "default")
                            options.User = parts[0];
                        options.Password = parts[1];
                    }
                    else
                    {
                        options.Password = parts[0];
                    }
                }
                return options;
            }

            return ConfigurationOptions.Parse(connectionString);
        }

        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                if (_redisEnabled && _db != null && _redis != null && _redis.IsConnected)
                {
                    var value = await _db.StringGetAsync(key);
                    if (value.HasValue)
                    {
                        _logger.LogDebug("⚡ [REDIS HIT] Key: {Key}", key);
                        return JsonSerializer.Deserialize<T>(value.ToString(), JsonOptions);
                    }
                    _logger.LogDebug("💨 [REDIS MISS] Key: {Key}", key);
                    return default;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "⚠️ Erro ao ler do Redis ({Key}). Tentando MemoryCache", key);
            }

            // Fallback para MemoryCache
            if (_memoryCache.TryGetValue(key, out T? memValue))
            {
                _logger.LogDebug("⚡ [MEMORY HIT] Key: {Key}", key);
                return memValue;
            }

            return default;
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var exp = expiry ?? TimeSpan.FromHours(12);

            try
            {
                if (_redisEnabled && _db != null && _redis != null && _redis.IsConnected)
                {
                    var json = JsonSerializer.Serialize(value, JsonOptions);
                    await _db.StringSetAsync(key, json, exp);
                    _logger.LogDebug("💾 [REDIS SET] Key: {Key} (TTL: {Ttl})", key, exp);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "⚠️ Erro ao gravar no Redis ({Key}). Salvando no MemoryCache", key);
            }

            // Sempre mantém no MemoryCache também para leitura instantânea local L1
            _memoryCache.Set(key, value, exp);
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                if (_redisEnabled && _db != null && _redis != null && _redis.IsConnected)
                {
                    await _db.KeyDeleteAsync(key);
                    _logger.LogDebug("🗑️ [REDIS REMOVE] Key: {Key}", key);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "⚠️ Erro ao remover do Redis ({Key})", key);
            }

            _memoryCache.Remove(key);
        }

        public async Task InvalidateUsuarioCacheAsync(string usuarioId)
        {
            if (string.IsNullOrWhiteSpace(usuarioId)) return;

            _logger.LogInformation("🔄 [CACHE TRIGGER] Invalidando cache do usuário {UsuarioId}", usuarioId);

            var chavesPadrao = new[]
            {
                $"casal:resumo:{usuarioId}",
                $"casal:itens:{usuarioId}",
                $"casal:categorias:{usuarioId}"
            };

            foreach (var k in chavesPadrao)
            {
                await RemoveAsync(k);
            }

            // Invalidação em massa no Redis se suportado
            try
            {
                if (_redisEnabled && _redis != null && _redis.IsConnected)
                {
                    foreach (var endpoint in _redis.GetEndPoints())
                    {
                        var server = _redis.GetServer(endpoint);
                        if (server.IsConnected)
                        {
                            var pattern = $"casal:*:{usuarioId}*";
                            foreach (var key in server.Keys(pattern: pattern))
                            {
                                await _db!.KeyDeleteAsync(key);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogDebug(ex, "Aviso ao realizar varredura por padrão de chaves no Redis");
            }
        }

        public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
        {
            var cached = await GetAsync<T>(key);
            if (cached != null) return cached;

            var result = await factory();
            if (result != null)
            {
                await SetAsync(key, result, expiry);
            }
            return result;
        }
    }
}
