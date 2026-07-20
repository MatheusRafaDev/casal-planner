using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CasalPlanner.Application.Interfaces;
using CasalPlanner.Domain.Entities;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PlanoController : ControllerBase
    {
        private readonly IItemService _itemService;

        public PlanoController(IItemService itemService)
        {
            _itemService = itemService;
        }

        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? throw new UnauthorizedAccessException("Usuário não autenticado");
        }

        /// <summary>
        /// Retorna todos os itens (todos) de um usuário - endpoint de compatibilidade
        /// </summary>
        /// <param name="usuarioId">ID do usuário</param>
        [HttpGet("user/{usuarioId}/todos")]
        public async Task<IActionResult> GetTodos(string usuarioId)
        {
            // Verifica se o usuário autenticado está acessando seus próprios dados
            var usuarioIdAutenticado = GetUsuarioId();
            if (usuarioId != usuarioIdAutenticado)
            {
                return Forbid();
            }

            var itens = await _itemService.GetItensByUsuarioId(usuarioId);
            return Ok(itens);
        }
    }
}