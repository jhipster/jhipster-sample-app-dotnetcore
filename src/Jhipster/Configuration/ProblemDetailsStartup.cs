using Hellang.Middleware.ProblemDetails;
using MyCompany.Web.Rest.Problems;
using MyCompany.Crosscutting.Exceptions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace MyCompany.Configuration {
    public static class ProblemDetailsStartup {
        //TODO Understand difference between UI and non-ui Exceptions
        //https://github.com/christianacca/ProblemDetailsDemo/blob/master/src/ProblemDetailsDemo.Api/Startup.cs

        public static IServiceCollection AddProblemDetailsModule(this IServiceCollection @this, IHostEnvironment environment)
        {
            @this.AddProblemDetails(setup =>
            {
                setup.IncludeExceptionDetails = (_context, _exception) => !environment.IsDevelopment();

                // Map BadRequestAlertException and inheriting exceptions to ProblemDetails
                setup.Map<BadRequestAlertException>(exception => new ProblemDetails
                {
                    Type = exception.Type,
                    Detail = exception.Detail,
                    Status = StatusCodes.Status400BadRequest,
                    Extensions = { ["params"] = exception.EntityName, ["message"] = $"error.{exception.ErrorKey}" }
                });

                // Map InternalServerErrorException with status 500
                setup.Map<InternalServerErrorException>(exception => new ProblemDetails
                {
                    Type = exception.Type,
                    Detail = exception.Detail,
                    Status =  StatusCodes.Status500InternalServerError
                });

                // This mapping will catch exceptions inheriting from BaseException that has not been mapped previously
                setup.Map<BaseException>(exception => new ProblemDetails
                {
                    Type = exception.Type,
                    Detail = exception.Detail,
                    Status =  StatusCodes.Status400BadRequest
                });

            });

            @this.ConfigureOptions<ProblemDetailsConfiguration>();

            return @this;
        }

        public static IApplicationBuilder UseApplicationProblemDetails(this IApplicationBuilder @this)
        {
            @this.UseProblemDetails();
            return @this;
        }
    }
}
