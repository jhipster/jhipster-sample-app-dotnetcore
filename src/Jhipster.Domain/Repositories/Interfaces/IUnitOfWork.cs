using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Domain.Repositories.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        DbSet<T> Set<T>(string name = null) where T : class;
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken));
        void AddGraph<TEntiy>(TEntiy entity) where TEntiy : class;
        void UpdateState<TEntity>(TEntity entity, EntityState state);
        void SetEntityStateModified<TEntiy, TProperty>(TEntiy entity, Expression<Func<TEntiy, TProperty>> propertyExpression) where TEntiy : class where TProperty : class;
        void RemoveNavigationProperty<TEntity, TOwnerEntity>(TOwnerEntity ownerEntity, object id) where TEntity : class where TOwnerEntity : class;
    }
}
