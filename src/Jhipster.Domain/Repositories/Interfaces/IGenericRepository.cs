using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Microsoft.EntityFrameworkCore.Query;

namespace Jhipster.Domain.Repositories.Interfaces
{
    public interface IGenericRepository<TEntity> where TEntity : class
    {
        Task<TEntity> GetOneAsync(object id);
        Task<IEnumerable<TEntity>> GetAllAsync();
        Task<IPage<TEntity>> GetPageAsync(IPageable pageable);
        Task<bool> Exists(Expression<Func<TEntity, bool>> predicate);
        Task<int> CountAsync();
        Task<TEntity> CreateOrUpdateAsync(TEntity entity);
        Task DeleteByIdAsync(object id);
        Task DeleteAsync(TEntity entity);
        Task Clear();
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default(CancellationToken));
        TEntity Add(TEntity entity);
        bool AddRange(params TEntity[] entities);
        TEntity Attach(TEntity entity);
        TEntity Update(TEntity entity);
        bool UpdateRange(params TEntity[] entities);
        IFluentRepository<TEntity> QueryHelper();
    }
}
