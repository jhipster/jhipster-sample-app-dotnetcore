using System;
using Jhipster.Infrastructure.Configuration;
using Microsoft.Extensions.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Jhipster.Domain.Entities;
using Jhipster.Infrastructure.Data;
using Jhipster.Infrastructure.Data.Repositories;
using Jhipster.Security;
using Jhipster.Security.Jwt;
using Jhipster.Domain.Services;
using Jhipster.Domain.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using AuthenticationService = Jhipster.Domain.Services.AuthenticationService;
using IAuthenticationService = Jhipster.Domain.Services.Interfaces.IAuthenticationService;

namespace Jhipster.Configuration;

public static class SecurityStartup
{
    public const string UserNameClaimType = JwtRegisteredClaimNames.Sub;

    public static IServiceCollection AddSecurityModule(this IServiceCollection services)
    {
        //TODO Retrieve the signing key properly (DRY with TokenProvider)
        var opt = services.BuildServiceProvider().GetRequiredService<IOptions<SecuritySettings>>();
        var securitySettings = opt.Value;
        byte[] keyBytes;
        var secret = securitySettings.Authentication.Jwt.Secret;

        if (!string.IsNullOrWhiteSpace(secret))
        {
            keyBytes = Encoding.ASCII.GetBytes(secret);
        }
        else
        {
            keyBytes = Convert.FromBase64String(securitySettings.Authentication.Jwt.Base64Secret);
        }

        JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear(); // => remove default claims

        services.AddIdentity<User, Role>(options =>
            {
                options.SignIn.RequireConfirmedEmail = true;
                options.ClaimsIdentity.UserNameClaimType = UserNameClaimType;
            })
            .AddEntityFrameworkStores<ApplicationDatabaseContext>()
            .AddUserStore<UserStore<User, Role, ApplicationDatabaseContext, string, IdentityUserClaim<string>,
                UserRole, IdentityUserLogin<string>, IdentityUserToken<string>, IdentityRoleClaim<string>>>()
            .AddRoleStore<RoleStore<Role, ApplicationDatabaseContext, string, UserRole, IdentityRoleClaim<string>>
            >()
            .AddDefaultTokenProviders();

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;
                cfg.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    ClockSkew = TimeSpan.Zero,/// remove delay of token when expire
                    NameClaimType = UserNameClaimType
                };
            });

        services.AddScoped<IPasswordHasher<User>, BCryptPasswordHasher>();
        services.AddScoped<IClaimsTransformation, RoleClaimsTransformation>();
        services.AddScoped<ITokenProvider, TokenProvider>();
        return services;
    }

    public static IApplicationBuilder UseApplicationSecurity(this IApplicationBuilder app,
        SecuritySettings securitySettings)
    {
        app.UseCors(CorsPolicyBuilder(securitySettings.Cors));
        app.UseAuthentication();
        if (securitySettings.EnforceHttps)
        {
            app.UseHsts();
            app.UseHttpsRedirection();
        }
        return app;
    }

    private static Action<CorsPolicyBuilder> CorsPolicyBuilder(Cors config)
    {
        //TODO implement an url based cors policy rather than global or per controller
        return builder =>
        {
            if (!config.AllowedOrigins.Equals("*"))
            {
                if (config.AllowCredentials)
                {
                    builder.AllowCredentials();
                }
                else
                {
                    builder.DisallowCredentials();
                }
            }

            builder.WithOrigins(config.AllowedOrigins)
                .WithMethods(config.AllowedMethods)
                .WithHeaders(config.AllowedHeaders)
                .WithExposedHeaders(config.ExposedHeaders)
                .SetPreflightMaxAge(TimeSpan.FromSeconds(config.MaxAge));
        };
    }
}
