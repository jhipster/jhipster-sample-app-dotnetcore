using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Domain.Services
{
    public class LocationService : ILocationService
    {
        protected readonly ILocationRepository _locationRepository;

        public LocationService(ILocationRepository locationRepository)
        {
            _locationRepository = locationRepository;
        }

        public virtual async Task<Location> Save(Location location)
        {
            await _locationRepository.CreateOrUpdateAsync(location);
            await _locationRepository.SaveChangesAsync();
            return location;
        }

        public virtual async Task<IPage<Location>> FindAll(IPageable pageable)
        {
            var page = await _locationRepository.QueryHelper()
                .Include(location => location.Country)
                .GetPageAsync(pageable);
            return page;
        }

        public virtual async Task<Location> FindOne(long id)
        {
            var result = await _locationRepository.QueryHelper()
                .Include(location => location.Country)
                .GetOneAsync(location => location.Id == id);
            return result;
        }

        public virtual async Task Delete(long id)
        {
            await _locationRepository.DeleteByIdAsync(id);
            await _locationRepository.SaveChangesAsync();
        }
    }
}
