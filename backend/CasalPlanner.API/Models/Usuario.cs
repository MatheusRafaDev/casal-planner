using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.API.Models
{
    public class Usuario
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public bool IsAtivo { get; set; } = true;
        
        public TipoConta TipoConta { get; set; } = TipoConta.Individual;
        
        // Para contas individuais
        public string? NomeCompleto { get; set; }
        public string? Email { get; set; }
        public string? SenhaHash { get; set; }
        public string? CPF { get; set; }
        public DateTime? DataNascimento { get; set; }
        public string? Telefone { get; set; }
        public decimal? RendaMensal { get; set; }
        public bool IsCasal { get; set; } = false;
        
        // Para contas de casal
        public CasalInfo? CasalInfo { get; set; }
        
        // Apenas modo escuro como preferência
        public bool ModoEscuro { get; set; } = false;
    }
    
    public enum TipoConta
    {
        Individual,
        Casal
    }
    
    public class CasalInfo
    {
        // Pessoa 1
        public string NomeCompletoPessoa1 { get; set; } = string.Empty;
        public string EmailPessoa1 { get; set; } = string.Empty;
        public string SenhaHashPessoa1 { get; set; } = string.Empty;
        public string CPFPessoa1 { get; set; } = string.Empty;
        public DateTime DataNascimentoPessoa1 { get; set; }
        public string? TelefonePessoa1 { get; set; }
        public decimal? RendaMensalPessoa1 { get; set; }
        public string? AvatarPessoa1 { get; set; }
        
        // Pessoa 2
        public string NomeCompletoPessoa2 { get; set; } = string.Empty;
        public string EmailPessoa2 { get; set; } = string.Empty;
        public string SenhaHashPessoa2 { get; set; } = string.Empty;
        public string CPFPessoa2 { get; set; } = string.Empty;
        public DateTime DataNascimentoPessoa2 { get; set; }
        public string? TelefonePessoa2 { get; set; }
        public decimal? RendaMensalPessoa2 { get; set; }
        public string? AvatarPessoa2 { get; set; }
        
        public DateTime? DataCasamento { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}