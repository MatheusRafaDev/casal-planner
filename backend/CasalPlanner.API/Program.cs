using System.Text;
using Serilog;
using CasalPlanner.API.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CasalPlanner.Domain.Entities;
using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Services;
using CasalPlanner.Infrastructure.Services.Providers;
using CasalPlanner.Infrastructure.Configurations;
using DotNetEnv;
using MongoDB.Driver;
using AspNetCoreRateLimit;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration)
                 .WriteTo.Console()
);

// ===== 1. ENV =====
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath)) { Env.Load(envPath); Console.WriteLine("✅ .env carregado (local)"); }
}
else
{
    Console.WriteLine("🌐 Ambiente: Produção");
}

builder.Configuration.AddEnvironmentVariables();

// ===== 2. CONFIG =====
var jwtKey      = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? throw new Exception("JWT_SECRET_KEY não configurada");
var jwtIssuer   = Environment.GetEnvironmentVariable("JWT_ISSUER")   ?? "CasalPlanner";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "CasalPlannerUsers";

if (jwtKey.Length < 10)
    throw new Exception("JWT_SECRET_KEY deve ter no mínimo 32 caracteres");

var mongoConnection = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
    ?? throw new Exception("MONGODB_CONNECTION_STRING não configurada");

// ===== 2.5. CONFIGURAÇÃO DE CORS DINÂMICO =====
// Pega os IPs/URLs permitidos da variável de ambiente
var corsAllowedOriginsEnv = Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS") ?? "";
var allowedOriginsList = new List<string>();

if (!string.IsNullOrEmpty(corsAllowedOriginsEnv))
{
    // Se a variável existe, usa ela
    allowedOriginsList = corsAllowedOriginsEnv
        .Split(',', StringSplitOptions.RemoveEmptyEntries)
        .Select(o => o.Trim())
        .ToList();
    Console.WriteLine($"📋 CORS: Usando origens da env: {string.Join(", ", allowedOriginsList)}");
}
else
{
    // Fallback para desenvolvimento local
    allowedOriginsList = new List<string>
    {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8081",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "https://casalplanner.vercel.app",
        "https://casal-planner.vercel.app",
        "https://id-preview--faa54db4-4a66-4acd-b7a1-77156c4ecd8c.lovable.app"
    };
    Console.WriteLine("📋 CORS: Usando origens padrão (localhost)");
}

// Adiciona IPs da rede local automaticamente (opcional)
if (builder.Environment.IsDevelopment())
{
    try
    {
        var localIp = System.Net.NetworkInformation.NetworkInterface.GetAllNetworkInterfaces()
            .SelectMany(i => i.GetIPProperties().UnicastAddresses)
            .FirstOrDefault(a => a.Address.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork && 
                                 !System.Net.IPAddress.IsLoopback(a.Address))
            ?.Address.ToString();
        
        if (!string.IsNullOrEmpty(localIp))
        {
            allowedOriginsList.Add($"http://{localIp}:3000");
            allowedOriginsList.Add($"http://{localIp}:5173");
            Console.WriteLine($"🔍 IP Local detectado: {localIp}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Não foi possível detectar IP local: {ex.Message}");
    }
}

// Remove duplicatas
allowedOriginsList = allowedOriginsList.Distinct().ToList();

// ===== 3. RATE LIMIT =====
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    // RealIpHeader removido - usa fallback para HttpContext.Connection.RemoteIpAddress
    // que é preenchido corretamente pelo UseForwardedHeaders
    options.ClientIdHeader = "X-ClientId";
    var authLimit = builder.Environment.IsDevelopment() ? 100 : 10;
    // Limite agressivo para pesquisa de preços: chama Groq + SerpAPI (APIs pagas com quota)
    var pesquisaLimit = builder.Environment.IsDevelopment() ? 50 : 10;
    options.GeneralRules = new List<RateLimitRule>
    {
        new() { Endpoint = "*",                          Period = "1m",  Limit = 100 },
        new() { Endpoint = "POST:/api/auth/*",           Period = "10m", Limit = authLimit },
        new() { Endpoint = "POST:/api/recuperarsenha/*", Period = "10m", Limit = authLimit },
        // Pesquisa de preços: limite por IP (10 req/hora em prod) — protege Groq + SerpAPI
        new() { Endpoint = "GET:/api/pesquisaprecos",    Period = "1h",  Limit = pesquisaLimit },
        new() { Endpoint = "POST:/api/pesquisaprecos/analisar-foto", Period = "1h", Limit = pesquisaLimit },
        new() { Endpoint = "POST:/api/registropreco/analisar", Period = "1h", Limit = pesquisaLimit },
    };
});
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ===== 4. MONGO =====
builder.Services.Configure<MongoDBSettings>(opt =>
{
    opt.ConnectionString = mongoConnection;
    opt.DatabaseName     = "CasalPlannerDB";
});
builder.Services.AddSingleton<MongoDbContext>();

