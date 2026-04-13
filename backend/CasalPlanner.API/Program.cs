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

var mongoConnection = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
    ?? throw new Exception("MONGODB_CONNECTION_STRING não configurada");

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
    opt.DatabaseName     = "CasalPlannerDB";
});
builder.Services.AddSingleton<MongoDbContext>();

// ===== 5. JWT — lê APENAS do header Authorization: Bearer <token> =====
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
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

    // ✅ Lê token APENAS do header Authorization — sem cookie, sem query string
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

// ===== 6. CORS — sem AllowCredentials (não usamos mais cookies) =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("CasalPlannerPolicy", policy =>
    {
        policy
            .WithOrigins(
                "https://casalplanner.vercel.app",
                "https://casal-planner.vercel.app",
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
            // ❌ .AllowCredentials() removido — não necessário para Bearer token
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

// ===== 8. HEADERS DE SEGURANÇA =====
app.Use(async (context, next) =>
{
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
    context.Response.Headers["X-Frame-Options"]        = "DENY";
    context.Response.Headers["Referrer-Policy"]        = "strict-origin-when-cross-origin";

    await next();
});

// ===== PIPELINE =====
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
else
    Console.WriteLine("🔧 Ambiente Dev: HTTP permitido");

app.UseCors("CasalPlannerPolicy"); // CORS antes de auth

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
            new CreateIndexOptions { Name = "idx_itens_usuarioId", Background = true }),
        new CreateIndexModel<Item>(
            Builders<Item>.IndexKeys.Ascending(i => i.UsuarioId).Ascending(i => i.CategoriaId),
            new CreateIndexOptions { Name = "idx_itens_usuarioId_categoriaId", Background = true }),
    });

    await dbContext.Categorias.Indexes.CreateManyAsync(new[]
    {
        new CreateIndexModel<Categoria>(
            Builders<Categoria>.IndexKeys.Ascending(c => c.UsuarioId),
            new CreateIndexOptions { Name = "idx_categorias_usuarioId", Background = true }),
        new CreateIndexModel<Categoria>(
            Builders<Categoria>.IndexKeys.Ascending(c => c.IsPadrao),
            new CreateIndexOptions { Name = "idx_categorias_isPadrao", Background = true }),
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
