# ── Estágio 1: Build ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/nightly/sdk:10.0-preview AS build
WORKDIR /src

# Restaurar dependências primeiro (melhor cache de camadas)
COPY ["CasalPlanner.API/CasalPlanner.API.csproj", "CasalPlanner.API/"]
RUN dotnet restore "CasalPlanner.API/CasalPlanner.API.csproj"

# Copiar código-fonte e publicar
COPY . .
WORKDIR "/src/CasalPlanner.API"
RUN dotnet publish "CasalPlanner.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    -p:UseAppHost=false

# ── Estágio 2: Runtime ────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/nightly/aspnet:10.0-preview AS runtime
WORKDIR /app

# Usuário não-root para segurança
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 8080

ENTRYPOINT ["dotnet", "CasalPlanner.API.dll"]