using CasalPlanner.Infrastructure.Helpers;
using Xunit;

namespace CasalPlanner.Tests;

public class PriceTextHelperTests
{
    // ===== ParsePrice Tests =====

    [Theory]
    [InlineData("R$ 1.299,90", 1299.90)]
    [InlineData("R$1.299,90", 1299.90)]
    [InlineData("1299.90", 1299.90)]
    [InlineData("1299,90", 1299.90)]
    [InlineData("1299", 1299)]
    [InlineData("R$ 59,99", 59.99)]
    [InlineData("3.500,00", 3500.00)]
    [InlineData("12.000,00", 12000.00)]
    public void ExtractPrice_ShouldParseCorrectly(string input, decimal expected)
    {
        var result = PriceTextHelper.ExtractPrice(input);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("abc")]
    [InlineData(null)]
    public void ExtractPrice_ShouldReturnZeroForInvalidInput(string? input)
    {
        var result = PriceTextHelper.ExtractPrice(input ?? "");
        Assert.Equal(0m, result);
    }

    // ===== NormalizeSearchQuery Tests =====

    [Theory]
    [InlineData("iPhone 15 Pro Max", "iphone 15 pro max")]
    [InlineData("Televisão 55\"  4K", "televisao 55\" 4k")]
    [InlineData("  Samsung   Galaxy  ", "samsung galaxy")]
    [InlineData("café   expresso", "cafe expresso")]
    public void NormalizeSearchQuery_ShouldNormalize(string input, string expected)
    {
        var result = PriceTextHelper.NormalizeSearchQuery(input);
        Assert.Equal(expected, result);
    }

    [Fact]
    public void NormalizeSearchQuery_ShouldRemoveMultipleSpaces()
    {
        var result = PriceTextHelper.NormalizeSearchQuery("  hello   world  ");
        Assert.Equal("hello world", result);
    }

    // ===== CalculateSimilarity Tests =====

    [Fact]
    public void CalculateSimilarity_IdenticalStrings_Returns100()
    {
        var result = PriceTextHelper.CalculateSimilarity("iphone 15 pro", "iphone 15 pro");
        Assert.Equal(100m, result);
    }

    [Fact]
    public void CalculateSimilarity_CompletelyDifferent_ReturnsLow()
    {
        var result = PriceTextHelper.CalculateSimilarity("abcdefgh", "12345678");
        Assert.True(result < 30, $"Expected < 30, got {result}");
    }

    [Fact]
    public void CalculateSimilarity_NearlyIdentical_ReturnsHigh()
    {
        // "iphone 15 pro" vs "iphone 15 pro max" — muito similar
        var result = PriceTextHelper.CalculateSimilarity("iphone 15 pro", "iphone 15 pro max");
        Assert.True(result > 70, $"Expected > 70, got {result}");
    }
}
