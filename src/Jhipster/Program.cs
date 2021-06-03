using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Serilog;
using System;
using System.IO;
using System.Security.Authentication;
using JHipsterNet.Web.Logging;
using Serilog.Sinks.Syslog;
using ILogger = Serilog.ILogger;
using static JHipsterNet.Core.Boot.BannerPrinter;
using Nest;
using Jhipster.Domain;

namespace Jhipster
{
    public class Program
    {

        const string SerilogSection = "Serilog";
        const string SyslogPort = "SyslogPort";
        const string SyslogUrl = "SyslogUrl";
        const string SyslogAppName = "SyslogAppName";

        public static int Main(string[] args)
        {
            PrintBanner(1 * 1000);
            //1. Setup Connection and ElasticClient
            Console.WriteLine("Connecting to Elastic-Search");
            var node = new Uri("https://texttemplate-testing-7087740692.us-east-1.bonsaisearch.net/");

            var setting = new Nest.ConnectionSettings(node).BasicAuthentication("7303xa0iq9","4cdkz0o14").DefaultIndex("birthdays");

            var elastic = new ElasticClient(setting);

            var searchResponse = elastic.Search<Birthday>(s => s
                .Query(q => q
                    .MatchAll()
                )
            );
            Console.WriteLine(searchResponse.Hits.Count + " hits");
            foreach (var hit in searchResponse.Hits)
            {
                Console.WriteLine(hit.Source.ToString());
            }
             searchResponse = elastic.Search<Birthday>(s => s
                .Size(1000)
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Dob)
                        .GreaterThanOrEquals(new DateTime(1941, 01, 01))
                        .LessThan(new DateTime(1942, 01, 01))
                    )
                )
            );            
            Console.WriteLine(searchResponse.Hits.Count + " hits");
            foreach (var hit in searchResponse.Hits)
            {
                Console.WriteLine(hit.Source.ToString());
            }
          try
            {
                var appConfiguration = GetAppConfiguration();
                Log.Logger = CreateLogger(appConfiguration);

                CreateWebHostBuilder(args)
                    .Build()
                    .Run();

                return 0;
            }
            catch (Exception ex)
            {
                // Use ForContext to give a context to this static environment (for Serilog LoggerNameEnricher).
                Log.ForContext<Program>().Fatal(ex, $"Host terminated unexpectedly");
                return 1;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IWebHostBuilder CreateWebHostBuilder(params string[] args)
        {
            return WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .UseWebRoot(Path.Combine(Directory.GetCurrentDirectory(), "ClientApp", "dist"))
                .UseSerilog();
        }

        /// <summary>
        /// Create application logger from configuration.
        /// </summary>
        /// <returns></returns>
        private static ILogger CreateLogger(IConfiguration appConfiguration)
        {
            var port = 6514;

            // for logger configuration
            // https://github.com/serilog/serilog-settings-configuration
            if (appConfiguration.GetSection(SerilogSection)[SyslogPort] != null)
            {
                if (int.TryParse(appConfiguration.GetSection(SerilogSection)[SyslogPort], out var portFromConf))
                {
                    port = portFromConf;
                }
            }

            var url = appConfiguration.GetSection(SerilogSection)[SyslogUrl] != null
                ? appConfiguration.GetSection(SerilogSection)[SyslogUrl]
                : "localhost";
            var appName = appConfiguration.GetSection(SerilogSection)[SyslogAppName] != null
                ? appConfiguration.GetSection(SerilogSection)[SyslogAppName]
                : "JhipsterApp";
            var loggerConfiguration = new LoggerConfiguration()
                .Enrich.With<LoggerNameEnricher>()
                .WriteTo.TcpSyslog(url, port, appName, FramingType.OCTET_COUNTING, SyslogFormat.RFC5424, Facility.Local0, SslProtocols.None)
                .ReadFrom.Configuration(appConfiguration);

            return loggerConfiguration.CreateLogger();
        }

        /// <summary>
        /// Gets the current application configuration
        /// from global and specific appsettings.
        /// </summary>
        /// <returns>Return the application <see cref="IConfiguration"/></returns>
        private static IConfiguration GetAppConfiguration()
        {
            // Actually, before ASP.NET bootstrap, we must rely on environment variable to get environment name
            // https://docs.microsoft.com/fr-fr/aspnet/core/fundamentals/environments?view=aspnetcore-2.2
            // Pay attention to casing for Linux environment. By default it's pascal case.
            var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            return new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{environment}.json", true)
                .AddEnvironmentVariables()
                .Build();
        }
    }
}
