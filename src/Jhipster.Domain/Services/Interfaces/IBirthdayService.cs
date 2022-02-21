using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using System.Collections.Generic;
using Jhipster.Domain;

namespace Jhipster.Domain.Services.Interfaces
{
    public interface IBirthdayService
    {
        Task<Birthday> Save(Birthday birthday);

        Task<IPage<Birthday>> FindAll(IPageable pageable, string query);

        Task<Birthday> FindOne(string id);

        Task<string> FindOneText(string id);

        Task Delete(string id);

        Task<List<Birthday>> GetReferencesFrom(string id);

        Task<List<Birthday>> GetReferencesTo(string id);
    }
}
