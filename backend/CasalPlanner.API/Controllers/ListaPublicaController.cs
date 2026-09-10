using CasalPlanner.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CasalPlanner.API.Controllers
{
    [ApiController]
    [Route("api/public/lista")]
    public class ListaPublicaController : ControllerBase
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IItemRepository _itemRepository;
        private readonly IEmailService _emailService;

        public ListaPublicaController(IUsuarioRepository usuarioRepository, IItemRepository itemRepository, IEmailService emailService)
        {
            _usuarioRepository = usuarioRepository;
            _itemRepository = itemRepository;
            _emailService = emailService;
        }

        [HttpGet("{slug}")]
        public async Task<IActionResult> GetLista(string slug)
        {
            var usuario = await _usuarioRepository.GetBySlugListaPublicaAsync(slug);
            if (usuario == null || !usuario.ListaPublicaAtiva)
            {
                return NotFound(new { message = "Lista não encontrada ou inativa." });
            }

            var nomeCasal = usuario.IsCasal && usuario.CasalInfo != null 
                ? $"{usuario.CasalInfo.NomeCompletoPessoa1} & {usuario.CasalInfo.NomeCompletoPessoa2}" 
                : usuario.NomeCompleto;

            // Busca os itens
            var itens = await _itemRepository.GetByUsuarioIdAsync(usuario.Id!);
            
            // Retorna apenas itens permitidos e remove dados sensíveis
            var itensPublicos = itens
                .Where(i => i.Origem != "ganho")
                .Select(i => new {
                    i.Id,
                    i.Nome,
                    i.Marca,
                    i.Preco,
                    i.Quantidade,
                    i.Comprado,
                    i.Loja,
                    i.LinkProduto,
                    i.FotoUrl,
                    i.Prioridade,
                    i.Origem
                });

            return Ok(new
            {
                Casal = nomeCasal,
                Itens = itensPublicos
            });
        }

        [HttpPost("{slug}/presentear/{itemId}")]
        public async Task<IActionResult> Presentear(string slug, string itemId, [FromBody] PresentearDto dto)
        {
            if (string.IsNullOrEmpty(dto.NomeConvidado))
                return BadRequest("O nome do convidado é obrigatório.");

            var usuario = await _usuarioRepository.GetBySlugListaPublicaAsync(slug);
            if (usuario == null || !usuario.ListaPublicaAtiva)
                return NotFound(new { message = "Lista não encontrada ou inativa." });

            var item = await _itemRepository.GetByIdAsync(itemId, usuario.Id!);
            if (item == null)
                return NotFound(new { message = "Item não encontrado." });

            if (item.Comprado)
                return BadRequest(new { message = "Este item já foi presenteado ou comprado." });

            // Atualiza o item
            item.Comprado = true;
            item.Origem = "presente";
            item.OrigemDescricao = $"Presente de {dto.NomeConvidado}";
            item.UpdatedAt = DateTime.UtcNow;

            await _itemRepository.UpdateRawAsync(item);

            // Disparar e-mail de notificação para o casal
            if (usuario.IsCasal && usuario.CasalInfo != null)
            {
                if (usuario.CasalInfo.ReceberNotificacoesPessoa1 && !string.IsNullOrEmpty(usuario.CasalInfo.EmailPessoa1))
                    await _emailService.EnviarEmailPresenteRecebidoAsync(usuario.CasalInfo.EmailPessoa1, usuario.CasalInfo.NomeCompletoPessoa1, dto.NomeConvidado, item);
                    
                if (usuario.CasalInfo.ReceberNotificacoesPessoa2 && !string.IsNullOrEmpty(usuario.CasalInfo.EmailPessoa2))
                    await _emailService.EnviarEmailPresenteRecebidoAsync(usuario.CasalInfo.EmailPessoa2, usuario.CasalInfo.NomeCompletoPessoa2, dto.NomeConvidado, item);
            }
            else
            {
                if (!string.IsNullOrEmpty(usuario.Email) && usuario.ReceberNotificacoes)
                    await _emailService.EnviarEmailPresenteRecebidoAsync(usuario.Email, usuario.NomeCompleto ?? "Usuário", dto.NomeConvidado, item);
            }

            return Ok(new { message = "Presente prometido com sucesso!" });
        }
    }

    public class PresentearDto
    {
        public string NomeConvidado { get; set; } = string.Empty;
    }
}
