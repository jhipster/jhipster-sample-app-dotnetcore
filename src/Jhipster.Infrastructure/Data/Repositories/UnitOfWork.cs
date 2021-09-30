using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        protected readonly DbContext _context;

        public UnitOfWork(DbContext context)
        {
            _context = context;
        }

        public void UpdateState<TEntity>(TEntity entity, EntityState state)
        {
            _context.Entry(entity).State = state;
        }

        public void SetEntityStateModified<TEntiy, TProperty>(TEntiy entity, Expression<Func<TEntiy, TProperty>> propertyExpression) where TEntiy : class where TProperty : class
        {
            _context.Entry(entity).Reference(propertyExpression).IsModified = true;
        }

        public void RemoveNavigationProperty<TEntity, TOwnerEntity>(TOwnerEntity ownerEntity, object id)
            where TEntity : class
            where TOwnerEntity : class
        {
            _context.Set<TEntity>().RemoveNavigationProperty(ownerEntity, id);
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            using var saveChangeTask = _context.SaveChangesAsync(cancellationToken);
            return await saveChangeTask;
        }

        public DbSet<T> Set<T>(string name = null) where T : class
        {
            return _context.Set<T>(name);
        }

        public void AddOrUpdateGraph<TEntiy>(TEntiy entity) where TEntiy : class
        {
            _context.ChangeTracker.TrackGraph(entity, e =>
            {
                var alreadyTrackedEntity = _context.ChangeTracker.Entries().FirstOrDefault(entry => entry.Entity.Equals(e.Entry.Entity));
                if (alreadyTrackedEntity != null)
                {
                    return;
                }
                if (e.Entry.IsKeySet)
                {
                    e.Entry.State = EntityState.Modified;
                }
                else
                {
                    e.Entry.State = EntityState.Added;
                }
            });
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
}
