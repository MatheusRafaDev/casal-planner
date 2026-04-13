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

// ========== 1. VARIÁVEIS DE AMBIENTE ==========
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath))
    {
        Env.Load(envPath);
        Console.WriteLine("✅ Arquivo .env carregado!");
    }
}
builder.Configuration.AddEnvironmentVariables();

// ========== 2. VALIDAR VARIÁVEIS CRÍTICAS ==========
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
    ?? builder.Configuration["Jwt:Key"];
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
    ?? builder.Configuration["Jwt:Issuer"] ?? "CasalPlanner";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
    ?? builder.Configuration["Jwt:Audience"] ?? "CasalPlannerUsers";

if (string.IsNullOrEmpty(jwtKey))
    throw new InvalidOperationException("❌ JWT_SECRET_KEY não configurada!");

var mongoConnection = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING")
    ?? builder.Configuration.GetValue<string>("MongoDB:ConnectionString");
if (string.IsNullOrEmpty(mongoConnection))
    throw new InvalidOperationException("❌ MONGODB_CONNECTION_STRING não configurada!");

// ========== 3. RATE LIMITING ==========
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.EnableEndpointRateLimiting = true;
    options.StackBlockedRequests = false;
    options.GeneralRules = new List<RateLimitRule>
    {
        new() { Endpoint = "POST:/api/auth/login",            Period = "5m", Limit = 10 },
        new() { Endpoint = "POST:/api/auth/registrar",        Period = "1h", Limit = 3  },
        new() { Endpoint = "POST:/api/auth/registrar-casal",  Period = "1h", Limit = 3  },
        new() { Endpoint = "*",                               Period = "1m", Limit = 100 },
    };
});
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ========== 4. MONGODB ==========
builder.Services.Configure<MongoDBSettings>(options =>
{
    options.ConnectionString = mongoConnection;
    options.DatabaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE")
        ?? builder.Configuration.GetValue<string>("MongoDB:DatabaseName")
        ?? "CasalPlannerDB";
});
builder.Services.AddSingleton<MongoDbContext>();

// ========== 5. JWT ==========
var key = Encoding.UTF8.GetBytes(jwtKey);
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
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
        ClockSkew = TimeSpan.FromMinutes(5),
        RequireExpirationTime = true
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var token = context.Request.Cookies["auth_token"];
            if (string.IsNullOrEmpty(token))
                token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (!string.IsNullOrEmpty(token))
                context.Token = token;
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddAuthorization();

// ========== 6. CORS ==========
// ========== 6. CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("CasalPlannerPolicy", policy =>
    {
        // URL do seu frontend (vinda do ENV)
        var frontendUrl = Environment.GetEnvironmentVariable("MEU_FRONTEND_URL");
        
        // Lista de origens permitidas
        var allowedOrigins = new List<string>();
        
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            allowedOrigins.Add(frontendUrl);
            Console.WriteLine($"✅ CORS permitindo: {frontendUrl}");
        }
        
        // Adicionar localhost para desenvolvimento
        if (builder.Environment.IsDevelopment())
        {
            allowedOrigins.Add("http://localhost:3000");
            allowedOrigins.Add("http://localhost:5173");
            Console.WriteLine($"✅ CORS adicionando localhost para desenvolvimento");
        }
        
        // Fallback seguro
        if (allowedOrigins.Count == 0)
        {
            allowedOrigins.Add("https://casal-planner-ebg7-ksltt626o-matheusrafadevs-projects.vercel.app");
            Console.WriteLine($"⚠️ CORS usando fallback padrão");
        }
        
        policy.WithOrigins(allowedOrigins.ToArray())
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ========== 7. SERVIÇOS ==========
builder.Services.AddHttpClient();
builder.Services.AddHttpClient("SerpApiClient", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "CasalPlanner/1.0");
});
builder.Services.AddSingleton<GroqService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IResumoService, ResumoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CasalPlanner API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// ========== 8. MIDDLEWARE DE SEGURANÇA ==========
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; " +
        "font-src 'self'; connect-src 'self' http://localhost:3000";
    context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
    context.Response.Headers.Remove("Server");
    context.Response.Headers.Remove("X-Powered-By");
    await next();
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.UseIpRateLimiting();
app.UseCors("CasalPlannerPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ========== 9. SEED + ÍNDICES ==========
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();

    await dbContext.TestarConexaoAsync();
    await dbContext.SeedDataAsync();
    await dbContext.VerificarUsuarioCasal();

    // Índices compostos para acelerar as queries mais frequentes
    // Itens: busca por usuário (query principal) e por usuário+categoria (filtro de categoria)
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

    // Categorias: busca por usuário e por isPadrao (seed + listagem)
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

    Console.WriteLine("✅ Seed data e índices configurados com sucesso!");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro na inicialização: {ex.Message}");
}

app.Run();

