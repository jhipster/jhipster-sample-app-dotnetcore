using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;
using JhipsterSampleApplication.Domain.Services.Interfaces;
using JhipsterSampleApplication.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JhipsterSampleApplication.Domain.Services;

public class TimeSheetService : ITimeSheetService
{
    protected readonly ITimeSheetRepository _timeSheetRepository;

    public TimeSheetService(ITimeSheetRepository timeSheetRepository)
    {
        _timeSheetRepository = timeSheetRepository;
    }

    public virtual async Task<TimeSheet> Save(TimeSheet timeSheet)
    {
        await _timeSheetRepository.CreateOrUpdateAsync(timeSheet);
        await _timeSheetRepository.SaveChangesAsync();
        return timeSheet;
    }

    public virtual async Task<IPage<TimeSheet>> FindAll(IPageable pageable)
    {
        var page = await _timeSheetRepository.QueryHelper()
            .Include(timeSheet => timeSheet.Employee)
            .GetPageAsync(pageable);
        return page;
    }

    public virtual async Task<TimeSheet> FindOne(Guid? id)
    {
        var result = await _timeSheetRepository.QueryHelper()
            .Include(timeSheet => timeSheet.Employee)
            .GetOneAsync(timeSheet => timeSheet.Id == id);
        return result;
    }

    public virtual async Task Delete(Guid? id)
    {
        await _timeSheetRepository.DeleteByIdAsync(id);
        await _timeSheetRepository.SaveChangesAsync();
    }
}
