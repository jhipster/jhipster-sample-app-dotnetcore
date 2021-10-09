using System.Threading.Tasks;

namespace Jhipster.Domain.Repositories.Interfaces
{
    public interface IBirthdayRepository : IGenericRepository<Birthday>
    {
        Task<string> GetOneTextAsync(object id);
    }
}
