using JhipsterSampleApplication.Domain.Entities;
using System;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{
    public interface IJobHistoryRepository : IGenericRepository<JobHistory, long?>
    {
    }
}
