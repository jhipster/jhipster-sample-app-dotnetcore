using System.Threading.Tasks;
using JHipsterNet.Core.Pagination;
using Jhipster.Domain;

namespace Jhipster.Domain.Services.Interfaces
{
    public interface IJobHistoryService
    {
        Task<JobHistory> Save(JobHistory jobHistory);

        Task<IPage<JobHistory>> FindAll(IPageable pageable);

        Task<JobHistory> FindOne(long id);

        Task Delete(long id);
    }
}
