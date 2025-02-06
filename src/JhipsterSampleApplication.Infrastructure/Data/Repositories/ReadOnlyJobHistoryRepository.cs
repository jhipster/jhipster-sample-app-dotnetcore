using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using JhipsterSampleApplication.Infrastructure.Data.Extensions;

namespace JhipsterSampleApplication.Infrastructure.Data.Repositories
{
    public class ReadOnlyJobHistoryRepository : ReadOnlyGenericRepository<JobHistory, long?>, IReadOnlyJobHistoryRepository
    {
        public ReadOnlyJobHistoryRepository(IUnitOfWork context) : base(context)
        {
        }
    }
}
