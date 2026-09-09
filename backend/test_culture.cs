using System;
using System.Globalization;

class Program {
    static void Main() {
        var ptBr = new CultureInfo("pt-BR");
        Console.WriteLine(decimal.Parse("100.5", ptBr));
    }
}
