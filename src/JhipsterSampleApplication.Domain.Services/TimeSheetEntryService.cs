using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Services.Interfaces;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JhipsterSampleApplication.Domain.Services;

public class TimeSheetEntryService : ITimeSheetEntryService
{
    protected readonly ITimeSheetEntryRepository _timeSheetEntryRepository;

    public TimeSheetEntryService(ITimeSheetEntryRepository timeSheetEntryRepository)
    {
        _timeSheetEntryRepository = timeSheetEntryRepository;
    }

    public virtual async Task<TimeSheetEntry> Save(TimeSheetEntry timeSheetEntry)
    {
        await _timeSheetEntryRepository.CreateOrUpdateAsync(timeSheetEntry);
        await _timeSheetEntryRepository.SaveChangesAsync();
        return timeSheetEntry;
    }

    public virtual async Task<IPage<TimeSheetEntry>> FindAll(IPageable pageable)
    {
        var page = await _timeSheetEntryRepository.QueryHelper()
            .Include(timeSheetEntry => timeSheetEntry.TimeSheet)
            .GetPageAsync(pageable);
        return page;
    }

    public virtual async Task<TimeSheetEntry> FindOne(long? id)
    {
        var result = await _timeSheetEntryRepository.QueryHelper()
            .Include(timeSheetEntry => timeSheetEntry.TimeSheet)
            .GetOneAsync(timeSheetEntry => timeSheetEntry.Id == id);
        return result;
    }

    public virtual async Task Delete(long? id)
    {
        await _timeSheetEntryRepository.DeleteByIdAsync(id);
        await _timeSheetEntryRepository.SaveChangesAsync();
    }
}
