using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain.Entities;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class ReadOnlyCountryRepository : ReadOnlyGenericRepository<Country, long>, IReadOnlyCountryRepository
    {
        public ReadOnlyCountryRepository(IUnitOfWork context) : base(context)
        {
        }
    }
}
