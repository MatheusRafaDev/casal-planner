using CasalPlanner.Domain.Entities;
using CasalPlanner.Application.DTOs;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using CasalPlanner.Application.Interfaces;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace CasalPlanner.Application.Services
{
    public class ItemService : IItemService
    {
        private readonly IItemRepository _itemRepository;
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IPushService _pushService;
        private readonly ILogger<ItemService> _logger;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;

        public ItemService(
            IItemRepository itemRepository,
            IUsuarioRepository usuarioRepository,
            IPushService pushService, 
            ILogger<ItemService> logger,
            IEmailService emailService,
            IMemoryCache cache)
        {
            _itemRepository = itemRepository;
            _usuarioRepository = usuarioRepository;
            _pushService = pushService;
            _logger = logger;
            _emailService = emailService;
            _cache = cache;
        }

        public async Task<List<Item>> GetItensByUsuarioId(string usuarioId)
        {
            return await _itemRepository.GetByUsuarioIdAsync(usuarioId);
        }

        public async Task<PagedResult<Item>> GetItensPaginated(string usuarioId, string? categoriaId, string? busca, string? status, string? pagamento, int? responsavelId, int page, int pageSize)
        {
            var (items, totalCount) = await _itemRepository.GetPaginatedAsync(usuarioId, categoriaId, busca, status, pagamento, responsavelId, page, pageSize);

            return new PagedResult<Item>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<Item?> GetItemById(string id, string usuarioId)
        {
            return await _itemRepository.GetByIdAsync(id, usuarioId);
        }

        public async Task<Item> CriarItem(CriarItemDto dto, string usuarioId, string emailAutenticado)
        {
            if (dto.DivisaoPagamento != null)
            {
                var soma = dto.DivisaoPagamento.ValorPessoa1 + dto.DivisaoPagamento.ValorPessoa2;
                if (soma != (dto.Preco * dto.Quantidade))
                {
                    throw new ArgumentException("A soma da divisão de pagamento deve ser igual ao valor total do item (Preço x Quantidade).");
                }
            }

            var item = new Item
            {
                Nome = dto.Nome,
                Marca = dto.Marca,
                Preco = dto.Preco,
                Quantidade = dto.Quantidade,
                CategoriaId = dto.CategoriaId,
                Pagamento = dto.Pagamento,
                Prioridade = dto.Prioridade ?? "normal",
                UsuarioId = usuarioId,
                Comprado = false,
                CreatedAt = DateTime.UtcNow,
                Loja = dto.Loja,
                LinkProduto = dto.LinkProduto,
                FotoUrl = dto.FotoUrl,
                Origem = dto.Origem ?? "comprado",
                OrigemDescricao = dto.OrigemDescricao,
                Parcelas = dto.Parcelas,
                Variantes = dto.Variantes ?? new List<string>(),
                VarianteSelecionadaId = dto.VarianteSelecionadaId,
                ResponsavelId = dto.ResponsavelId,
                DivisaoPagamento = dto.DivisaoPagamento != null ? new DivisaoPagamento
                {
                    ValorPessoa1 = dto.DivisaoPagamento.ValorPessoa1,
                    ValorPessoa2 = dto.DivisaoPagamento.ValorPessoa2
                } : null
            };

            await _itemRepository.CreateAsync(item);

            var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
            if (usuario != null && usuario.IsCasal)
            {
                int currentPessoaId = (usuario.CasalInfo?.EmailPessoa2 == emailAutenticado) ? 2 : 1;
                var itemNome = item.Nome;
                _ = Task.Run(async () => await NotificarParceiroAsync(
                    usuario, 
                    currentPessoaId, 
                    "Novo Item Adicionado", 
                    "Um novo item foi adicionado: " + itemNome, 
                    "email_throttle", 
                    itemNome));
            }

            return item;
        }

        public async Task<Item?> AtualizarItem(string id, AtualizarItemDto dto, string usuarioId, string emailAutenticado)
        {
            var itemAtual = await _itemRepository.GetByIdAsync(id, usuarioId);
            if (itemAtual == null) return null;

            if (dto.DivisaoPagamento != null)
            {
                var precoFinal = dto.Preco ?? itemAtual.Preco;
                var qtdFinal = dto.Quantidade ?? itemAtual.Quantidade;
                var soma = dto.DivisaoPagamento.ValorPessoa1 + dto.DivisaoPagamento.ValorPessoa2;
                if (soma != (precoFinal * qtdFinal))
                {
                    throw new ArgumentException("A soma da divisão de pagamento deve ser igual ao valor total do item (Preço x Quantidade).");
                }
            }

            return await _itemRepository.UpdateAsync(id, usuarioId, dto, itemAtual);
        }

        public async Task<Item?> AtualizarComprado(string id, bool comprado, string usuarioId, string emailAutenticado)
        {
            var item = await _itemRepository.UpdateCompradoAsync(id, usuarioId, comprado);

            if (item != null && comprado)
            {
                var usuario = await _usuarioRepository.GetByIdAsync(usuarioId);
                if (usuario != null && usuario.IsCasal)
                {
                    int currentPessoaId = (usuario.CasalInfo?.EmailPessoa2 == emailAutenticado) ? 2 : 1;
                    var itemNome = item.Nome;
                    _ = Task.Run(async () => await NotificarParceiroAsync(
                        usuario, 
                        currentPessoaId, 
                        "Item Comprado", 
                        "O item '" + itemNome + "' foi marcado como comprado.", 
                        "email_throttle", 
                        itemNome));
                }
            }

            return item;
        }

        public async Task<bool> DeletarItem(string id, string usuarioId)
        {
            return await _itemRepository.DeleteAsync(id, usuarioId);
        }

        public async Task<List<Item>> GetItensByCategoria(string categoriaId, string usuarioId)
        {
            return await _itemRepository.GetByCategoriaAsync(categoriaId, usuarioId);
        }

        private async Task NotificarParceiroAsync(
            Usuario usuario,
            int currentPessoaId,
            string tituloPush,
            string mensagem,
            string cacheKeyPrefix,
            string itemNome)
        {
            if (usuario == null || !usuario.IsCasal) return;

            try
            {
                await _pushService.SendPushToPartnerAsync(usuario, currentPessoaId,
                    tituloPush,
                    mensagem);

                var cacheKey = $"{cacheKeyPrefix}_{usuario.Id}";
                if (!_cache.TryGetValue(cacheKey, out _))
                {
                    string emailParceiro = currentPessoaId == 1 ? usuario.CasalInfo?.EmailPessoa2 ?? "" : usuario.CasalInfo?.EmailPessoa1 ?? "";
                    string nomeParceiro = currentPessoaId == 1 ? usuario.CasalInfo?.NomeCompletoPessoa2 ?? "" : usuario.CasalInfo?.NomeCompletoPessoa1 ?? "";
                    
                    if (!string.IsNullOrEmpty(emailParceiro))
                    {
                        await _emailService.EnviarNotificacaoParceiroAsync(
                            emailParceiro,
                            nomeParceiro,
                            tituloPush,
                            mensagem);
                        
                        _cache.Set(cacheKey, true, TimeSpan.FromMinutes(30));
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Falha ao enviar notificação (background). Item: {Nome}", itemNome);
            }
        }
    }
}
