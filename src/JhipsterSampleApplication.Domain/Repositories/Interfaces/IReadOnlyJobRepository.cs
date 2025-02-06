
using System;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{

    public interface IReadOnlyJobRepository : IReadOnlyGenericRepository<Job, long?>
    {
    }

}
