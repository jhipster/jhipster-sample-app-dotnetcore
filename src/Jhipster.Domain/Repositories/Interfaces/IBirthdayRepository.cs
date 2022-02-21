using System.Threading.Tasks;
using System.Collections.Generic;

namespace Jhipster.Domain.Repositories.Interfaces
{
    public interface IBirthdayRepository : IGenericRepository<Birthday>
    {
        Task<string> GetOneTextAsync(object id);

        Task<List<Birthday>> GetReferencesFromAsync(string id);

        Task<List<Birthday>> GetReferencesToAsync(string id);
    }
}
