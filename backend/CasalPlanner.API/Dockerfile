# Estágio 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# O contexto de build é 'backend', então o csproj está em 'CasalPlanner.API/'
COPY ["CasalPlanner.API/CasalPlanner.API.csproj", "CasalPlanner.API/"]
RUN dotnet restore "CasalPlanner.API/CasalPlanner.API.csproj"

# Copiar todo o código
COPY . .

# Publicar a aplicação
WORKDIR "/src/CasalPlanner.API"
RUN dotnet publish "CasalPlanner.API.csproj" -c Release -o /app/publish

# Estágio 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Configurar variáveis de ambiente
ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

# Expor porta
EXPOSE 80

# Iniciar aplicação
ENTRYPOINT ["dotnet", "CasalPlanner.API.dll"]