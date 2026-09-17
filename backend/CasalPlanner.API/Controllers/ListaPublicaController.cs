using CasalPlanner.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Net;

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

            // Busca os itens já filtrados por origem (Desejo, Prometido, Presente) na query
            var itens = await _itemRepository.GetItensListaPublicaAsync(usuario.Id!);
            
            var itensPublicos = itens
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
                    i.Origem,
                    i.Variantes
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

            // Previne injeção de HTML no nome
            var nomeSeguro = WebUtility.HtmlEncode(dto.NomeConvidado);
            var undoToken = Guid.NewGuid().ToString("N");
            var undoExpiresAt = DateTime.UtcNow.AddMinutes(10);

            // Operação atômica que previne race condition
            var atualizado = await _itemRepository.PresentearItemAtuomicoAsync(itemId, usuario.Id!, nomeSeguro, undoToken, undoExpiresAt);
            if (atualizado == null)
            {
                return Conflict(new { message = "Esse item acabou de ser presenteado por outra pessoa." });
            }

            // Disparar e-mail de notificação para o casal
            if (usuario.IsCasal && usuario.CasalInfo != null)
            {
                if (usuario.CasalInfo.ReceberNotificacoesPessoa1 && !string.IsNullOrEmpty(usuario.CasalInfo.EmailPessoa1))
                    await _emailService.EnviarEmailPresenteRecebidoAsync(usuario.CasalInfo.EmailPessoa1, usuario.CasalInfo.NomeCompletoPessoa1, nomeSeguro, atualizado);
                    
                if (usuario.CasalInfo.ReceberNotificacoesPessoa2 && !string.IsNullOrEmpty(usuario.CasalInfo.EmailPessoa2))
                    await _emailService.EnviarEmailPresenteRecebidoAsync(usuario.CasalInfo.EmailPessoa2, usuario.CasalInfo.NomeCompletoPessoa2, nomeSeguro, atualizado);
            }
            else
            {
                if (!string.IsNullOrEmpty(usuario.Email) && usuario.ReceberNotificacoes)
                    await _emailService.EnviarEmailPresenteRecebidoAsync(usuario.Email, usuario.NomeCompleto ?? "Usuário", nomeSeguro, atualizado);
            }

            return Ok(new { message = "Presente prometido com sucesso!", undoToken });
        }

        [HttpDelete("{slug}/presentear/{itemId}")]
        public async Task<IActionResult> DesfazerPresentear(string slug, string itemId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token)) return BadRequest("Token inválido.");

            var usuario = await _usuarioRepository.GetBySlugListaPublicaAsync(slug);
            if (usuario == null || !usuario.ListaPublicaAtiva)
                return NotFound(new { message = "Lista não encontrada." });

            var desfeito = await _itemRepository.DesfazerPresenteAsync(itemId, token);
            if (!desfeito)
            {
                return BadRequest(new { message = "O tempo para desfazer expirou ou o token é inválido." });
            }

            return Ok(new { message = "Presente desfeito com sucesso." });
        }
    }

    public class PresentearDto
    {
        [Required(ErrorMessage = "O nome do convidado é obrigatório.")]
        [StringLength(80, MinimumLength = 2, ErrorMessage = "O nome deve ter entre 2 e 80 caracteres.")]
        public string NomeConvidado { get; set; } = string.Empty;
    }
}
