// Models/Usuario.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace CasalPlanner.Domain.Entities
{
    [BsonIgnoreExtraElements]
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
        public string? Provider { get; set; } = "local";
        public string? NomeCompleto { get; set; }
        public string? Email { get; set; }
        public string? SenhaHash { get; set; }
        public DateTime? DataNascimento { get; set; }

        // Campos para redefinição de senha - Individual
        public string? ResetCode { get; set; }
        public DateTime? ResetCodeExpiresAt { get; set; }
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiresAt { get; set; }

        public bool IsCasal { get; set; } = false;

        public CasalInfo? CasalInfo { get; set; }

        public List<PushSubscriptionInfo> PushSubscriptions { get; set; } = new();

        public decimal? MetaGlobalEnxoval { get; set; }

        public bool ModoEscuro { get; set; } = true;

        // Convite de parceiro
        public string? ConviteParceiroToken { get; set; }
        public string? ConviteParceiroEmail { get; set; }
        public DateTime? ConviteParceiroExpiraEm { get; set; }
    }

    public enum TipoConta
    {
        Individual,
        Casal
    }

    [BsonIgnoreExtraElements]
    public class CasalInfo
    {
        // Pessoa 1
        public string? ProviderPessoa1 { get; set; } = "local";
        public string NomeCompletoPessoa1 { get; set; } = string.Empty;
        public string EmailPessoa1 { get; set; } = string.Empty;
        [BsonElement("senhaHashPessoa1")]
        public string SenhaHashPessoa1 { get; set; } = string.Empty;
        [BsonElement("dataNascimentoPessoa1")]
        public DateTime? DataNascimentoPessoa1 { get; set; }

        public string? AvatarPessoa1 { get; set; }

        // Campos para redefinição - Pessoa 1
        public string? ResetCodePessoa1 { get; set; }
        public DateTime? ResetCodeExpiresAtPessoa1 { get; set; }
        public string? ResetTokenPessoa1 { get; set; }
        public DateTime? ResetTokenExpiresAtPessoa1 { get; set; }

        // Pessoa 2
        public string? ProviderPessoa2 { get; set; } = "local";
        public string NomeCompletoPessoa2 { get; set; } = string.Empty;
        public string EmailPessoa2 { get; set; } = string.Empty;
        [BsonElement("senhaHashPessoa2")]
        public string SenhaHashPessoa2 { get; set; } = string.Empty;
        [BsonElement("dataNascimentoPessoa2")]
        public DateTime? DataNascimentoPessoa2 { get; set; }

        public string? AvatarPessoa2 { get; set; }

        // Campos para redefinição - Pessoa 2
        public string? ResetCodePessoa2 { get; set; }
        public DateTime? ResetCodeExpiresAtPessoa2 { get; set; }

        public string? ResetTokenPessoa2 { get; set; }
        public DateTime? ResetTokenExpiresAtPessoa2 { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }

    [BsonIgnoreExtraElements]
    public class PushSubscriptionInfo
    {
        public string Endpoint { get; set; } = string.Empty;
        public string P256dh { get; set; } = string.Empty;
        public string Auth { get; set; } = string.Empty;
        public int PessoaId { get; set; } // 1 ou 2
    }
}