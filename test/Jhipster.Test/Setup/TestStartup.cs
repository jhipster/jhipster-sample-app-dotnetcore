using MyCompany.Infrastructure.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using MyCompany.Data;
using System;

namespace MyCompany.Test.Setup
{
    public class TestStartup : Startup
    {
        public TestStartup(IConfiguration configuration, IHostEnvironment environment) : base(configuration, environment)
        {
        }

        public override void Configure(IApplicationBuilder app, IHostEnvironment env, IServiceProvider serviceProvider,
            ApplicationDatabaseContext context, IOptions<JHipsterSettings> jhipsterSettingsOptions)
        {
            base.Configure(app, env, serviceProvider, context, jhipsterSettingsOptions);
        }

        public override void ConfigureServices(IServiceCollection services)
        {
            base.ConfigureServices(services);
        }

        protected override void AddDatabase(IServiceCollection services)
        {
            var connection = new SqliteConnection(new SqliteConnectionStringBuilder
            {
                DataSource = ":memory:"
            }.ToString());

            services.AddDbContext<ApplicationDatabaseContext>(context => context.UseSqlite(connection));
        }
    }
}
