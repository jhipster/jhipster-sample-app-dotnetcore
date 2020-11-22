using Microsoft.EntityFrameworkCore;

namespace Jhipster.Infrastructure.Data.Extensions {
    public static class DbContextExtensions {
        public static void AddGraph(this DbContext dbContext, object rootObject)
        {
            dbContext.ChangeTracker.TrackGraph(rootObject, e => {
                if (e.Entry.IsKeySet) {
                    e.Entry.State = EntityState.Unchanged;
                }
                else {
                    e.Entry.State = EntityState.Added;
                }
            });
        }
    }
}
