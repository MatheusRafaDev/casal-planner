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

// ===== 6. CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("CasalPlannerPolicy", policy =>
    {
        policy.WithOrigins(
                "https://casal-planner-ebg7-jgzoddqy9-matheusrafadevs-projects.vercel.app",
                "http://localhost:3000",
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ===== 7. SERVICES =====
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IItemService, ItemService>();
builder.Services.AddScoped<IResumoService, ResumoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== BUILD =====
var app = builder.Build();

// ===== 8. SECURITY HEADERS (CORRIGIDO) =====
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

// ===== 🔥 LIBERAR PREFLIGHT =====
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        return;
    }
    await next();
});

// ===== PIPELINE CORRETO =====
app.UseHttpsRedirection();

app.UseCors("CasalPlannerPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
