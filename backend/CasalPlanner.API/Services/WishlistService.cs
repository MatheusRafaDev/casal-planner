using MongoDB.Driver;
using CasalPlanner.API.Data;
using CasalPlanner.API.Models;
using CasalPlanner.API.Models.DTOs;

namespace CasalPlanner.API.Services;

public class WishlistService : IWishlistService
{
    private readonly MongoDbContext _context;

    public WishlistService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<WishlistPublica> CriarWishlist(string usuarioId, CriarWishlistDto dto)
    {
        // Validar slug regex
        if (!System.Text.RegularExpressions.Regex.IsMatch(dto.Slug, @"^[a-z0-9-]{5,60}$"))
        {
            throw new ArgumentException("Slug deve conter apenas letras minúsculas, números e hífens, com 5-60 caracteres");
        }

        // Verificar se slug já está em uso
        var slugDisponivel = await SlugDisponivel(dto.Slug);
        if (!slugDisponivel)
        {
            throw new ArgumentException("Slug já está em uso");
        }

        var wishlist = new WishlistPublica
        {
            UsuarioId = usuarioId,
            Slug = dto.Slug,
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            Ativa = true,
            ItemIds = new List<string>(),
            Reservas = new List<ReservaPresente>(),
            CriadaEm = DateTime.UtcNow
        };

        await _context.Wishlists.InsertOneAsync(wishlist);
        return wishlist;
    }

    public async Task<WishlistPublicaResponseDto?> ObterPublicaPorSlug(string slug)
    {
        var wishlist = await _context.Wishlists
            .Find(w => w.Slug == slug && w.Ativa)
            .FirstOrDefaultAsync();

        if (wishlist == null)
        {
            return null;
        }

        // Buscar itens
        var itens = await _context.Itens
            .Find(i => wishlist.ItemIds.Contains(i.Id!))
            .ToListAsync();

        var itensDto = itens.Select(item => new ItemPublicoDto
        {
            Id = item.Id!,
            Nome = item.Nome,
            Preco = item.Preco,
            Loja = item.Loja,
            FotoUrl = item.FotoUrl,
            Reservado = wishlist.Reservas.Any(r => r.ItemId == item.Id)
        }).ToList();

        return new WishlistPublicaResponseDto
        {
            Id = wishlist.Id!,
            Slug = wishlist.Slug,
            Titulo = wishlist.Titulo,
            Descricao = wishlist.Descricao,
            Ativa = wishlist.Ativa,
            CriadaEm = wishlist.CriadaEm,
            ExpiraEm = wishlist.ExpiraEm,
            Itens = itensDto
        };
    }

    public async Task<WishlistPrivadaResponseDto?> ObterPrivadaPorUsuario(string usuarioId)
    {
        var wishlist = await _context.Wishlists
            .Find(w => w.UsuarioId == usuarioId)
            .FirstOrDefaultAsync();

        if (wishlist == null)
        {
            return null;
        }

        // Buscar itens
        var itens = await _context.Itens
            .Find(i => wishlist.ItemIds.Contains(i.Id!))
            .ToListAsync();

        var itensDto = itens.Select(item => new ItemPublicoDto
        {
            Id = item.Id!,
            Nome = item.Nome,
            Preco = item.Preco,
            Loja = item.Loja,
            FotoUrl = item.FotoUrl,
            Reservado = wishlist.Reservas.Any(r => r.ItemId == item.Id)
        }).ToList();

        var reservasDto = wishlist.Reservas.Select(r => new ReservaPresenteDto
        {
            ItemId = r.ItemId,
            NomePresente = r.NomePresente,
            Mensagem = r.Mensagem,
            ReservadoEm = r.ReservadoEm
        }).ToList();

        return new WishlistPrivadaResponseDto
        {
            Id = wishlist.Id!,
            Slug = wishlist.Slug,
            Titulo = wishlist.Titulo,
            Descricao = wishlist.Descricao,
            Ativa = wishlist.Ativa,
            CriadaEm = wishlist.CriadaEm,
            ExpiraEm = wishlist.ExpiraEm,
            Itens = itensDto,
            Reservas = reservasDto
        };
    }

    public async Task<bool> ReservarItem(string slug, string itemId, ReservarItemDto dto)
    {
        var wishlist = await _context.Wishlists
            .Find(w => w.Slug == slug && w.Ativa)
            .FirstOrDefaultAsync();

        if (wishlist == null)
        {
            return false;
        }

        // Verificar se item já está reservado
        if (wishlist.Reservas.Any(r => r.ItemId == itemId))
        {
            return false;
        }

        var reserva = new ReservaPresente
        {
            ItemId = itemId,
            NomePresente = dto.NomePresente,
            Mensagem = dto.Mensagem,
            ReservadoEm = DateTime.UtcNow
        };

        var update = Builders<WishlistPublica>.Update
            .Push(w => w.Reservas, reserva);

        var result = await _context.Wishlists.UpdateOneAsync(
            w => w.Slug == slug && w.Ativa,
            update
        );

        return result.ModifiedCount > 0;
    }

    public async Task<bool> CancelarReserva(string slug, string itemId, string nomePresente)
    {
        var update = Builders<WishlistPublica>.Update
            .PullFilter(w => w.Reservas, 
                r => r.ItemId == itemId && r.NomePresente == nomePresente);

        var result = await _context.Wishlists.UpdateOneAsync(
            w => w.Slug == slug,
            update
        );

        return result.ModifiedCount > 0;
    }

    public async Task<WishlistPublica?> AtualizarWishlist(string usuarioId, AtualizarWishlistDto dto)
    {
        var wishlist = await _context.Wishlists
            .Find(w => w.UsuarioId == usuarioId)
            .FirstOrDefaultAsync();

        if (wishlist == null)
        {
            return null;
        }

        var updateDefinition = Builders<WishlistPublica>.Update;

        var updates = new List<UpdateDefinition<WishlistPublica>>();

        if (dto.Titulo != null)
        {
            updates.Add(updateDefinition.Set(w => w.Titulo, dto.Titulo));
        }

        if (dto.Descricao != null)
        {
            updates.Add(updateDefinition.Set(w => w.Descricao, dto.Descricao));
        }

        if (dto.Ativa.HasValue)
        {
            updates.Add(updateDefinition.Set(w => w.Ativa, dto.Ativa.Value));
        }

        if (dto.ItemIds != null)
        {
            updates.Add(updateDefinition.Set(w => w.ItemIds, dto.ItemIds));
        }

        if (dto.ExpiraEm.HasValue)
        {
            updates.Add(updateDefinition.Set(w => w.ExpiraEm, dto.ExpiraEm.Value));
        }

        if (updates.Count == 0)
        {
            return wishlist;
        }

        var combinedUpdate = updateDefinition.Combine(updates);

        var options = new FindOneAndUpdateOptions<WishlistPublica>
        {
            ReturnDocument = ReturnDocument.After
        };

        var result = await _context.Wishlists.FindOneAndUpdateAsync(
            w => w.UsuarioId == usuarioId,
            combinedUpdate,
            options
        );

        return result;
    }

    public async Task<bool> SlugDisponivel(string slug)
    {
        var count = await _context.Wishlists
            .Find(w => w.Slug == slug)
            .CountDocumentsAsync();

        return count == 0;
    }
}
