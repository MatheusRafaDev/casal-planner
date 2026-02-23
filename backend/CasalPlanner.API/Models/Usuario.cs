using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.API.Models
{
    public class Usuario
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public string Nome { get; set; } = string.Empty;
        
        [BsonElement("Email")]
        public string Email { get; set; } = string.Empty;
        
        public string SenhaHash { get; set; } = string.Empty;
        
        public bool IsCasal { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
}