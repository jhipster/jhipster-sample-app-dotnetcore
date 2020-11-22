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

            if (jobHistory.Id != 0 && exists) {
                Update(jobHistory);
                /* Force the reference navigation property to be in "modified" state.
                This allows to modify it with a null value (the field is nullable).
                This takes into consideration the case of removing the association between the two instances. */
                _context.SetEntityStateModified(jobHistory, jobHistory0 => jobHistory0.Job);
                _context.SetEntityStateModified(jobHistory, jobHistory0 => jobHistory0.Department);
                _context.SetEntityStateModified(jobHistory, jobHistory0 => jobHistory0.Employee);
            } else {
                _context.AddGraph(jobHistory);
            }

            return jobHistory;
        }
    }
}
