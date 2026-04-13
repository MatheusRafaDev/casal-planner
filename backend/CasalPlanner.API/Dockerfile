# Etapa 1: Build (compila o código)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia o arquivo do projeto e restaura as dependências
COPY ["CasalPlanner.API.csproj", "."]
RUN dotnet restore

# Copia todo o resto do código e publica o build final
COPY . .
RUN dotnet publish "CasalPlanner.API.csproj" -c Release -o /app/publish

# Etapa 2: Runtime (só o necessário para rodar)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Expõe a porta que sua API vai usar
EXPOSE 80
EXPOSE 443

# Define o comando para iniciar a aplicação
ENTRYPOINT ["dotnet", "CasalPlanner.API.dll"]