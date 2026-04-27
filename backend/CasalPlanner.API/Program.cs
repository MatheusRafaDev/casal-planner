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

if (jwtKey.Length < 32)
    throw new Exception("JWT_SECRET_KEY deve ter no mínimo 32 caracteres");

var mongoConnection = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
    ?? throw new Exception("MONGODB_CONNECTION_STRING não configurada");

// ===== 3. RATE LIMIT =====
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    // Usa IP real quando atrás de proxy/load balancer (Render, Railway, etc.)
    options.RealIpHeader = "X-Forwarded-For";
    options.ClientIdHeader = "X-ClientId";
    options.GeneralRules = new List<RateLimitRule>
    {
        new() { Endpoint = "*",                Period = "1m",  Limit = 100 },
        new() { Endpoint = "POST:/api/auth/*", Period = "10m", Limit = 10  }, // Proteção brute-force login
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
    // Em produção, exige HTTPS; em dev, permite HTTP
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

// ===== 6. CORS =====
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "https://casalplanner.vercel.app";

builder.Services.AddCors(options =>
{
    options.AddPolicy("CasalPlannerPolicy", policy =>
    {
        var origins = new List<string> { frontendUrl };

        // URLs adicionais do Vercel
        origins.Add("https://casalplanner.vercel.app");
        origins.Add("https://casal-planner.vercel.app");

        if (builder.Environment.IsDevelopment())
            origins.Add("http://localhost:3000");

        policy
            .WithOrigins(origins.Distinct().ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ===== 7. SERVICES =====
builder.Services.AddHttpClient();
builder.Services.AddSingleton<GroqService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IResumoService, ResumoService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IRecuperarSenhaService, RecuperarSenhaService>();

builder.Services.AddMemoryCache(); 

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
    });
}

// ===== BUILD =====
var app = builder.Build();

// ===== 8. HEADERS DE SEGURANÇA =====
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
app.UseIpRateLimiting();

if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
else
    Console.WriteLine("🔧 Ambiente Dev: HTTP permitido");

app.UseCors("CasalPlannerPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== 9. SWAGGER (apenas dev) =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Health check sempre disponível
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName,
    version = "1.0.0"
}));

// ===== 10. SEED — apenas em desenvolvimento =====
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();

    await dbContext.TestarConexaoAsync();

    // Seed de dados de exemplo APENAS em desenvolvimento
    if (app.Environment.IsDevelopment())
    {
        await dbContext.SeedDataAsync();
        Console.WriteLine("🌱 Seed executado (dev)");
    }

    await dbContext.VerificarUsuarioCasal();

    // Índices sempre criados (idempotente)
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

    Console.WriteLine("✅ Índices verificados com sucesso");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro na inicialização: {ex.Message}");
    // Não derruba o app — permite que o health check responda
}

// ===== 11. INICIAR =====
// Em dev: launchSettings.json controla a URL via ASPNETCORE_URLS automaticamente.
// Em prod (Render/Railway): PORT é injetada via variável de ambiente.
var portEnv = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrEmpty(portEnv))
    app.Run($"http://0.0.0.0:{portEnv}");
else
    app.Run(); // usa ASPNETCORE_URLS do launchSettings (dev) ou padrão :5000