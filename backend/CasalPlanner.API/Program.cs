using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CasalPlanner.API.Models;
using CasalPlanner.API.Data;
using CasalPlanner.API.Services;
using DotNetEnv;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// ========== 1. CARREGAR VARIÁVEIS DE AMBIENTE ==========
if (builder.Environment.IsDevelopment())
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
    if (File.Exists(envPath))
    {
        Env.Load(envPath);
    }
}

builder.Configuration.AddEnvironmentVariables();

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "CasalPlanner API", Version = "v1" });
    
    // Configurar Swagger para aceitar token
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
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// ========== 2. CONFIGURAR MONGODB ==========
var mongoConnectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING") 
    ?? builder.Configuration.GetValue<string>("MongoDB:ConnectionString");

var mongoDatabaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE") 
    ?? builder.Configuration.GetValue<string>("MongoDB:DatabaseName") 
    ?? "CasalPlannerDB";

builder.Services.Configure<MongoDBSettings>(options =>
{
    options.ConnectionString = mongoConnectionString 
        ?? throw new InvalidOperationException("MongoDB ConnectionString não configurada!");
    options.DatabaseName = mongoDatabaseName;
});

builder.Services.AddSingleton<MongoDbContext>();

// ========== 3. CONFIGURAR JWT ==========
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
    ?? builder.Configuration["Jwt:Key"];

var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
    ?? builder.Configuration["Jwt:Issuer"] 
    ?? "CasalPlanner";

var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") 
    ?? builder.Configuration["Jwt:Audience"] 
    ?? "CasalPlannerUsers";

if (string.IsNullOrEmpty(jwtKey))
{
    throw new InvalidOperationException("❌ JWT Secret Key não configurada!");
}

if (jwtKey.Length < 32)
{
    throw new InvalidOperationException($"❌ JWT Key muito curta! Tem {jwtKey.Length} caracteres, precisa no mínimo 32.");
}

var key = Encoding.UTF8.GetBytes(jwtKey);


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Mude para true em produção
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
        ClockSkew = TimeSpan.FromMinutes(5) 
    };

    // 🔥 IMPORTANTE: Ler token do cookie
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // Tenta pegar do cookie primeiro
            var token = context.Request.Cookies["auth_token"];
            
            // Se não tiver no cookie, tenta do header (para compatibilidade)
            if (string.IsNullOrEmpty(token))
            {
                token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            }
            
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            
            return Task.CompletedTask;
        }
    };
});

// ========== 4. CONFIGURAR CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000"  // React dev server
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // 🔥 ESSENCIAL para cookies
    });
});

// ========== 5. REGISTRAR SERVIÇOS ==========
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ========== 6. MIDDLEWARE DE SEGURANÇA ==========
app.Use(async (context, next) =>
{
    // Headers de segurança
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    
    // Remove headers que expõem tecnologia
    context.Response.Headers.Remove("Server");
    context.Response.Headers.Remove("X-Powered-By");
    
    await next();
});

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ========== 7. SEED DATA ==========
try
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        await dbContext.TestarConexaoAsync();
        await dbContext.SeedDataAsync();
        await dbContext.VerificarUsuarioCasal();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro ao executar seed data: {ex.Message}");
}

app.Run();