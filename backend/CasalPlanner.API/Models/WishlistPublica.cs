using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.API.Models;

public class WishlistPublica
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    [BsonRepresentation(BsonType.ObjectId)]
    public string UsuarioId { get; set; } = string.Empty;
    
    public string Slug { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool Ativa { get; set; } = true;
    public List<string> ItemIds { get; set; } = new();
    public List<ReservaPresente> Reservas { get; set; } = new();
    public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiraEm { get; set; }
}

public class ReservaPresente
{
    public string ItemId { get; set; } = string.Empty;
    public string NomePresente { get; set; } = string.Empty;
    public string? Mensagem { get; set; }
    public DateTime ReservadoEm { get; set; } = DateTime.UtcNow;
}
