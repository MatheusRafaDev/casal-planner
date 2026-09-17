using CasalPlanner.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CasalPlanner.API.Controllers;

[Authorize]
[ApiController]
[Route("api/pesquisaprecos")]
public class PesquisaPrecosController : ControllerBase
{
    private readonly IExtratorLinkService _extrator;
    private readonly ILogger<PesquisaPrecosController> _logger;

    public PesquisaPrecosController(IExtratorLinkService extrator, ILogger<PesquisaPrecosController> logger)
    {
        _extrator = extrator;
        _logger = logger;
    }

    public record ExtrairLinkRequest(string Url);

    /// <summary>
    /// Extrai nome, preço, imagem e loja de um link de produto de e-commerce.
    /// </summary>
    [HttpPost("extrair-link")]
    public async Task<IActionResult> ExtrairLink([FromBody] ExtrairLinkRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Url))
            return BadRequest(new { message = "URL é obrigatória." });

        if (!Uri.TryCreate(request.Url, UriKind.Absolute, out var uri) ||
            (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
            return BadRequest(new { message = "URL inválida. Informe um link completo (https://...)." });

        try
        {
            var produto = await _extrator.ExtrairAsync(request.Url, cancellationToken);

            if (produto is null)
                return UnprocessableEntity(new { message = "Não foi possível extrair informações do produto nesse link. Tente informar os dados manualmente." });

            // Mapeia para o formato esperado pelo frontend
            return Ok(new
            {
                nome   = produto.Nome,
                preco  = produto.Preco,
                imagem = produto.Imagem,
                url    = produto.Url,
                loja   = produto.Loja,
            });
        }
        catch (OperationCanceledException)
        {
            return StatusCode(StatusCodes.Status408RequestTimeout, new { message = "A extração demorou demais. Tente novamente." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao extrair link: {Url}", request.Url);
            return StatusCode(StatusCodes.Status502BadGateway, new { message = "Erro ao acessar o link informado." });
        }
    }
}
