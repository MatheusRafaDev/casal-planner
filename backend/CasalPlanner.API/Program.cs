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
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath))
    {
        Env.Load(envPath);
        Console.WriteLine("✅ .env carregado");
    }
}
builder.Configuration.AddEnvironmentVariables();

// ===== 2. CONFIG =====
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "CasalPlanner";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "CasalPlannerUsers";

if (string.IsNullOrEmpty(jwtKey))
    throw new Exception("JWT_SECRET_KEY não configurada");

var mongoConnection = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
if (string.IsNullOrEmpty(mongoConnection))
    throw new Exception("MONGO não configurado");

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
    options.RequireHttpsMetadata = true;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["auth_token"];

            if (string.IsNullOrEmpty(token))
                token = context.Request.Headers["Authorization"]
                    .ToString().Replace("Bearer ", "");

            if (!string.IsNullOrEmpty(token))
                context.Token = token;

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ========== 6. CORS - VERSÃO CORRETA PARA PRODUÇÃO ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("CasalPlannerPolicy", policy =>
    {
        // 🔥 Ler a URL do frontend da variável de ambiente
        var meuFrontendUrl = Environment.GetEnvironmentVariable("MEU_FRONTEND_URL");
        
        // URLs padrão para desenvolvimento
        var defaultOrigins = new[] 
        { 
            "http://localhost:3000", 
            "http://localhost:5173",
            "http://localhost:5000"
        };
        
        // Lista de origens permitidas
        var allowedOrigins = new List<string>();
        
        // Adicionar URL do ENV se existir
        if (!string.IsNullOrEmpty(meuFrontendUrl))
        {
            allowedOrigins.Add(meuFrontendUrl);
            Console.WriteLine($"✅ CORS: URL do frontend carregada do ENV: {meuFrontendUrl}");
        }
        
        // Adicionar URLs de fallback (Vercel)
        allowedOrigins.AddRange(new[]
        {
            "https://casal-planner-ebg7-git-main-matheusrafadevs-projects.vercel.app",
            "https://casal-planner-ebg7-ksltt626o-matheusrafadevs-projects.vercel.app",
            "https://casal-planner-ebg7.vercel.app",
            "https://casal-planner-amber.vercel.app"
        });
        
        // Adicionar desenvolvimento se for ambiente local
        if (builder.Environment.IsDevelopment())
        {
            allowedOrigins.AddRange(defaultOrigins);
            Console.WriteLine($"✅ CORS: Adicionando origens de desenvolvimento");
        }
        
        // Remover duplicatas
        allowedOrigins = allowedOrigins.Distinct().ToList();
        
        Console.WriteLine($"✅ CORS permitindo origens: {string.Join(", ", allowedOrigins)}");
        
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // 🔥 ESSENCIAL para cookies
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

// ===== 8. HEADERS (CSP CORRIGIDO) =====
app.Use(async (context, next) =>
{
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; " +
        "connect-src 'self' https://casalplanner-api.onrender.com https://*.vercel.app; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:;";

    await next();
});

// ===== 🔥 PREFLIGHT =====
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        return;
    }
    await next();
});

// ===== PIPELINE =====
app.UseHttpsRedirection();

app.UseIpRateLimiting();

app.UseCors("CasalPlannerPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== 9. SEED (MANTIDO) =====
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

    Console.WriteLine("✅ Seed OK");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro: {ex.Message}");
}

app.Run();
