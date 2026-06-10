using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.API.Models;

public class ItemVariante
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
    
    public string Nome { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public string Loja { get; set; } = string.Empty;
    public string? FotoUrl { get; set; }
    public string? LinkProduto { get; set; }
    public string? Observacao { get; set; }
    public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
}
