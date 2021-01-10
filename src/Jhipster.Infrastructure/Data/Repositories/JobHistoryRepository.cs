using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using JHipsterNet.Core.Pagination;
using JHipsterNet.Core.Pagination.Extensions;
using Jhipster.Domain;
using Jhipster.Domain.Repositories.Interfaces;
using Jhipster.Infrastructure.Data.Extensions;

namespace Jhipster.Infrastructure.Data.Repositories
{
    public class JobHistoryRepository : GenericRepository<JobHistory>, IJobHistoryRepository
    {
        public JobHistoryRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<JobHistory> CreateOrUpdateAsync(JobHistory jobHistory)
        {
            bool exists = await Exists(x => x.Id == jobHistory.Id);

            if (jobHistory.Id != 0 && exists)
            {
                Update(jobHistory);
            }
            else
            {
                _context.AddOrUpdateGraph(jobHistory);
            }
            return jobHistory;
        }
    }
}
