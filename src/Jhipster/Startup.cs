using System;
using MyCompany.Data;
using MyCompany.Configuration;
using MyCompany.Infrastructure.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

[assembly: ApiController]

namespace MyCompany {
    public class Startup {
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
                .AddNhipsterModule(Configuration);

            AddDatabase(services);


            services
            .AddSecurityModule()
                .AddProblemDetailsModule(Environment)
                .AddAutoMapperModule()
                .AddSwaggerModule()
                .AddWebModule()
                .AddServiceModule();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public virtual void Configure(IApplicationBuilder app, IHostEnvironment env, IServiceProvider serviceProvider,
            ApplicationDatabaseContext context, IOptions<JHipsterSettings> jhipsterSettingsOptions)
        {
            var jhipsterSettings = jhipsterSettingsOptions.Value;
            app
                .UseApplicationSecurity(jhipsterSettings)
                .UseApplicationProblemDetails()
                .UseApplicationSwagger()
                .UseApplicationWeb(env)
                .UseApplicationDatabase(serviceProvider, env)                .UseApplicationIdentity(serviceProvider);

        }

        protected virtual void AddDatabase(IServiceCollection services)
        {
            services.AddDatabaseModule(Configuration);
        }
    }
}
