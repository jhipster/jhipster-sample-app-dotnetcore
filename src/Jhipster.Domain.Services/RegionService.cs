using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain.Entities;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Domain.Services;

public class RegionService : IRegionService
{
    protected readonly IRegionRepository _regionRepository;

    public RegionService(IRegionRepository regionRepository)
    {
        _regionRepository = regionRepository;
    }

    public virtual async Task<Region> Save(Region region)
    {
        await _regionRepository.CreateOrUpdateAsync(region);
        await _regionRepository.SaveChangesAsync();
        return region;
    }

    public virtual async Task<IPage<Region>> FindAll(IPageable pageable)
    {
        var page = await _regionRepository.QueryHelper()
            .GetPageAsync(pageable);
        return page;
    }

    public virtual async Task<Region> FindOne(long id)
    {
        var result = await _regionRepository.QueryHelper()
            .GetOneAsync(region => region.Id == id);
        return result;
    }

    public virtual async Task Delete(long id)
    {
        await _regionRepository.DeleteByIdAsync(id);
        await _regionRepository.SaveChangesAsync();
    }
}
