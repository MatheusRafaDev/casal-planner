using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.Domain.Entities;

[BsonIgnoreExtraElements]
public class RegistroPrecoFoto
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string UsuarioId { get; set; } = string.Empty;

    [BsonRepresentation(BsonType.ObjectId)]
    public string? ItemId { get; set; }

    public string ProdutoNome { get; set; } = string.Empty;
    public string? Marca { get; set; }
    public decimal Preco { get; set; }
    public string? Unidade { get; set; }
    public string Endereco { get; set; } = string.Empty;
    public string? NomeMercado { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string? ImagemUrl { get; set; }
    public DateTime DataCompra { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
