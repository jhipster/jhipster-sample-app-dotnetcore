
using System;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Repositories.Interfaces
{

    public interface IReadOnlyCountryRepository : IReadOnlyGenericRepository<Country, long?>
    {
    }

}
