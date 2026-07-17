# ── Estágio 1: Build ─────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["CasalPlanner.Domain/CasalPlanner.Domain.csproj", "CasalPlanner.Domain/"]
COPY ["CasalPlanner.Application/CasalPlanner.Application.csproj", "CasalPlanner.Application/"]
COPY ["CasalPlanner.Infrastructure/CasalPlanner.Infrastructure.csproj", "CasalPlanner.Infrastructure/"]
COPY ["CasalPlanner.API/CasalPlanner.API.csproj", "CasalPlanner.API/"]
RUN dotnet restore "CasalPlanner.API/CasalPlanner.API.csproj"

COPY . .
WORKDIR "/src/CasalPlanner.API"

RUN dotnet publish "CasalPlanner.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    -p:UseAppHost=false

# ── Estágio 2: Runtime ───────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 8080

ENTRYPOINT ["dotnet", "CasalPlanner.API.dll"]
