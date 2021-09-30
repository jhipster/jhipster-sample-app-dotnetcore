using Scrutor;
using Microsoft.Extensions.DependencyInjection;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Repositories;

namespace Jhipster.Configuration
{
    public static class RepositoryStartup
    {
        public static IServiceCollection AddRepositoryModule(this IServiceCollection services)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.Scan(scan => scan
                .FromAssembliesOf(typeof(IUnitOfWork), typeof(UnitOfWork))
                    // Register repository interfaces using the I prefix convention for interfaces to match interface/class
                    .AddClasses(classes => classes.InNamespaces("Jhipster.Infrastructure.Data.Repositories"))
                        .UsingRegistrationStrategy(RegistrationStrategy.Replace(ReplacementBehavior.ServiceType))
                        .AsMatchingInterface()
                        .WithScopedLifetime()

                    // Now find repositories that has class name ending with "ExtendedRepository" and register interfaces it implements with priority.
                    // For example: if JobExtendedRepository class is present and implements IJobRepository interface, take precedence over
                    // existing registrations.
                    .AddClasses(classes => classes.Where(type => type.Namespace.Equals("Jhipster.Infrastructure.Data.Repositories") &&
                                                                 type.Name.EndsWith("ExtendedRepository")))
                        .UsingRegistrationStrategy(RegistrationStrategy.Replace(ReplacementBehavior.ServiceType))
                        .AsImplementedInterfaces()
                        .WithScopedLifetime()
            );

            return services;
        }
    }
}
