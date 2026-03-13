using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using MongoDB.Driver;
using CasalPlanner.API.Data;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs; 

namespace CasalPlanner.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ResumoController : ControllerBase
    {
        private readonly MongoDbContext _context;
        
        public ResumoController(MongoDbContext context)
        {
            _context = context;
        }
        
        private string GetUsuarioId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "casal-default";
        }
        
        [HttpGet]
        public async Task<ActionResult<ResumoDto>> GetResumo()
        {
            var usuarioId = GetUsuarioId();
            
            var itens = await _context.Itens
                .Find(i => i.UsuarioId == usuarioId)
                .ToListAsync();
            
            var categorias = await _context.Categorias
                .Find(c => c.UsuarioId == null || c.UsuarioId == usuarioId)
                .ToListAsync();
            
            var categoriasDict = categorias.ToDictionary(c => c.Id!, c => c.Nome);
            
            var naoComprados = itens.Where(i => !i.Comprado);
            
            var totalVR = naoComprados
                .Where(i => i.Pagamento == "vr")
                .Sum(i => i.Preco * i.Quantidade);
                
            var totalNormal = naoComprados
                .Where(i => i.Pagamento == "normal")
                .Sum(i => i.Preco * i.Quantidade);
            
            var resumo = new ResumoDto
            {
                TotalGeral = totalVR + totalNormal,
                TotalVR = totalVR,
                TotalNormal = totalNormal,
                TotalComprados = itens.Count(i => i.Comprado),
                TotalItens = itens.Count,
                ItensPorCategoria = itens
                    .GroupBy(i => categoriasDict.GetValueOrDefault(i.CategoriaId, "Sem categoria"))
                    .ToDictionary(g => g.Key, g => g.Count())
            };
            
            return resumo;
        }
    }
}