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
    public class RulesetRepository : GenericRepository<Ruleset>, IRulesetRepository
    {
        public RulesetRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Ruleset> CreateOrUpdateAsync(Ruleset ruleset)
        {
            bool exists = await Exists(x => x.Id == ruleset.Id);

            if (ruleset.Id != 0 && exists)
            {
                Update(ruleset);
            }
            else
            {
                _context.AddOrUpdateGraph(ruleset);
            }
            return ruleset;
        }
    }
}
