using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class BirthdayRepository : GenericRepository<Birthday>, IBirthdayRepository
    {
        public BirthdayRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Birthday> CreateOrUpdateAsync(Birthday birthday)
        {
            bool exists = await Exists(x => x.Id == birthday.Id);

            if (birthday.Id != "" && exists)
            {
                Update(birthday);
            }
            else
            {
                _context.AddOrUpdateGraph(birthday);
            }
            return birthday;
        }
    }
}
