using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CasalPlanner.Infrastructure.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;
    private readonly string _folder = "casal-planner/itens";

    public CloudinaryService(IConfiguration config, ILogger<CloudinaryService> logger)
    {
        _logger = logger;
        
        var cloudName = config["CLOUDINARY_CLOUD_NAME"];
        var apiKey = config["CLOUDINARY_API_KEY"];
        var apiSecret = config["CLOUDINARY_API_SECRET"];

        if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
        {
            _logger.LogWarning("Configurações do Cloudinary ausentes. Upload de imagens não funcionará.");
            _cloudinary = new Cloudinary(new Account("demo", "demo", "demo")); // Fallback to prevent crash during instantiation
        }
        else
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }
        
        _cloudinary.Api.Secure = true;
    }

    public async Task<(string SecureUrl, string PublicId)> UploadImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Nenhum arquivo enviado.");

        // Limit size to 5MB
        if (file.Length > 5 * 1024 * 1024)
            throw new InvalidOperationException("A imagem excede o tamanho máximo de 5MB.");

        // Validate extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedExtensions.Contains(extension))
            throw new InvalidOperationException("Formato de imagem inválido. Apenas JPG, PNG e WEBP são permitidos.");

        await using var stream = file.OpenReadStream();
        
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = _folder,
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            _logger.LogError("Erro no upload do Cloudinary: {Error}", uploadResult.Error.Message);
            throw new Exception($"Falha ao fazer upload da imagem: {uploadResult.Error.Message}");
        }

        return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId);
    }

    public async Task DeleteImageAsync(string publicId)
    {
        if (string.IsNullOrEmpty(publicId)) return;

        var deletionParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deletionParams);

        if (result.Error != null)
        {
            _logger.LogWarning("Falha ao deletar imagem no Cloudinary ({PublicId}): {Error}", publicId, result.Error.Message);
        }
        else
        {
            _logger.LogInformation("Imagem {PublicId} deletada do Cloudinary. Status: {Result}", publicId, result.Result);
        }
    }
}
