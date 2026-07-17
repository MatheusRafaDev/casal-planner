using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Infrastructure.Services;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResumoController : ControllerBase
    {
        private readonly IResumoService _resumoService;
        private readonly ILogger<ResumoController> _logger;

        public ResumoController(IResumoService resumoService, ILogger<ResumoController> logger)
        {
            _resumoService = resumoService;
            _logger = logger;
        }

        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? string.Empty;
        }

        [HttpGet]
        public async Task<IActionResult> GetResumo()
        {
            var usuarioId = GetUsuarioId();
            if (string.IsNullOrEmpty(usuarioId))
            {
                return Unauthorized(new { error = "Usuário não autenticado" });
            }

            var resumo = await _resumoService.ObterResumo(usuarioId);
            return Ok(resumo);
        }
    }
}