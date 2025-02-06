using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Services.Interfaces
{
    public interface ILocationService
    {
        Task<Location> Save(Location location);

        Task<IPage<Location>> FindAll(IPageable pageable);

        Task<Location> FindOne(long? id);

        Task Delete(long? id);
    }
}