// ===== 5. JWT =====
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey         = new SymmetricSecurityKey(key),
        ValidateIssuer           = true,
        ValidIssuer              = jwtIssuer,
        ValidateAudience         = true,
        ValidAudience            = jwtAudience,
        ValidateLifetime         = true,
        ClockSkew                = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var authHeader = context.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                context.Token = authHeader["Bearer ".Length..].Trim();

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ===== 6. CORS CONFIGURADO DINAMICAMENTE =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("CasalPlannerPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Em desenvolvimento: mais flexível
            policy.SetIsOriginAllowed(_ => true)  // Permite qualquer origem
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
            Console.WriteLine("🔓 CORS: Modo desenvolvimento - liberado para testes");
        }
        else
        {
            // Em produção: apenas origens específicas da ENV
            policy.WithOrigins(allowedOriginsList.ToArray())
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
            
            Console.WriteLine($"🔒 CORS: Modo produção - origens permitidas:");
            foreach (var origin in allowedOriginsList)
            {
                Console.WriteLine($"   - {origin}");
            }
        }
    });
});

// ===== 7. SERVICES =====
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("groq", client =>
{
    client.BaseAddress = new Uri("https://api.groq.com/");
    client.Timeout = TimeSpan.FromSeconds(10);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddHttpClient<GroqVisionService>(client =>
{
    client.BaseAddress = new Uri("https://api.groq.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});
builder.Services.AddHttpClient<GeocodingService>(client =>
{
    client.BaseAddress = new Uri("https://nominatim.openstreetmap.org/");
    client.Timeout = TimeSpan.FromSeconds(10);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("CasalPlanner/1.0 (price-photo-geocoding)");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
});

// ===== 7.1. PRICE SEARCH - HttpClients com Resilience =====
builder.Services.AddHttpClient("MercadoLivreClient", client =>
{
    client.BaseAddress = new Uri("https://api.mercadolibre.com/");
    client.Timeout = TimeSpan.FromSeconds(20);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddStandardResilienceHandler(options =>
{
    options.Retry.MaxRetryAttempts = 2;
    options.Retry.Delay = TimeSpan.FromSeconds(1);
    options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
    options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(18);
});

builder.Services.AddHttpClient("GoogleShoppingClient", client =>
{
    client.BaseAddress = new Uri("https://serpapi.com/");
    client.Timeout = TimeSpan.FromSeconds(20);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddStandardResilienceHandler(options =>
{
    options.Retry.MaxRetryAttempts = 2;
    options.Retry.Delay = TimeSpan.FromSeconds(1);
    options.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
    options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(18);
});

// ===== 7.2. PRICE SEARCH - Options e Providers =====
builder.Services.Configure<PriceSearchOptions>(builder.Configuration.GetSection("PriceSearch"));

// Registra todos os providers (condicional baseado nas options e chaves disponíveis)
var priceSearchConfig = builder.Configuration.GetSection("PriceSearch").Get<PriceSearchOptions>() ?? new PriceSearchOptions();

if (priceSearchConfig.EnableMercadoLivre)
    builder.Services.AddScoped<IPriceProvider, MercadoLivreProvider>();

if (priceSearchConfig.EnableGoogleShopping)
    builder.Services.AddScoped<IPriceProvider, GoogleShoppingProvider>();

if (priceSearchConfig.EnableAmazon)
    builder.Services.AddScoped<IPriceProvider, AmazonProvider>();

builder.Services.AddScoped<IPesquisaPrecosService, PesquisaPrecosService>();

// ===== 7.3. DEMAIS SERVICES =====
builder.Services.AddSingleton<GroqService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IResumoService, ResumoService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRecuperarSenhaService, RecuperarSenhaService>();
builder.Services.AddScoped<IPushService, PushService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger apenas em desenvolvimento
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "Casal Planner API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header. Ex: Bearer {token}",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
        });
        
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });
}

// ===== BUILD =====
var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSerilogRequestLogging();


// ===== 9. HEADERS DE SEGURANÇA =====
app.Use(async (context, next) =>
{
    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "connect-src 'self' https://*.vercel.app https://*.onrender.com https://*.railway.app; " +
            "script-src 'self'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:; " +
            "frame-ancestors 'none';";
        context.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    }

    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"]        = "DENY";
    context.Response.Headers["Referrer-Policy"]        = "strict-origin-when-cross-origin";
    context.Response.Headers["X-XSS-Protection"]       = "1; mode=block";

    await next();
});

// ===== PIPELINE =====
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
else
    Console.WriteLine("🔧 Ambiente Dev: HTTP permitido");

// Configure trusted proxies for X-Forwarded-For header (prevents IP spoofing)
// In production, only trust the reverse proxy (nginx, load balancer, etc.)
if (!app.Environment.IsDevelopment())
{
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
        // Clear known networks/proxies to trust all (or configure specific IPs)
        // For most cloud providers, the load balancer is the only proxy
        KnownNetworks = { },
        KnownProxies = { }
    });
}

app.UseCors("CasalPlannerPolicy");

app.UseIpRateLimiting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== 10. SWAGGER =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Casal Planner API v1");
        c.RoutePrefix = "swagger";
    });
}

