using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CasalPlanner.API.Models;
using CasalPlanner.API.Data;
using CasalPlanner.API.Services;
using DotNetEnv;
using MongoDB.Driver;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

// ===== 1. ENV =====
// Carrega .env apenas em desenvolvimento LOCAL
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath))
    {
        Env.Load(envPath);
        Console.WriteLine("✅ .env carregado (local)");
    }
}
else
{
    Console.WriteLine("🌐 Ambiente: Produção (Render/Vercel)");
}

// Configuração de variáveis de ambiente (funciona em todos os ambientes)
builder.Configuration.AddEnvironmentVariables();

// ===== 2. CONFIG =====
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "CasalPlanner";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "CasalPlannerUsers";

if (string.IsNullOrEmpty(jwtKey))
    throw new Exception("JWT_SECRET_KEY não configurada");

var mongoConnection = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
if (string.IsNullOrEmpty(mongoConnection))
    throw new Exception("MONGODB_CONNECTION_STRING não configurada");

// 🔥 Configuração da origem do frontend (dinâmica por ambiente)
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:3000";

// ===== 3. RATE LIMIT =====
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.GeneralRules = new List<RateLimitRule>
    {
        new() { Endpoint = "*", Period = "1m", Limit = 100 }
    };
});
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ===== 4. MONGO =====
builder.Services.Configure<MongoDBSettings>(opt =>
{
    opt.ConnectionString = mongoConnection;
    opt.DatabaseName = "CasalPlannerDB";
});
builder.Services.AddSingleton<MongoDbContext>();

// ===== 5. JWT =====
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // 🔥 Muda para false para funcionar em HTTP (Render/Vercel)
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero // 🔥 Remove tolerância de tempo
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // ✅ Lê do cookie HttpOnly primeiro (mais seguro)
            var token = context.Request.Cookies["auth_token"];

            // ✅ Lê do header Authorization (Bearer token)
            if (string.IsNullOrEmpty(token))
            {
                var authHeader = context.Request.Headers["Authorization"].ToString();
                if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer "))
                    token = authHeader.Substring("Bearer ".Length).Trim();
            }

            // ✅ Fallback: lê do query string (para WebSockets/Downloads)
            if (string.IsNullOrEmpty(token) && context.Request.Query.TryGetValue("token", out var queryToken))
                token = queryToken;

            if (!string.IsNullOrEmpty(token))
                context.Token = token;

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ===== 6. CORS (CORRIGIDO) =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("CasalPlannerPolicy", policy =>
    {
        // 🔥 Lista dinâmica de origens permitidas
        var allowedOrigins = new List<string>
        {
            "http://localhost:3000",           // Local React
            "http://localhost:5286",            // Local API
            "https://casal-planner.vercel.app", // Vercel produção
            "https://casalplanner.onrender.com", // Render (se tiver)
        };

        // 🔥 Adiciona URL do frontend via variável de ambiente
        var envFrontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
        if (!string.IsNullOrEmpty(envFrontendUrl) && !allowedOrigins.Contains(envFrontendUrl))
            allowedOrigins.Add(envFrontendUrl);

        // 🔥 Adiciona origens extras (previews do Vercel)
        var extraOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS");
        if (!string.IsNullOrEmpty(extraOrigins))
        {
            allowedOrigins.AddRange(
                extraOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(o => o.Trim())
            );
        }

        Console.WriteLine($"🌐 CORS Origens permitidas: {string.Join(", ", allowedOrigins)}");

        policy
            .WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // ✅ Obrigatório para cookies
    });
});

// ===== 7. SERVICES =====
builder.Services.AddHttpClient();
builder.Services.AddSingleton<GroqService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IResumoService, ResumoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== BUILD =====
var app = builder.Build();

// ===== 8. HEADERS DE SEGURANÇA (CORRIGIDO PARA FUNCIONAR) =====
app.Use(async (context, next) =>
{
    // 🔥 Só aplica CSP em produção (evita problemas em dev)
    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "connect-src 'self' https://*.vercel.app https://*.onrender.com; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: https:;";
    }

    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

    await next();
});

// ===== PIPELINE =====
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection(); // 🔥 Mantém HTTPS em produção
}
else
{
    Console.WriteLine("🔧 Ambiente Dev: HTTP permitido");
}

app.UseCors("CasalPlannerPolicy"); // ✅ CORS ANTES de auth

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== 9. SWAGGER =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // 🔥 Rota de health check para Render/Vercel
    app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));
}

// ===== 10. SEED =====
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();

    await dbContext.TestarConexaoAsync();
    await dbContext.SeedDataAsync();
    await dbContext.VerificarUsuarioCasal();

    await dbContext.Itens.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<Item>(
            Builders<Item>.IndexKeys.Ascending(i => i.UsuarioId),
            new CreateIndexOptions { Name = "idx_itens_usuarioId", Background = true }
        ),
        new CreateIndexModel<Item>(
            Builders<Item>.IndexKeys
                .Ascending(i => i.UsuarioId)
                .Ascending(i => i.CategoriaId),
            new CreateIndexOptions { Name = "idx_itens_usuarioId_categoriaId", Background = true }
        ),
    });

    await dbContext.Categorias.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<Categoria>(
            Builders<Categoria>.IndexKeys.Ascending(c => c.UsuarioId),
            new CreateIndexOptions { Name = "idx_categorias_usuarioId", Background = true }
        ),
        new CreateIndexModel<Categoria>(
            Builders<Categoria>.IndexKeys.Ascending(c => c.IsPadrao),
            new CreateIndexOptions { Name = "idx_categorias_isPadrao", Background = true }
        ),
    });

    Console.WriteLine("✅ Seed e índices criados com sucesso");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro no seed: {ex.Message}");
}

// ===== 11. INICIAR =====
var port = Environment.GetEnvironmentVariable("PORT") ?? "5286";
app.Run($"http://0.0.0.0:{port}");