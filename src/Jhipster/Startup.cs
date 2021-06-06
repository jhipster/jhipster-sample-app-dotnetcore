using System;
using Jhipster.Infrastructure.Data;
using Jhipster.Configuration;
using Jhipster.Infrastructure.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Authentication.Certificate;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

[assembly: ApiController]

namespace Jhipster
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        private IConfiguration Configuration { get; }

        public IHostEnvironment Environment { get; }

        public virtual void ConfigureServices(IServiceCollection services)
        {
            services
                .AddAppSettingsModule(Configuration);

            AddDatabase(services);

            Microsoft.AspNetCore.Authentication.AuthenticationBuilder builder  = services
                .AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme);
                builder.AddCertificate(options =>
                {
                    // Only allow chained certs, no self signed
                    options.AllowedCertificateTypes = CertificateTypes.Chained;
                    options.ValidateCertificateUse = true;
                    // Don't perform the check if a certificate has been revoked - requires an "online CA", which was not set up in our case.
                    options.RevocationMode = X509RevocationMode.NoCheck;
                    /*
                    options.Events = new CertificateAuthenticationEvents()
                    {
                        OnChallenge = context =>{
                            return Task.CompletedTask;
                        },
                        OnAuthenticationFailed = context =>
                        {
                            return Task.CompletedTask;
                        },
                        OnCertificateValidated = context =>
                        {
                            var caValidator = context.HttpContext.RequestServices.GetService<CertificateAuthorityValidator>();
                            if (!caValidator.IsValid(context.ClientCertificate))
                            {
                                const string failValidationMsg = "The client certificate failed to validate";
                                //logger.LogWarning(failValidationMsg);
                                context.Fail(failValidationMsg);
                            }
                            return Task.CompletedTask;
                        } 
                    };
                    */
                })
                .AddCertificateCache();

            services
                .AddSecurityModule()
                .AddProblemDetailsModule(Environment)
                .AddAutoMapperModule()
                // .AddSingleton<CertificateAuthorityValidator>()
                .AddSwaggerModule()
                .AddWebModule()
                .AddRepositoryModule()
                .AddServiceModule();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public virtual void Configure(IApplicationBuilder app, IHostEnvironment env, IServiceProvider serviceProvider,
            ApplicationDatabaseContext context, IOptions<SecuritySettings> securitySettingsOptions)
        {
            var securitySettings = securitySettingsOptions.Value;
            app
                .UseApplicationSecurity(securitySettings)
                .UseApplicationProblemDetails()
                .UseApplicationSwagger()
                .UseApplicationWeb(env)
                .UseApplicationDatabase(serviceProvider, env)
                .UseApplicationIdentity(serviceProvider);
        }

        protected virtual void AddDatabase(IServiceCollection services)
        {
            services.AddDatabaseModule(Configuration);
        }
    }
}
