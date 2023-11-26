using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain.Entities;
using Jhipster.Domain.Services.Interfaces;
using Jhipster.Domain.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Jhipster.Domain.Services;

public class JobHistoryService : IJobHistoryService
{
    protected readonly IJobHistoryRepository _jobHistoryRepository;

    public JobHistoryService(IJobHistoryRepository jobHistoryRepository)
    {
        _jobHistoryRepository = jobHistoryRepository;
    }

    public virtual async Task<JobHistory> Save(JobHistory jobHistory)
    {
        await _jobHistoryRepository.CreateOrUpdateAsync(jobHistory);
        await _jobHistoryRepository.SaveChangesAsync();
        return jobHistory;
    }

    public virtual async Task<IPage<JobHistory>> FindAll(IPageable pageable)
    {
        var page = await _jobHistoryRepository.QueryHelper()
            .Include(jobHistory => jobHistory.Job)
            .Include(jobHistory => jobHistory.Department)
            .Include(jobHistory => jobHistory.Employee)
            .GetPageAsync(pageable);
        return page;
    }

    public virtual async Task<JobHistory> FindOne(long id)
    {
        var result = await _jobHistoryRepository.QueryHelper()
            .Include(jobHistory => jobHistory.Job)
            .Include(jobHistory => jobHistory.Department)
            .Include(jobHistory => jobHistory.Employee)
            .GetOneAsync(jobHistory => jobHistory.Id == id);
        return result;
    }

    public virtual async Task Delete(long id)
    {
        await _jobHistoryRepository.DeleteByIdAsync(id);
        await _jobHistoryRepository.SaveChangesAsync();
    }
}
