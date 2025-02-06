
using System;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{

    public interface IReadOnlyLocationRepository : IReadOnlyGenericRepository<Location, long?>
    {
    }

}
