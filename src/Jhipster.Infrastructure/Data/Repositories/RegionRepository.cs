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
    public class RegionRepository : GenericRepository<Region>, IRegionRepository
    {
        public RegionRepository(IUnitOfWork context) : base(context) 
        {
        }

        public override async Task<Region> CreateOrUpdateAsync(Region region)
        {
            bool exists = await Exists(x => x.Id == region.Id);

            if (region.Id != 0 && exists) {
                Update(region);
            } else {
                Add(region);
            }

            return region;
        }
    }
}
