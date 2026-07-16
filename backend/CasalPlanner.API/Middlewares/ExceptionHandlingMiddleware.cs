using System.Net;
using System.Text.Json;

namespace CasalPlanner.API.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var statusCode = (int)HttpStatusCode.InternalServerError;
            var message = "Erro interno no servidor.";

            switch (exception)
            {
                case UnauthorizedAccessException authEx:
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    message = authEx.Message;
                    // Não logar stack trace inteiro para Unauthorized, apenas log warning
                    _logger.LogWarning("Acesso não autorizado: {Message}", message);
                    break;

                case ArgumentException argEx:
                case InvalidOperationException invEx:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = exception.Message;
                    _logger.LogWarning("Bad Request gerado: {Message}", message);
                    break;

                case KeyNotFoundException keyEx:
                    statusCode = (int)HttpStatusCode.NotFound;
                    message = exception.Message;
                    _logger.LogWarning("Não encontrado: {Message}", message);
                    break;

                default:
                    _logger.LogError(exception, "Exceção não tratada capturada pelo middleware.");
                    message = exception.Message; // Mantendo para não quebrar contrato do frontend por enquanto
                    break;
            }

            context.Response.StatusCode = statusCode;

            var result = JsonSerializer.Serialize(new { error = message });
            return context.Response.WriteAsync(result);
        }
    }
}
