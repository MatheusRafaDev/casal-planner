namespace CasalPlanner.Application.DTOs
{
    public class StoreValidationResult
    {
        public bool IsTrusted { get; set; }
        public bool IsMarketplace { get; set; }
        public string StoreType { get; set; } = "desconhecida";
    }
}
