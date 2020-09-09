using System;
using MyCompany.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MyCompany.Configuration {
    public static class DatabaseConfiguration {
        public static IServiceCollection AddDatabaseModule(this IServiceCollection @this, IConfiguration configuration)
        {
            var entityFrameworkConfiguration = configuration.GetSection("EntityFramework");

            var connection = new SqliteConnection(new SqliteConnectionStringBuilder {
                DataSource = entityFrameworkConfiguration["DataSource"]
            }.ToString());

            @this.AddDbContext<ApplicationDatabaseContext>(context => { context.UseSqlite(connection); });

            return @this;
        }

        public static IApplicationBuilder UseApplicationDatabase(this IApplicationBuilder @this,
            IServiceProvider serviceProvider, IHostEnvironment environment)
        {
            if (environment.IsDevelopment() || environment.IsProduction())
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDatabaseContext>();
                    context.Database.OpenConnection();
                    context.Database.EnsureCreated();
                }
            }

            return @this;
        }
    }
}
