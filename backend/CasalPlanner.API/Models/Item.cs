using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.API.Models;

[BsonIgnoreExtraElements]
public class Item
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public string Nome { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int Quantidade { get; set; } = 1;
    
    [BsonRepresentation(BsonType.ObjectId)]
    public string CategoriaId { get; set; } = string.Empty;
    
    public bool Comprado { get; set; } = false;
    public string Pagamento { get; set; } = "normal";
    public string Prioridade { get; set; } = "normal"; 
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    [BsonRepresentation(BsonType.ObjectId)]
    public string UsuarioId { get; set; } = string.Empty;

    public string Loja { get; set; } = string.Empty;
    public string LinkProduto { get; set; } = "";
    public string FotoUrl { get; set; } = "";

    public string Origem { get; set; } = "comprado";
    public string OrigemDescricao { get; set; } = "";
    public int Parcelas { get; set; } = 1;
    public List<string> Variantes { get; set; } = new List<string>();
    public string? VarianteSelecionadaId { get; set; }
}