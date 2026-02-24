using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.API.Models
{
    public class Usuario
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        // Informações da Conta
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public bool IsAtivo { get; set; } = true;
        
        // Tipo de conta
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
        
        // Preferências
        public PreferenciasUsuario Preferencias { get; set; } = new();
    }
    
    public enum TipoConta
    {
        Individual,  // Uma pessoa
        Casal        // Duas pessoas compartilhando
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
        
        // Informações do casal (COM DATA DE CASAMENTO)
        public DateTime? DataCasamento { get; set; }
        
        // Metadados
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
    
    public class PreferenciasUsuario
    {
        public bool ModoEscuro { get; set; } = false;
        public string Moeda { get; set; } = "BRL";
        public string Idioma { get; set; } = "pt-BR";
        public bool NotificacoesEmail { get; set; } = true;
        public string? CorPrimaria { get; set; } = "#27ae60";
    }
}