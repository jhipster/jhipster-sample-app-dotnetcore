using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;

namespace Jhipster.Domain.Services.Interfaces
{
    public interface ICountryService
    {
        Task<Country> Save(Country country);

        Task<IPage<Country>> FindAll(IPageable pageable);

        Task<Country> FindOne(long id);

        Task Delete(long id);
    }
}
