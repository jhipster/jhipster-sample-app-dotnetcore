using JhipsterSampleApplication.Infrastructure.Data;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Test.Setup;

namespace JhipsterSampleApplication.Test;

public static class Fixme
{
    public static User ReloadUser<TEntryPoint>(AppWebApplicationFactory<TEntryPoint> factory, User user)
        where TEntryPoint : class, IStartup, new()
    {
        var applicationDatabaseContext = factory.GetRequiredService<ApplicationDatabaseContext>();
        applicationDatabaseContext.Entry(user).Reload();
        return user;
    }
}
