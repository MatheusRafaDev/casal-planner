using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.API.Models;

public class Categoria
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Icon { get; set; } = "📁"; 

    public string Bg { get; set; } = "#d6e9d6";

    public bool IsPadrao { get; set; } = false;

    public int Ordem { get; set; } = 0;

    public decimal? MetaOrcamento { get; set; } = null;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string? UsuarioId { get; set; } 
}