# Estágio 1: Build com .NET 10.0 Preview
FROM mcr.microsoft.com/dotnet/nightly/sdk:10.0-preview AS build
WORKDIR /src

# Copiar csproj e restaurar
COPY ["CasalPlanner.API/CasalPlanner.API.csproj", "CasalPlanner.API/"]
RUN dotnet restore "CasalPlanner.API/CasalPlanner.API.csproj" --source https://pkgs.dev.azure.com/dnceng/public/_packaging/dotnet-public/nuget/v3/index.json --source https://api.nuget.org/v3/index.json

# Copiar todo código
COPY . .

# Publicar
WORKDIR "/src/CasalPlanner.API"
RUN dotnet publish "CasalPlanner.API.csproj" -c Release -o /app/publish

# Estágio 2: Runtime com .NET 10.0 Preview
FROM mcr.microsoft.com/dotnet/nightly/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:80
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 80

ENTRYPOINT ["dotnet", "CasalPlanner.API.dll"]