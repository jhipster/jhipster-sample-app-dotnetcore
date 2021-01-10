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
    public class JobRepository : GenericRepository<Job>, IJobRepository
    {
        public JobRepository(IUnitOfWork context) : base(context)
        {
        }

        public override async Task<Job> CreateOrUpdateAsync(Job job)
        {
            bool exists = await Exists(x => x.Id == job.Id);

            await RemoveManyToManyRelationship("JobChores", "JobsId", "ChoresId", job.Id, job.Chores.Select(x => x.Id).ToList());

            if (job.Id != 0 && exists)
            {
                Update(job);
            }
            else
            {
                _context.AddOrUpdateGraph(job);
            }
            return job;
        }
    }
}
