using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Services.Interfaces
{
    public interface ITimeSheetEntryService
    {
        Task<TimeSheetEntry> Save(TimeSheetEntry timeSheetEntry);

        Task<IPage<TimeSheetEntry>> FindAll(IPageable pageable);

        Task<TimeSheetEntry> FindOne(long? id);

        Task Delete(long? id);
    }
}
