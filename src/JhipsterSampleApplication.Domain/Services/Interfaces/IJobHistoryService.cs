using System;
using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using JhipsterSampleApplication.Domain.Entities;

namespace JhipsterSampleApplication.Domain.Services.Interfaces
{
    public interface IJobHistoryService
    {
        Task<JobHistory> Save(JobHistory jobHistory);

        Task<IPage<JobHistory>> FindAll(IPageable pageable);

        Task<JobHistory> FindOne(long? id);

        Task Delete(long? id);
    }
}
