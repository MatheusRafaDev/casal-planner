using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CasalPlanner.Infrastructure.Persistence;
using CasalPlanner.Infrastructure.Services;
using MongoDB.Driver;
using System.Text.RegularExpressions;
using CasalPlanner.Domain.Entities;
using MongoDB.Bson;

namespace CasalPlanner.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Pode restringir a admin se houver role
public class MigracaoController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly CloudinaryService _cloudinary;

    public MigracaoController(MongoDbContext context, CloudinaryService cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }

    [HttpPost("cloudinary")]
    public async Task<IActionResult> MigrarImagensCloudinary()
    {
        // Encontra itens onde FotoUrl começa com "data:image"
        var filter = Builders<Item>.Filter.Regex(i => i.FotoUrl, new BsonRegularExpression("^data:image"));
        var itensParaMigrar = await _context.Itens.Find(filter).ToListAsync();

        var atualizados = 0;
        var falhas = 0;

        foreach (var item in itensParaMigrar)
        {
            try
            {
                var match = Regex.Match(item.FotoUrl, @"^data:image/(?<type>[a-zA-Z]+);base64,(?<data>.+)$");
                if (!match.Success)
                {
                    falhas++;
                    continue;
                }

                var base64Data = match.Groups["data"].Value;
                var bytes = Convert.FromBase64String(base64Data);

                // Create a memory stream and an IFormFile equivalent
                using var stream = new MemoryStream(bytes);
                var formFile = new FormFile(stream, 0, stream.Length, "file", $"migrado_{item.Id}.jpg")
                {
                    Headers = new HeaderDictionary(),
                    ContentType = $"image/{match.Groups["type"].Value}"
                };

                var (url, publicId) = await _cloudinary.UploadImageAsync(formFile);

                var update = Builders<Item>.Update
                    .Set(i => i.FotoUrl, url)
                    .Set(i => i.FotoPublicId, publicId);

                await _context.Itens.UpdateOneAsync(i => i.Id == item.Id, update);
                atualizados++;
            }
            catch (Exception ex)
            {
                // Ignorar falhas individuais e continuar
                Console.WriteLine($"Falha ao migrar item {item.Id}: {ex.Message}");
                falhas++;
            }
        }

        return Ok(new { mensagem = "Migração concluída", itensMigrados = atualizados, itensFalhados = falhas });
    }
}
