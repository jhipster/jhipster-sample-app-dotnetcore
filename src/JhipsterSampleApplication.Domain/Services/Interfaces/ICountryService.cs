using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Services.Interfaces
{
    public interface ICountryService
    {
        Task<Country> Save(Country country);

        Task<IPage<Country>> FindAll(IPageable pageable);

        Task<Country> FindOne(long? id);

        Task Delete(long? id);
    }
}
