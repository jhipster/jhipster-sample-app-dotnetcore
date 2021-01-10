using System;
using System.Diagnostics;
using System.Security.Authentication;
using Hellang.Middleware.ProblemDetails;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Jhipster.Web.Rest.Problems
{
    public class ProblemDetailsConfiguration : IConfigureOptions<ProblemDetailsOptions>
    {
        public ProblemDetailsConfiguration(IHostEnvironment environment, IHttpContextAccessor httpContextAccessor)
        {
            _environment = environment;
            _HttpContextAccessor = httpContextAccessor;
        }

        private IHostEnvironment _environment { get; }
        private IHttpContextAccessor _HttpContextAccessor { get; }

        public void Configure(ProblemDetailsOptions options)
        {
            options.IncludeExceptionDetails = (ctx, details) => _environment.IsDevelopment();

            options.OnBeforeWriteDetails = (ctx, details) =>
            {
                // keep consistent with asp.net core 2.2 conventions that adds a tracing value
                var traceId = Activity.Current?.Id ?? _HttpContextAccessor.HttpContext.TraceIdentifier;
                details.Extensions["traceId"] = traceId;
            };

            // Those ones will catch the NotImplementedException and HttpRequestException
            options.MapToStatusCode<AuthenticationException>(StatusCodes.Status401Unauthorized);
            options.MapToStatusCode<NotImplementedException>(StatusCodes.Status501NotImplemented);

            // Because exceptions are handled polymorphically, this will act as a "catch all" mapping, which is why it's added last.
            // If an exception other than NotImplementedException and HttpRequestException is thrown, this will handle it.
            options.MapToStatusCode<Exception>(StatusCodes.Status500InternalServerError);

            //TODO add Headers to HTTP responses
        }
    }
}
