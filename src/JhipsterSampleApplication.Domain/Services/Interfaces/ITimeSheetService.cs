using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Services.Interfaces
{
    public interface ITimeSheetService
    {
        Task<TimeSheet> Save(TimeSheet timeSheet);

        Task<IPage<TimeSheet>> FindAll(IPageable pageable);

        Task<TimeSheet> FindOne(Guid? id);

        Task Delete(Guid? id);
    }
}
