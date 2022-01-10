using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;

namespace Jhipster.Domain.Services.Interfaces
{
    public interface IRulesetService
    {
        Task<Ruleset> Save(Ruleset ruleset);

        Task<IPage<Ruleset>> FindAll(IPageable pageable);

        Task<Ruleset> FindOne(long id);

        Task Delete(long id);
    }
}
