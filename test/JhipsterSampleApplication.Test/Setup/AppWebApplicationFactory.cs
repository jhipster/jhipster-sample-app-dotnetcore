using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Threading.Tasks;
using JhipsterSampleApplication.Crosscutting.Constants;
using JhipsterSampleApplication.Configuration;
using JhipsterSampleApplication.Test.Configuration;
using JhipsterSampleApplication.Domain.Services.Interfaces;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.JsonWebTokens;
using Moq;

namespace JhipsterSampleApplication.Test.Setup;

public class AppWebApplicationFactory<TEntryPoint> : WebApplicationFactory<TEntryPoint>
    where TEntryPoint : class, IStartup, new()
{
    private IStartup _startup;
    private IServiceProvider _serviceProvider;
    private ClaimsPrincipal _user { get; set; }

    public AppWebApplicationFactory()
    {
        _startup = new TEntryPoint();
    }

    protected override IWebHostBuilder CreateWebHostBuilder()
    {
        return WebHost.CreateDefaultBuilder()
            .ConfigureServices((context, services) =>
            {
                _startup.Configure(context.Configuration, services);
                _startup.ConfigureServices(services, context.HostingEnvironment);
            });
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder
            .UseSolutionRelativeContentRoot("src/JhipsterSampleApplication")
            .ConfigureServices(services =>
            {
                services.AddSingleton(CreateMockMailService().Object);
                services
                    .AddMvc(TestMvcStartup.ConfigureMvcAuthorization());
                services.Replace(new ServiceDescriptor(typeof(IHttpContextFactory), typeof(MockHttpContextFactory),
                    ServiceLifetime.Transient));
                services.AddTransient(_ => new MockClaimsPrincipalProvider(_user));
            })
            .Configure((context, applicationBuilder) =>
            {
                _serviceProvider = applicationBuilder.ApplicationServices;
                _startup.ConfigureMiddleware(applicationBuilder, context.HostingEnvironment);
                _startup.ConfigureEndpoints(applicationBuilder, context.HostingEnvironment);
            });
    }

    public TService GetRequiredService<TService>()
    {
        return _serviceProvider.GetRequiredService<TService>();
    }

    public AppWebApplicationFactory<TEntryPoint> WithMockUser(string name = "user",
        IEnumerable<string> roles = null, string authenticationType = "MockAuthenticationType")
    {
        _user = BuildClaimsPrincipal(name, roles, authenticationType);
        return this;
    }

    private static ClaimsPrincipal BuildClaimsPrincipal(string name, IEnumerable<string> roles,
        string authenticationType)
    {
        if (roles == null || !roles.Any()) roles = new HashSet<string> { RolesConstants.USER };

        var claims = new List<Claim> { new Claim(SecurityStartup.UserNameClaimType, name) };
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        return new ClaimsPrincipal(new ClaimsIdentity(claims.ToArray(), authenticationType));
    }

    private static Mock<IMailService> CreateMockMailService()
    {
        // Setup mock mail service with default successful responses
        var mockMailService = new Mock<IMailService>();
        var setups = new Expression<Func<IMailService, Task>>[]
        {
            x => x.SendActivationEmail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            x => x.SendCreationEmail(It.IsAny<string>(), It.IsAny<string>()),
            x => x.SendPasswordResetMail(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>())
        };
        foreach (Expression<Func<IMailService, Task>> setup in setups)
        {
            mockMailService.Setup(setup).Returns(Task.CompletedTask);
        }
        return mockMailService;
    }
}
