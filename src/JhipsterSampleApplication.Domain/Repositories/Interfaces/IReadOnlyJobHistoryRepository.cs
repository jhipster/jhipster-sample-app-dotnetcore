
using System;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{

    public interface IReadOnlyJobHistoryRepository : IReadOnlyGenericRepository<JobHistory, long?>
    {
    }

}
