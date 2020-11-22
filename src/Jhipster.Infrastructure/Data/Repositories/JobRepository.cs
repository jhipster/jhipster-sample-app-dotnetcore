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

            if (job.Id != 0 && exists) {
                await RemoveManyToManyRelationship("JobChores", "JobsId", "ChoresId", job.Id, job.Chores.Select(x => x.Id).ToList());
                Update(job);
                /* Force the reference navigation property to be in "modified" state.
                This allows to modify it with a null value (the field is nullable).
                This takes into consideration the case of removing the association between the two instances. */
                _context.SetEntityStateModified(job, job0 => job0.Employee);
            } else {
                _context.AddGraph(job);
            }

            return job;
        }
    }
}
