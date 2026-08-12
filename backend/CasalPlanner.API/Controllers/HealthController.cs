using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using System.Text.Json.Serialization;

namespace CasalPlanner.API.Controllers;

/// <summary>
/// Endpoint de health check. Retorna status da API e metadados do build.
/// GET /health  →  público, sem autenticação.
/// </summary>
[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Retorna o status da API junto com o hash do último commit que originou este build.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        var commit = Assembly
            .GetExecutingAssembly()
            .GetCustomAttributes<AssemblyMetadataAttribute>()
            .FirstOrDefault(a => a.Key == "GitCommit")
            ?.Value ?? "unknown";

        return Ok(new HealthResponse(
            Status: "ok",
            Commit: commit,
            BuildAt: GetBuildTime(),
            Environment: System.Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        ));
    }

    // Usa o timestamp de escrita do assembly como data de build.
    private static string GetBuildTime()
    {
        var path = Assembly.GetExecutingAssembly().Location;
        if (string.IsNullOrEmpty(path)) return "unknown";
        var dt = System.IO.File.GetLastWriteTimeUtc(path);
        return dt.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'");
    }
}

/// <param name="Status">Sempre "ok" quando a API está online.</param>
/// <param name="Commit">Hash curto do commit Git que originou este build.</param>
/// <param name="BuildAt">Data/hora UTC do build (baseada no timestamp do assembly).</param>
/// <param name="Environment">Ambiente configurado (Development / Production).</param>
public record HealthResponse(
    [property: JsonPropertyName("Status")]      string Status,
    [property: JsonPropertyName("Commit")]      string Commit,
    [property: JsonPropertyName("BuildAt")]     string BuildAt,
    [property: JsonPropertyName("Environment")] string Environment
);