// Health check com informações de CORS
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName,
    version = "1.0.0",
    cors = new
    {
        mode = app.Environment.IsDevelopment() ? "development (all origins)" : "production",
        allowedOrigins = allowedOriginsList
    }
}));

// ===== 11. SEED E ÍNDICES =====
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();

    await dbContext.TestarConexaoAsync();

    if (app.Environment.IsDevelopment())
    {
        await dbContext.SeedDataAsync();
        Console.WriteLine("🌱 Seed executado (dev)");
    }

    await dbContext.VerificarUsuarioCasal();

    await dbContext.Itens.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<Item>(
            Builders<Item>.IndexKeys.Ascending(i => i.UsuarioId),
            new CreateIndexOptions { Name = "idx_itens_usuarioId", Background = true }),
        new CreateIndexModel<Item>(
            Builders<Item>.IndexKeys.Ascending(i => i.UsuarioId).Ascending(i => i.CategoriaId),
            new CreateIndexOptions { Name = "idx_itens_usuarioId_categoriaId", Background = true }),
        // Suporta o pipeline de aggregation do ResumoService (filtro por data)
        new CreateIndexModel<Item>(
            Builders<Item>.IndexKeys.Ascending(i => i.UsuarioId).Ascending(i => i.CreatedAt),
            new CreateIndexOptions { Name = "idx_itens_usuarioId_createdAt", Background = true }),
    });

    await dbContext.RegistrosPreco.Indexes.CreateOneAsync(new CreateIndexModel<RegistroPrecoFoto>(
        Builders<RegistroPrecoFoto>.IndexKeys.Ascending(r => r.UsuarioId).Descending(r => r.DataCompra),
        new CreateIndexOptions { Name = "idx_registros_preco_usuario_data", Background = true }));

    await dbContext.Categorias.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<Categoria>(
            Builders<Categoria>.IndexKeys.Ascending(c => c.UsuarioId),
            new CreateIndexOptions { Name = "idx_categorias_usuarioId", Background = true }),
        new CreateIndexModel<Categoria>(
            Builders<Categoria>.IndexKeys.Ascending(c => c.IsPadrao),
            new CreateIndexOptions { Name = "idx_categorias_isPadrao", Background = true }),
        // Suporta GetCategorias: filtro (UsuarioId | null) + sort (IsPadrao desc, Nome asc)
        new CreateIndexModel<Categoria>(
            Builders<Categoria>.IndexKeys
                .Ascending(c => c.UsuarioId)
                .Descending(c => c.IsPadrao)
                .Ascending(c => c.Nome),
            new CreateIndexOptions { Name = "idx_categorias_usuario_padrao_nome", Background = true }),
    });

    await dbContext.Itens.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<Item>(
            Builders<Item>.IndexKeys.Ascending(i => i.Origem),
            new CreateIndexOptions { Name = "idx_itens_origem", Background = true }),
    });

    // Índices da coleção Usuarios
    // Cobre: login individual, login casal, busca por email, recuperação de senha e convite
    await dbContext.Usuarios.Indexes.CreateManyAsync(new[]
    {
        // Login / registro individual — campo mais consultado
        new CreateIndexModel<Usuario>(
            Builders<Usuario>.IndexKeys.Ascending(u => u.Email),
            new CreateIndexOptions { Name = "idx_usuarios_email", Background = true }),

        // Login / busca por email casal — Sparse porque só casais têm CasalInfo
        new CreateIndexModel<Usuario>(
            Builders<Usuario>.IndexKeys.Ascending("CasalInfo.EmailPessoa1"),
            new CreateIndexOptions { Name = "idx_usuarios_casalinfo_email1", Background = true, Sparse = true }),

        new CreateIndexModel<Usuario>(
            Builders<Usuario>.IndexKeys.Ascending("CasalInfo.EmailPessoa2"),
            new CreateIndexOptions { Name = "idx_usuarios_casalinfo_email2", Background = true, Sparse = true }),

        // Recuperação de senha individual (ResetToken e ResetCode)
        new CreateIndexModel<Usuario>(
            Builders<Usuario>.IndexKeys.Ascending(u => u.ResetToken),
            new CreateIndexOptions { Name = "idx_usuarios_resetToken", Background = true, Sparse = true }),

        new CreateIndexModel<Usuario>(
            Builders<Usuario>.IndexKeys.Ascending(u => u.ResetCode),
            new CreateIndexOptions { Name = "idx_usuarios_resetCode", Background = true, Sparse = true }),

        // Convite de parceiro (token de convite)
        new CreateIndexModel<Usuario>(
            Builders<Usuario>.IndexKeys.Ascending(u => u.ConviteParceiroToken),
            new CreateIndexOptions { Name = "idx_usuarios_conviteToken", Background = true, Sparse = true }),
    });

    Console.WriteLine("✅ Índices verificados com sucesso");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro na inicialização: {ex.Message}");
}

// ===== 12. INICIAR SERVIDOR =====
Console.WriteLine("\n=========================================");
Console.WriteLine("🚀 Casal Planner API Iniciada");
Console.WriteLine($"🔧 Ambiente: {app.Environment.EnvironmentName}");
Console.WriteLine("=========================================");
Console.WriteLine("📋 CORS - Origens permitidas:");
foreach (var origin in allowedOriginsList)
{
    Console.WriteLine($"   ✓ {origin}");
}
Console.WriteLine("=========================================\n");

var portEnv = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(portEnv))
    app.Run($"http://0.0.0.0:{portEnv}");
else
    app.Run();
